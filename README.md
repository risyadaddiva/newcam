# ☕ Coffee New Cammary — Aplikasi Pemesanan Online

Aplikasi pemesanan online untuk Coffee New Cammary, Bandung.

## Fitur
- ✅ Pemesanan tanpa login (cukup nama & nomor HP)
- ✅ Menu lengkap: Coffee, Non-Coffee, Makanan
- Integrasi Google Maps + kalkulasi ongkir (Rp 2.500/km) dihapus. Ongkir akan dikonfirmasi admin via WhatsApp.
- ✅ Pembayaran QRIS (tampilkan barcode)
- ✅ Pembayaran Cash
- ✅ Konfirmasi otomatis via WhatsApp

---

## Setup & Instalasi

### 1. Install Dependencies
```bash
cd coffee-new-cammary
npm install
```

// Konfigurasi Google Maps API Key dihapus. Ongkir akan dikonfirmasi admin via WhatsApp.

Buat file `.env.local` (copy dari `.env.local.example`):
```bash
cp .env.local.example .env.local
```

Edit `.env.local` dan isi API key:
```
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY tidak diperlukan lagi.
```

// Cara mendapatkan Google Maps API Key dihapus.
1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru atau pilih yang sudah ada
3. Aktifkan API berikut:
// Maps JavaScript API tidak diperlukan lagi.
   - **Places API**
   - **Distance Matrix API**
4. Buat API Key di menu "Credentials"
5. (Opsional) Batasi domain untuk keamanan

### 3. Tambahkan Gambar QRIS

Letakkan file gambar QRIS Anda di:
```
public/qris.png
```

Format yang didukung: PNG, JPG, WEBP

### 4. Jalankan Aplikasi

**Mode Development:**
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

**Mode Production:**
```bash
npm run build
npm start
```

---

## Deployment

### Vercel (Rekomendasi)
1. Push ke GitHub
2. Import di [vercel.com](https://vercel.com)
// Environment Variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY tidak diperlukan lagi.
4. Deploy!

### VPS / Self-hosted
```bash
npm run build
npm start
# Jalankan di port 3000 dengan PM2 atau systemd
```

---

## Kustomisasi Menu

Edit file `lib/menu.js` untuk menambah/mengubah menu dan harga.

## Kustomisasi Info Toko

Edit variabel di `app/page.js`:
```js
const SHOP_WHATSAPP = '6285801611630';
const SHOP_ADDRESS = 'Jl. Manisi, Cipadung, Kec. Cibiru, Kota Bandung, Jawa Barat 40614';
```

// Komponen MapPicker telah dihapus.
```js
const SHOP_LOCATION = { lat: -6.9089, lng: 107.7231 };
```

---

## Struktur File

```
coffee-new-cammary/
├── app/
│   ├── layout.js         # Root layout
│   ├── page.js           # Halaman utama (semua step)
│   └── globals.css       # Style global
├── components/
// MapPicker.jsx telah dihapus.
├── lib/
│   └── menu.js           # Data menu
├── public/
│   └── qris.png          # ← Letakkan gambar QRIS di sini!
├── .env.local            # API keys (buat sendiri dari .env.local.example)
└── package.json
```
