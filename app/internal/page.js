"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Button from "@/components/pos/Button";
import Input from "@/components/pos/Input";
import Card from "@/components/pos/Card";
import Modal from "@/components/pos/Modal";
import Toast from "@/components/pos/Toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STAFF_LIST = ["Grace", "Fulki", "Umay", "Ibnu", "Akbar", "Risyad", "Warga"];

export default function InternalPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [cart, setCart] = useState([]);
  const [takenBy, setTakenBy] = useState("");
  const [note, setNote] = useState("");
  const [filterCat, setFilterCat] = useState("Semua");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("catat");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ takenBy: "", note: "" });
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);

  const fetchMenu = useCallback(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setMenuItems)
      .catch(() => {});
  }, []);

  const fetchRecords = useCallback(() => {
    fetch("/api/internal")
      .then((r) => r.json())
      .then(setRecords)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchRecords();
  }, [fetchMenu, fetchRecords]);

  const categories = [
    "Semua",
    ...Array.from(new Set(menuItems.map((m) => m.category))),
  ];

  const filtered = menuItems.filter((item) => {
    const matchCat = filterCat === "Semua" || item.category === filterCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c._id !== id));
      return;
    }
    setCart((prev) => prev.map((c) => (c._id === id ? { ...c, qty } : c)));
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c._id !== id));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const handleSave = async () => {
    if (!takenBy.trim()) {
      setToast({ message: "Nama pengambil wajib diisi", type: "error" });
      return;
    }
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
      })),
      takenBy: takenBy.trim(),
      note: note.trim(),
      total,
    };

    const res = await fetch("/api/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setToast({ message: "Catatan berhasil disimpan!", type: "success" });
      setCart([]);
      setTakenBy("");
      setNote("");
      fetchRecords();
    } else {
      setToast({ message: "Gagal menyimpan catatan", type: "error" });
    }
  };

  const openEditRecord = (record) => {
    setEditingRecord(record);
    setEditForm({ takenBy: record.takenBy, note: record.note || "" });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    const res = await fetch(`/api/internal/${editingRecord._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        takenBy: editForm.takenBy,
        note: editForm.note,
      }),
    });

    if (res.ok) {
      setToast({ message: "Catatan berhasil diperbarui", type: "success" });
      setEditModalOpen(false);
      setEditingRecord(null);
      fetchRecords();
    } else {
      setToast({ message: "Gagal memperbarui catatan", type: "error" });
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    const res = await fetch(`/api/internal/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: "Catatan berhasil dihapus", type: "success" });
      fetchRecords();
    } else {
      setToast({ message: "Gagal menghapus catatan", type: "error" });
    }
  };

  // Filtered records by date
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const rDate = new Date(r.createdAt).toISOString().split("T")[0];
      const matchFrom = dateFrom === "" || rDate >= dateFrom;
      const matchTo = dateTo === "" || rDate <= dateTo;
      return matchFrom && matchTo;
    });
  }, [records, dateFrom, dateTo]);

  // Chart data from filtered records
  const chartData = useMemo(() => {
    const itemMap = {};
    filteredRecords.forEach((r) => {
      r.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, qty: 0 };
        }
        itemMap[item.name].qty += item.qty;
      });
    });
    return Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [filteredRecords]);

  return (
    <div className="pb-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="font-display text-2xl font-bold text-cream">Internal</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("catat")}
            className={`px-4 py-2 rounded-lg text-sm font-body font-bold transition-all ${
              activeTab === "catat" ? "bg-gold text-espresso" : "bg-espresso-mid text-cream/60"
            }`}
          >
            Catat
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`px-4 py-2 rounded-lg text-sm font-body font-bold transition-all ${
              activeTab === "riwayat" ? "bg-gold text-espresso" : "bg-espresso-mid text-cream/60"
            }`}
          >
            Riwayat & Grafik
          </button>
        </div>
      </div>

      {activeTab === "catat" && (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
          {/* Menu Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
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

            <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3 content-start max-h-[60vh]">
              {filtered.map((item) => (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="card-coffee text-left cursor-pointer"
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
                  <p className="text-gold font-bold text-sm mt-2">
                    {fmt(item.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Panel */}
          <div className="w-full lg:w-96 bg-espresso-light border border-gold/10 rounded-xl flex flex-col overflow-hidden h-[500px] lg:h-auto mt-4 lg:mt-0">
            <div className="p-4 border-b border-gold/10">
              <h2 className="text-lg font-display font-bold text-cream">
                Catatan Internal
              </h2>
            </div>

            <div className="p-4 space-y-3 border-b border-gold/10">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-body font-bold uppercase tracking-widest text-cream/70">Pengambil *</label>
                <select
                  value={takenBy}
                  onChange={(e) => setTakenBy(e.target.value)}
                  className="input-coffee"
                >
                  <option value="" disabled>Pilih Pengambil</option>
                  {STAFF_LIST.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Catatan (Opsional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-cream/30 text-sm text-center mt-8 font-body">
                  Belum ada item
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
              <div className="flex justify-between text-lg font-bold text-gold font-display">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
              <Button
                className="w-full mt-3"
                size="lg"
                disabled={cart.length === 0}
                onClick={handleSave}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "riwayat" && (
        <div className="space-y-6 animate-fade-in">
          {/* Date Filter */}
          <div className="flex flex-col md:flex-row gap-4 bg-espresso-mid p-4 rounded-xl border border-gold/10">
            <div className="flex-1">
              <label className="block text-xs font-bold text-cream/70 uppercase tracking-widest mb-1.5">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  if (dateTo && e.target.value > dateTo) setDateTo(e.target.value);
                }}
                className="input-coffee w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-cream/70 uppercase tracking-widest mb-1.5">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  if (dateFrom && e.target.value < dateFrom) setDateFrom(e.target.value);
                }}
                min={dateFrom}
                className="input-coffee w-full"
              />
            </div>
          </div>

          {/* Chart */}
          <Card>
            <h2 className="text-lg font-display font-bold text-gold mb-6">
              Item Internal Terbanyak
            </h2>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#C9880C" opacity={0.1} />
                    <XAxis
                      dataKey="name"
                      stroke="#C9880C"
                      opacity={0.5}
                      tick={{ fill: "#F5E6CE", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis stroke="#C9880C" opacity={0.5} tick={{ fill: "#F5E6CE", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "#C9880C", opacity: 0.1 }}
                      contentStyle={{ backgroundColor: "#2A1612", borderColor: "#C9880C", color: "#F5E6CE" }}
                    />
                    <Bar dataKey="qty" fill="#C9880C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-cream/40 font-body">
                  Tidak ada data
                </div>
              )}
            </div>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden">
            <h2 className="text-lg font-display font-bold text-gold mb-4">
              Riwayat Catatan Internal
            </h2>
            {filteredRecords.length === 0 ? (
              <p className="text-cream/30 text-sm font-body text-center py-8">
                Belum ada catatan pada filter ini
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body text-left whitespace-nowrap">
                  <thead>
                    <tr className="text-cream/40 border-b border-gold/10">
                      <th className="py-3 px-2">Waktu</th>
                      <th className="py-3 px-2">Pengambil</th>
                      <th className="py-3 px-2">Item</th>
                      <th className="py-3 px-2">Total</th>
                      <th className="py-3 px-2">Catatan</th>
                      <th className="py-3 px-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r._id} className="border-b border-gold/5 text-cream hover:bg-espresso-light/50 transition-colors">
                        <td className="py-3 px-2 text-cream/70">
                          {new Date(r.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-2 font-medium">{r.takenBy}</td>
                        <td className="py-3 px-2 text-cream/70">
                          {r.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                        </td>
                        <td className="py-3 px-2 text-gold font-bold">{fmt(r.total)}</td>
                        <td className="py-3 px-2 text-cream/50 max-w-[150px] truncate">
                          {r.note || "-"}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="secondary" onClick={() => openEditRecord(r)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteRecord(r._id)}>
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Catatan">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-body font-bold uppercase tracking-widest text-cream/70">Pengambil</label>
            <select
              value={editForm.takenBy}
              onChange={(e) => setEditForm({ ...editForm, takenBy: e.target.value })}
              className="input-coffee"
              required
            >
              <option value="" disabled>Pilih Pengambil</option>
              {STAFF_LIST.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Catatan"
            value={editForm.note}
            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
          />
          {editingRecord && (
            <div className="border-t border-gold/10 pt-3">
              <p className="text-xs font-bold uppercase text-gold tracking-widest mb-2">Item</p>
              {editingRecord.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm font-body text-cream/70">
                  <span>{item.name} <span className="text-cream/40">x{item.qty}</span></span>
                  <span>{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
