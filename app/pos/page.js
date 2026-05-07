"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Button from "@/components/pos/Button";
import Input from "@/components/pos/Input";
import Modal from "@/components/pos/Modal";
import Toast from "@/components/pos/Toast";
import { buildReceipt, printViaBluetooth } from "@/lib/receipt";

export default function POSPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterCat, setFilterCat] = useState("Semua");
  const [search, setSearch] = useState("");

  // Variant modal
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [itemNote, setItemNote] = useState("");

  // Open bills
  const [openBills, setOpenBills] = useState([]);
  const [showBills, setShowBills] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);

  const fetchMenu = useCallback(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setMenuItems)
      .catch(() => {});
  }, []);

  const fetchOpenBills = useCallback(() => {
    fetch("/api/openbills")
      .then((r) => r.json())
      .then(setOpenBills)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchOpenBills();
  }, [fetchMenu, fetchOpenBills]);

  const categories = [
    "Semua",
    ...Array.from(new Set(menuItems.map((m) => m.category))),
  ];

  const filtered = menuItems.filter((item) => {
    const matchCat = filterCat === "Semua" || item.category === filterCat;
    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleMenuClick = (item) => {
    if (item.stock < 1) {
      setToast({ message: "Stok habis", type: "error" });
      return;
    }
    if (item.variants && item.variants.length > 0) {
      setPendingItem(item);
      const defaults = {};
      item.variants.forEach((v) => {
        const options = v.split("/");
        defaults[v] = options[0];
      });
      setSelectedVariants(defaults);
      setItemNote("");
      setVariantModalOpen(true);
    } else {
      setPendingItem(item);
      setSelectedVariants({});
      setItemNote("");
      setVariantModalOpen(true);
    }
  };

  const confirmAddToCart = () => {
    if (!pendingItem) return;
    const item = pendingItem;
    const variantStr = Object.values(selectedVariants).join(", ");
    const cartKey = `${item._id}_${variantStr}_${itemNote}`;

    setCart((prev) => {
      const existing = prev.find((c) => c.cartKey === cartKey);
      if (existing) {
        if (existing.qty >= item.stock) {
          setToast({ message: "Stok tidak mencukupi", type: "error" });
          return prev;
        }
        return prev.map((c) =>
          c.cartKey === cartKey ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [
        ...prev,
        {
          ...item,
          cartKey,
          qty: 1,
          variant: variantStr,
          note: itemNote,
        },
      ];
    });
    setVariantModalOpen(false);
    setPendingItem(null);
  };

  const updateQty = (cartKey, qty) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
      return;
    }
    const cartItem = cart.find((c) => c.cartKey === cartKey);
    if (cartItem) {
      const menuItem = menuItems.find((m) => m._id === cartItem._id);
      if (menuItem && qty > menuItem.stock) {
        setToast({ message: "Stok tidak mencukupi", type: "error" });
        return;
      }
    }
    setCart((prev) =>
      prev.map((c) => (c.cartKey === cartKey ? { ...c, qty } : c))
    );
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const total = subtotal;
  const paid = Number(amountPaid) || 0;
  const change = paymentMethod === "qris" ? 0 : Math.max(0, paid - total);

  const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  // --- Open Bill handlers ---
  const handleSaveOpenBill = async () => {
    if (cart.length === 0) {
      setToast({ message: "Keranjang kosong", type: "error" });
      return;
    }
    const payload = {
      items: cart.map((c) => ({
        menuItem: c._id,
        name: c.name,
        price: c.price,
        qty: c.qty,
        variant: c.variant || "",
        note: c.note || "",
      })),
      customerName,
      customerPhone,
      subtotal,
      total,
    };

    if (editingBillId) {
      const res = await fetch(`/api/openbills/${editingBillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setToast({ message: "Open bill diperbarui!", type: "success" });
        setEditingBillId(null);
      } else {
        setToast({ message: "Gagal memperbarui open bill", type: "error" });
        return;
      }
    } else {
      const res = await fetch("/api/openbills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setToast({ message: "Pesanan disimpan sebagai Open Bill!", type: "success" });
      } else {
        setToast({ message: "Gagal menyimpan open bill", type: "error" });
        return;
      }
    }
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    fetchOpenBills();
  };

  const handleResumeBill = (bill) => {
    setCart(
      bill.items.map((item) => ({
        ...item,
        _id: item.menuItem,
        cartKey: `${item.menuItem}_${item.variant || ""}_${item.note || ""}`,
      }))
    );
    setCustomerName(bill.customerName || "");
    setCustomerPhone(bill.customerPhone || "");
    setEditingBillId(bill._id);
    setShowBills(false);
  };

  const handleDeleteBill = async (id) => {
    if (!confirm("Yakin ingin menghapus open bill ini?")) return;
    const res = await fetch(`/api/openbills/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: "Open bill dihapus", type: "success" });
      fetchOpenBills();
    }
  };

  // --- Payment ---
  const handlePayment = async () => {
    if (paymentMethod === "cash" && paid < total) {
      setToast({ message: "Jumlah bayar kurang", type: "error" });
      return;
    }

    const finalPaid = paymentMethod === "qris" ? total : paid;

    const txnPayload = {
      items: cart.map((c) => ({
        menuItem: c._id,
        name: c.name,
        price: c.price,
        qty: c.qty,
        variant: c.variant || "",
        note: c.note || "",
      })),
      customerName,
      customerPhone,
      subtotal,
      tax: 0,
      total,
      paymentMethod,
      amountPaid: finalPaid,
      change: paymentMethod === "qris" ? 0 : finalPaid - total,
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txnPayload),
    });

    if (res.ok) {
      if (editingBillId) {
        await fetch(`/api/openbills/${editingBillId}`, { method: "DELETE" });
        setEditingBillId(null);
        fetchOpenBills();
      }
      setToast({ message: "Pembayaran berhasil!", type: "success" });
      setPayModalOpen(false);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setAmountPaid("");
      fetchMenu();
    } else {
      setToast({ message: "Gagal memproses pembayaran", type: "error" });
    }
  };

  const handlePrint = async () => {
    try {
      const finalPaid = paymentMethod === "qris" ? total : paid;
      const receiptBytes = await buildReceipt({
        items: cart,
        customerName,
        customerPhone,
        subtotal,
        tax: 0,
        total,
        paymentMethod,
        amountPaid: finalPaid,
        change: paymentMethod === "qris" ? 0 : finalPaid - total,
      });
      await printViaBluetooth(receiptBytes);
      setToast({ message: "Struk berhasil dicetak!", type: "success" });
    } catch {
      setToast({
        message: "Gagal mencetak. Pastikan printer Bluetooth terhubung.",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-4rem)]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Menu Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold text-cream">Kasir</h1>
          <button
            onClick={() => setShowBills(!showBills)}
            className="relative px-4 py-2 rounded-lg text-sm font-body font-bold bg-espresso-mid text-cream/60 hover:bg-espresso-light hover:text-cream border border-gold/10 transition-all cursor-pointer"
          >
            📋 Open Bill
            {openBills.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-espresso text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {openBills.length}
              </span>
            )}
          </button>
        </div>

        {showBills ? (
          <div className="flex-1 overflow-y-auto space-y-3 animate-fade-in">
            <h2 className="text-lg font-display font-bold text-gold mb-2">Pesanan Tersimpan</h2>
            {openBills.length === 0 ? (
              <p className="text-cream/30 text-sm font-body text-center mt-8">
                Tidak ada open bill
              </p>
            ) : (
              openBills.map((bill) => (
                <div
                  key={bill._id}
                  className="card-coffee"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-body font-semibold text-cream">
                        {bill.customerName || "Tanpa Nama"}
                      </p>
                      <p className="text-xs text-cream/40 font-body">
                        {new Date(bill.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-gold font-bold font-display">{fmt(bill.total)}</p>
                  </div>
                  <p className="text-xs text-cream/50 font-body mb-3">
                    {bill.items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.qty}`).join(", ")}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleResumeBill(bill)}>
                      Lanjutkan
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteBill(bill._id)}>
                      Hapus
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-4">
              <Input
                placeholder="Cari menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-bold whitespace-nowrap transition-all cursor-pointer ${
                    filterCat === cat
                      ? "bg-gold text-espresso"
                      : "bg-espresso-mid text-cream/40 hover:bg-espresso-light hover:text-cream/60 border border-gold/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3 content-start">
              {filtered.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleMenuClick(item)}
                  disabled={item.stock < 1}
                  className="card-coffee text-left disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  {item.image && (
                    <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-espresso">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="font-body font-semibold text-cream text-sm">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-cream/30 font-body">
                    {item.category}
                  </p>
                  {item.variants && item.variants.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.variants.map((v) => (
                        <span key={v} className="text-[10px] px-1 py-0.5 rounded bg-gold/10 text-gold/60 font-body">{v}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gold font-bold text-sm">{fmt(item.price)}</p>
                    <span
                      className={`text-[10px] font-body ${
                        item.stock < 10 ? "text-red-400" : "text-cream/30"
                      }`}
                    >
                      {item.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-96 bg-espresso-light border border-gold/10 rounded-xl flex flex-col overflow-hidden h-[500px] lg:h-auto mt-4 lg:mt-0">
        <div className="p-4 border-b border-gold/10 flex justify-between items-center">
          <h2 className="text-lg font-display font-bold text-cream">
            {editingBillId ? "Edit Open Bill" : "Keranjang"}
          </h2>
          {editingBillId && (
            <button
              onClick={() => {
                setEditingBillId(null);
                setCart([]);
                setCustomerName("");
                setCustomerPhone("");
              }}
              className="text-xs text-cream/40 hover:text-cream font-body cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>

        <div className="p-4 space-y-3 border-b border-gold/10">
          <Input
            placeholder="Nama Pelanggan (Opsional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            placeholder="No. HP (Opsional)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-cream/30 text-sm text-center mt-8 font-body">
              Keranjang kosong
            </p>
          ) : (
            cart.map((item) => (
              <div key={item.cartKey} className="bg-espresso/50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-cream truncate">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-[10px] text-gold/60 font-body">{item.variant}</p>
                    )}
                    {item.note && (
                      <p className="text-[10px] text-cream/30 font-body italic">📝 {item.note}</p>
                    )}
                    <p className="text-xs text-cream/40 font-body">
                      {fmt(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartKey)}
                    className="text-cream/30 hover:text-red-400 text-sm ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty - 1)}
                      className="w-7 h-7 rounded bg-espresso-mid text-cream/60 hover:bg-espresso hover:text-cream text-sm cursor-pointer border border-gold/10"
                    >
                      -
                    </button>
                    <span className="text-sm w-8 text-center text-cream font-body">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty + 1)}
                      className="w-7 h-7 rounded bg-espresso-mid text-cream/60 hover:bg-espresso hover:text-cream text-sm cursor-pointer border border-gold/10"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-body font-medium text-gold">
                    {fmt(item.price * item.qty)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gold/10 p-4 space-y-2">
          <div className="flex justify-between text-sm text-cream/50 font-body">
            <span>Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-gold pt-2 border-t border-gold/10 font-display">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              className="flex-1"
              variant="secondary"
              disabled={cart.length === 0}
              onClick={handleSaveOpenBill}
            >
              {editingBillId ? "Update Bill" : "Simpan"}
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={cart.length === 0}
              onClick={() => {
                setAmountPaid("");
                setPayModalOpen(true);
              }}
            >
              Bayar
            </Button>
          </div>
        </div>
      </div>

      {/* Variant / Note Modal */}
      <Modal
        open={variantModalOpen}
        onClose={() => {
          setVariantModalOpen(false);
          setPendingItem(null);
        }}
        title={pendingItem ? `Tambah: ${pendingItem.name}` : "Tambah Item"}
      >
        {pendingItem && (
          <div className="space-y-4">
            {pendingItem.variants &&
              pendingItem.variants.length > 0 &&
              pendingItem.variants.map((v) => {
                const options = v.split("/");
                return (
                  <div key={v}>
                    <label className="text-xs font-body font-bold uppercase tracking-widest text-cream/70 mb-1.5 block">
                      {v} *
                    </label>
                    <div className="flex gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setSelectedVariants({ ...selectedVariants, [v]: opt.trim() })
                          }
                          className={`flex-1 py-2 rounded-lg text-sm font-body font-bold transition-all cursor-pointer ${
                            selectedVariants[v] === opt.trim()
                              ? "bg-gold text-espresso"
                              : "bg-espresso-mid text-cream/40 hover:bg-espresso border border-gold/10"
                          }`}
                        >
                          {opt.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            <Input
              label="Catatan (Opsional)"
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              placeholder="Misal: less sugar, extra shot..."
            />
            <Button className="w-full" onClick={confirmAddToCart}>
              Tambah ke Keranjang
            </Button>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Pembayaran"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
              Total Tagihan
            </p>
            <p className="text-3xl font-bold text-gold font-display">
              {fmt(total)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 py-3 rounded-lg text-sm font-body font-bold transition-all cursor-pointer ${
                paymentMethod === "cash"
                  ? "bg-gold text-espresso"
                  : "bg-espresso-mid text-cream/40 hover:bg-espresso border border-gold/10"
              }`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => setPaymentMethod("qris")}
              className={`flex-1 py-3 rounded-lg text-sm font-body font-bold transition-all cursor-pointer ${
                paymentMethod === "qris"
                  ? "bg-gold text-espresso"
                  : "bg-espresso-mid text-cream/40 hover:bg-espresso border border-gold/10"
              }`}
            >
              📱 QRIS
            </button>
          </div>

          {paymentMethod === "cash" && (
            <>
              <Input
                label="Jumlah Bayar"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0"
                min="0"
              />
              <div className="flex flex-wrap gap-2">
                {[total, 50000, 100000, 200000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmountPaid(String(v))}
                    className="px-3 py-1.5 bg-espresso-mid text-cream/60 rounded-lg text-sm font-body hover:bg-espresso border border-gold/10 cursor-pointer"
                  >
                    {fmt(v)}
                  </button>
                ))}
              </div>
              {paid >= total && (
                <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-400 font-body">Kembalian</p>
                  <p className="text-xl font-bold text-green-300 font-display">
                    {fmt(change)}
                  </p>
                </div>
              )}
            </>
          )}

          {paymentMethod === "qris" && (
            <div className="bg-espresso rounded-lg p-6 text-center">
              <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden">
                <Image
                  src="/qris.png"
                  alt="QRIS"
                  width={192}
                  height={192}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-cream/40 text-sm mt-3 font-body">
                Scan QRIS untuk membayar
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handlePrint}
              disabled={cart.length === 0}
            >
              🖨️ Cetak Struk
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={
                cart.length === 0 ||
                (paymentMethod === "cash" && paid < total)
              }
            >
              Konfirmasi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
