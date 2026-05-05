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

  const fetchMenu = useCallback(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setMenuItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

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

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        if (existing.qty >= item.stock) {
          setToast({ message: "Stok tidak mencukupi", type: "error" });
          return prev;
        }
        return prev.map((c) =>
          c._id === item._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      if (item.stock < 1) {
        setToast({ message: "Stok habis", type: "error" });
        return prev;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c._id !== id));
      return;
    }
    const item = menuItems.find((m) => m._id === id);
    if (item && qty > item.stock) {
      setToast({ message: "Stok tidak mencukupi", type: "error" });
      return;
    }
    setCart((prev) => prev.map((c) => (c._id === id ? { ...c, qty } : c)));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c._id !== id));
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
        <h1 className="font-display text-2xl font-bold text-cream mb-4">
          Kasir
        </h1>

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
              onClick={() => addToCart(item)}
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
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-96 bg-espresso-light border border-gold/10 rounded-xl flex flex-col overflow-hidden h-[500px] lg:h-auto mt-4 lg:mt-0">
        <div className="p-4 border-b border-gold/10">
          <h2 className="text-lg font-display font-bold text-cream">
            Keranjang
          </h2>
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
              <div key={item._id} className="bg-espresso/50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-cream truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-cream/40 font-body">
                      {fmt(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-cream/30 hover:text-red-400 text-sm ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      className="w-7 h-7 rounded bg-espresso-mid text-cream/60 hover:bg-espresso hover:text-cream text-sm cursor-pointer border border-gold/10"
                    >
                      -
                    </button>
                    <span className="text-sm w-8 text-center text-cream font-body">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1)}
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
          <Button
            className="w-full mt-3"
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
