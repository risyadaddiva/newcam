"use client";

import { useEffect, useState } from "react";
import Card from "@/components/pos/Card";

export default function DashboardPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [transactions, setTransactions] = useState([]);

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

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const todayTxns = transactions.filter(
    (t) => new Date(t.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayTxns.reduce((sum, t) => sum + t.total, 0);
  const lowStock = menuItems.filter((m) => m.stock < 10);

  const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
            Total Pendapatan
          </p>
          <p className="text-2xl font-bold text-gold mt-1">{fmt(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
            Pendapatan Hari Ini
          </p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {fmt(todayRevenue)}
          </p>
        </Card>
        <Card>
          <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
            Transaksi Hari Ini
          </p>
          <p className="text-2xl font-bold text-cream mt-1">
            {todayTxns.length}
          </p>
        </Card>
        <Card>
          <p className="text-cream/50 text-xs font-body uppercase tracking-widest">
            Menu Items
          </p>
          <p className="text-2xl font-bold text-cream mt-1">
            {menuItems.length}
          </p>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-lg font-display font-bold text-gold mb-3">
            ⚠️ Stok Rendah
          </h2>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center text-sm font-body"
              >
                <span className="text-cream/70">{item.name}</span>
                <span className="text-red-400 font-medium">
                  Sisa: {item.stock}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-display font-bold text-gold mb-3">
          Transaksi Terakhir
        </h2>
        {transactions.length === 0 ? (
          <p className="text-cream/30 text-sm font-body">
            Belum ada transaksi
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-cream/40 border-b border-gold/10">
                  <th className="text-left py-2">Waktu</th>
                  <th className="text-left py-2">Pelanggan</th>
                  <th className="text-left py-2">Items</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-left py-2">Bayar</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-gold/5 text-cream/70"
                  >
                    <td className="py-2">
                      {new Date(t.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2">{t.customerName || "-"}</td>
                    <td className="py-2">{t.items.length} item</td>
                    <td className="py-2 text-right font-medium text-gold">
                      {fmt(t.total)}
                    </td>
                    <td className="py-2 uppercase">{t.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
