"use client";

import { useEffect, useState, useMemo } from "react";
import Card from "@/components/pos/Card";
import Input from "@/components/pos/Input";
import Button from "@/components/pos/Button";
import Modal from "@/components/pos/Modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setMenuItems)
      .catch(() => {});
    fetch("/api/transactions")
      .then((r) => r.json())
      .then(setTransactions)
      .catch(() => {});
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  // Apply Filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Date Range Filter
      const tDate = new Date(t.createdAt).toISOString().split("T")[0];
      const matchFrom = dateFrom === "" || tDate >= dateFrom;
      const matchTo = dateTo === "" || tDate <= dateTo;

      // Payment Filter
      const matchPayment = paymentFilter === "all" || t.paymentMethod === paymentFilter;

      return matchFrom && matchTo && matchPayment;
    });
  }, [transactions, dateFrom, dateTo, paymentFilter]);

  // Derived Stats
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTxns = filteredTransactions.length;
  const lowStock = menuItems.filter((m) => m.stock < 10);

  // Chart Data
  const chartData = useMemo(() => {
    const itemMap = {};
    filteredTransactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, qty: 0 };
        }
        itemMap[item.name].qty += item.qty;
      });
    });
    return Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 10); // Top 10
  }, [filteredTransactions]);

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="font-display text-2xl font-bold text-cream">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("ringkasan")}
            className={`px-4 py-2 rounded-lg text-sm font-body font-bold transition-all ${
              activeTab === "ringkasan" ? "bg-gold text-espresso" : "bg-espresso-mid text-cream/60"
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`px-4 py-2 rounded-lg text-sm font-body font-bold transition-all ${
              activeTab === "riwayat" ? "bg-gold text-espresso" : "bg-espresso-mid text-cream/60"
            }`}
          >
            Riwayat Pesanan
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-espresso-mid p-4 rounded-xl border border-gold/10">
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
        <div className="flex-1">
          <label className="block text-xs font-bold text-cream/70 uppercase tracking-widest mb-1.5">
            Filter Pembayaran
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input-coffee w-full"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Cash</option>
            <option value="qris">QRIS</option>
          </select>
        </div>
      </div>

      {activeTab === "ringkasan" && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
                Pendapatan
              </p>
              <p className="text-2xl font-bold text-green-400 mt-1">{fmt(totalRevenue)}</p>
            </Card>
            <Card>
              <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
                Jumlah Transaksi
              </p>
              <p className="text-2xl font-bold text-cream mt-1">{totalTxns}</p>
            </Card>
            <Card>
              <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
                Menu Terjual
              </p>
              <p className="text-2xl font-bold text-cream mt-1">
                {chartData.reduce((sum, i) => sum + i.qty, 0)} Porsi
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-display font-bold text-gold mb-6">
              Menu Terlaris (Berdasarkan Filter)
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
                      tick={{ fill: '#F5E6CE', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis stroke="#C9880C" opacity={0.5} tick={{ fill: '#F5E6CE', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#C9880C', opacity: 0.1 }}
                      contentStyle={{ backgroundColor: '#2A1612', borderColor: '#C9880C', color: '#F5E6CE' }}
                    />
                    <Bar dataKey="qty" fill="#C9880C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-cream/40 font-body">
                  Tidak ada data penjualan
                </div>
              )}
            </div>
          </Card>

          {lowStock.length > 0 && (
            <Card>
              <h2 className="text-lg font-display font-bold text-gold mb-3">
                ⚠️ Stok Rendah
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lowStock.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center p-3 rounded-lg bg-red-900/10 border border-red-900/30 text-sm font-body"
                  >
                    <span className="text-cream/70 truncate mr-2">{item.name}</span>
                    <span className="text-red-400 font-bold whitespace-nowrap">
                      Sisa: {item.stock}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "riwayat" && (
        <Card className="animate-fade-in overflow-hidden">
          <h2 className="text-lg font-display font-bold text-gold mb-4">
            Riwayat Pesanan (Selesai)
          </h2>
          {filteredTransactions.length === 0 ? (
            <p className="text-cream/30 text-sm font-body text-center py-8">
              Belum ada pesanan pada filter ini
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body text-left whitespace-nowrap">
                <thead>
                  <tr className="text-cream/40 border-b border-gold/10">
                    <th className="py-3 px-2">Waktu</th>
                    <th className="py-3 px-2">Pelanggan</th>
                    <th className="py-3 px-2">Total</th>
                    <th className="py-3 px-2">Bayar</th>
                    <th className="py-3 px-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t._id} className="border-b border-gold/5 text-cream hover:bg-espresso-light/50 transition-colors">
                      <td className="py-3 px-2 text-cream/70">
                        {new Date(t.createdAt).toLocaleString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-2 font-medium">{t.customerName || "-"}</td>
                      <td className="py-3 px-2 text-gold font-bold">{fmt(t.total)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          t.paymentMethod === 'qris' ? 'bg-blue-900/30 text-blue-300' : 'bg-green-900/30 text-green-300'
                        }`}>
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedTxn(t)}>
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="Detail Transaksi">
        {selectedTxn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm font-body text-cream/70">
              <p>Tanggal: <span className="text-cream">{new Date(selectedTxn.createdAt).toLocaleString("id-ID")}</span></p>
              <p>Kasir: <span className="text-cream">Admin</span></p>
              <p>Pelanggan: <span className="text-cream">{selectedTxn.customerName || "-"}</span></p>
              <p>Metode Bayar: <span className="text-cream uppercase">{selectedTxn.paymentMethod}</span></p>
            </div>
            
            <div className="border-t border-b border-gold/10 py-3 space-y-2">
              <p className="text-xs font-bold uppercase text-gold tracking-widest mb-2">Item Dibeli</p>
              {selectedTxn.items.map((item, idx) => (
                <div key={idx} className="text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-cream">
                      {item.name}
                      {item.variant && <span className="text-gold/60 text-xs ml-1">({item.variant})</span>}
                      <span className="text-cream/50 text-xs ml-1">x{item.qty}</span>
                    </span>
                    <span className="text-cream/70">{fmt(item.price * item.qty)}</span>
                  </div>
                  {item.note && (
                    <p className="text-cream/40 text-xs italic ml-2">📝 {item.note}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-lg font-bold font-display text-gold">
              <span>Total Tagihan</span>
              <span>{fmt(selectedTxn.total)}</span>
            </div>

            <Button className="w-full mt-4" onClick={() => setSelectedTxn(null)}>Tutup</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
