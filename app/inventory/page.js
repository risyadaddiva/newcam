"use client";

import { useEffect, useState, useCallback } from "react";
import Button from "@/components/pos/Button";
import Card from "@/components/pos/Card";
import Modal from "@/components/pos/Modal";
import Input from "@/components/pos/Input";
import Toast from "@/components/pos/Toast";

const CATEGORIES = [
  "Kopi",
  "Non-Kopi",
  "Makanan",
  "Snack",
  "Minuman Dingin",
  "Signature",
  "Mocktail",
  "Lainnya",
];

const emptyForm = {
  name: "",
  price: "",
  category: CATEGORIES[0],
  stock: "",
  image: "",
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      stock: String(item.stock),
      image: item.image,
    });
    setEditingId(item._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      stock: Number(form.stock),
      image: form.image,
    };

    const url = editingId ? `/api/menu/${editingId}` : "/api/menu";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setToast({
        message: editingId
          ? "Menu berhasil diperbarui"
          : "Menu berhasil ditambahkan",
        type: "success",
      });
      setModalOpen(false);
      fetchItems();
    } else {
      setToast({ message: "Gagal menyimpan menu", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: "Menu berhasil dihapus", type: "success" });
      fetchItems();
    }
  };

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-cream">
          Manajemen Menu
        </h1>
        <Button onClick={openAdd}>+ Tambah Menu</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item._id}>
            {item.image && (
              <div className="w-full h-40 mb-3 rounded-lg overflow-hidden bg-espresso">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-body font-semibold text-cream">
                  {item.name}
                </h3>
                <p className="text-sm text-cream/40 font-body">
                  {item.category}
                </p>
                <p className="text-lg font-bold text-gold mt-1">
                  {fmt(item.price)}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-body font-bold ${
                  item.stock < 10
                    ? "bg-red-900/50 text-red-300"
                    : "bg-green-900/50 text-green-300"
                }`}
              >
                Stok: {item.stock}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openEdit(item)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(item._id)}
              >
                Hapus
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-cream/30 mt-12 font-body">
          {items.length === 0
            ? 'Belum ada menu. Klik "+ Tambah Menu" untuk menambahkan.'
            : "Tidak ada menu yang cocok."}
        </p>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Menu" : "Tambah Menu"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Menu"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Harga (IDR)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            min="0"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-body font-bold uppercase tracking-widest text-cream/70">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-coffee"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Stok"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            min="0"
          />
          <Input
            label="URL Foto (Opsional)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://example.com/photo.jpg"
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit">{editingId ? "Simpan" : "Tambah"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
