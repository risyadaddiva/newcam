'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { menuCategories, formatRupiah } from '@/lib/menu';
// MapPicker dihapus, ongkir akan dikonfirmasi admin via WhatsApp

const SHOP_WHATSAPP = '6285801611630';
const SHOP_ADDRESS = 'Jl. Manisi, Cipadung, Kec. Cibiru, Kota Bandung, Jawa Barat 40614';
const SHOP_INSTAGRAM = 'coffee_newcammary';
const STEPS = [
  { id: 1, label: 'Info' },
  { id: 2, label: 'Menu' },
  { id: 3, label: 'Pengiriman' },
  { id: 4, label: 'Pembayaran' },
];

const TAG_COLORS = {
  'Best Seller': 'bg-gold/20 text-gold',
  Favorit: 'bg-amber-700/30 text-amber-400',
  Rekomendasi: 'bg-blue-900/30 text-blue-300',
  New: 'bg-green-900/30 text-green-400',
  Populer: 'bg-purple-900/30 text-purple-300',
  Signature: 'bg-rose-900/30 text-rose-300',
};

function buildWhatsAppMessage({ customer, cart, deliveryType, paymentMethod, total }) {
  const itemLines = cart
    .map((item) => `  • ${item.name} x${item.qty} = ${formatRupiah(item.price * item.qty)}`)
    .join('\n');

  const deliveryLine =
    deliveryType === 'delivery'
      ? `🚚 Delivery (alamat nya aku kirim habis ini)`
      : '🏠 Pickup di kedai';

  const paymentLine =
    paymentMethod === 'qris'
      ? '💳 QRIS (bukti bayar abis ini dikirim)'
      : '💵 Cash (bayar di kedai/kurir)';

  return `Halo Coffee New Cammary! 👋

Saya ${customer.name} mau order nih. Berikut detail pesanan saya:

*Pesanan:*
${itemLines}

${deliveryLine}

${paymentLine}

────────────────────
*TOTAL: ${formatRupiah(total)}*
────────────────────

Mohon konfirmasi pesanan saya. Terima kasih! 🙏`;
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div className={`step-dot ${
              currentStep === step.id ? 'active shadow-[0_0_12px_rgba(201,136,12,0.5)]'
                : currentStep > step.id ? 'completed' : 'inactive'
            }`}>
              {currentStep > step.id ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : step.id}
            </div>
            <span className={`text-[10px] font-body font-bold tracking-wide ${
              currentStep === step.id ? 'text-gold' : currentStep > step.id ? 'text-gold/50' : 'text-cream/20'
            }`}>{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-10 h-px mb-5 ${currentStep > step.id ? 'bg-gold/40' : 'bg-cream/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1CustomerInfo({ customer, onChange, onNext }) {
  const isValid = customer.name.trim().length >= 2;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center pb-4">
        <div className="mb-4 flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold/30">
            <Image
              src="/menu/logo newcam.jpeg"
              alt="Coffee New Cammary Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="font-display text-4xl font-bold text-cream leading-tight">
          Coffee New<br />
          <span className="text-gold italic">Cammary</span>
        </h1>
        <p className="text-cream/50 text-sm font-body mt-2">📍 {SHOP_ADDRESS}</p>
        <div className="w-16 h-px bg-gold/40 mx-auto mt-4" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-cream/70 text-xs font-body font-bold uppercase tracking-widest mb-1.5">
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="Contoh: Ricardo Saputra"
            value={customer.name}
            onChange={(e) => onChange({ ...customer, name: e.target.value })}
            className="input-coffee"
          />
        </div>
      </div>

      <button onClick={onNext} disabled={!isValid} className="btn-gold w-full text-base">
        Pilih Menu →
      </button>
      <p className="text-cream/30 text-xs text-center font-body">
        Data Anda aman dan hanya digunakan untuk konfirmasi pesanan
      </p>
    </div>
  );
}

function Step2Menu({ cart, onUpdateCart, onNext, onBack }) {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);

  const getQty = (itemId) => cart.find((c) => c.id === itemId)?.qty || 0;

  const handleAdd = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      onUpdateCart(cart.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      onUpdateCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const handleRemove = (itemId) => {
    const existing = cart.find((c) => c.id === itemId);
    if (!existing) return;
    if (existing.qty === 1) {
      onUpdateCart(cart.filter((c) => c.id !== itemId));
    } else {
      onUpdateCart(cart.map((c) => c.id === itemId ? { ...c, qty: c.qty - 1 } : c));
    }
  };

  const activeItems = menuCategories.find((c) => c.id === activeCategory)?.items || [];
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="text-cream/50 hover:text-cream transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-display text-2xl font-bold text-cream flex-1">Pilih Menu</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {menuCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-gold text-espresso shadow-[0_0_12px_rgba(201,136,12,0.3)]'
                : 'bg-espresso-light text-cream/60 border border-gold/10 hover:border-gold/30'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-28">
        {activeItems.map((item) => {
          const qty = getQty(item.id);
          return (
            <div key={item.id} className={`card-coffee flex items-center gap-4 ${qty > 0 ? 'border-gold/30 bg-espresso-mid' : ''}`}>
              {item.image && (
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-espresso-light border border-gold/10">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="font-body font-bold text-cream text-sm leading-tight">{item.name}</p>
                  {item.tag && (
                    <span className={`tag-badge ${TAG_COLORS[item.tag] || 'bg-gold/20 text-gold'}`}>
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="text-cream/50 text-xs font-body mt-0.5">{item.description}</p>
                <p className="text-gold font-bold font-body text-sm mt-1">{formatRupiah(item.price)}</p>
              </div>

              {qty === 0 ? (
                <button
                  onClick={() => handleAdd(item)}
                  className="w-9 h-9 rounded-full bg-gold text-espresso flex items-center justify-center font-bold text-lg flex-shrink-0 hover:bg-gold-light transition-colors active:scale-90"
                >
                  +
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-8 h-8 rounded-full bg-espresso border border-gold/40 text-gold flex items-center justify-center font-bold text-lg hover:bg-espresso-mid transition-colors active:scale-90"
                  >−</button>
                  <span className="text-cream font-bold font-body w-5 text-center">{qty}</span>
                  <button
                    onClick={() => handleAdd(item)}
                    className="w-8 h-8 rounded-full bg-gold text-espresso flex items-center justify-center font-bold text-lg hover:bg-gold-light transition-colors active:scale-90"
                  >+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 px-4">
          <button 
            onClick={onNext} 
              className="btn-gold w-full text-base shadow-2xl shadow-gold/30"
          >
            Lanjut ({totalItems} item) →
          </button>
        </div>
      )}
    </div>
  );
}

function Step3Delivery({ deliveryType, setDeliveryType, onNext, onBack }) {
  const canProceed = true;

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <button onClick={onBack} className="text-cream/50 hover:text-cream transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-display text-2xl font-bold text-cream">Metode Pengambilan</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setDeliveryType('pickup')}
          className={`card-coffee text-center py-5 flex flex-col items-center gap-2 transition-all ${
            deliveryType === 'pickup' ? 'border-gold/60 bg-espresso-mid shadow-[0_0_20px_rgba(201,136,12,0.15)]' : ''
          }`}
        >
          <span className="text-3xl">🏠</span>
          <p className="font-body font-bold text-cream text-sm">Ambil di Toko</p>
          <p className="text-cream/40 text-xs">Pickup sendiri</p>
          <p className="text-gold font-bold text-xs">Gratis</p>
        </button>

        <button
          onClick={() => setDeliveryType('delivery')}
          className={`card-coffee text-center py-5 flex flex-col items-center gap-2 transition-all ${
            deliveryType === 'delivery' ? 'border-gold/60 bg-espresso-mid shadow-[0_0_20px_rgba(201,136,12,0.15)]' : ''
          }`}
        >
          <span className="text-3xl">🚚</span>
          <p className="font-body font-bold text-cream text-sm">Delivery</p>
          <p className="text-cream/40 text-xs">Antar ke lokasi</p>
          <p className="text-gold font-bold text-xs">Ongkir dikonfirmasi admin</p>
        </button>
      </div>

      {deliveryType === 'pickup' && (
        <div className="card-coffee border-gold/20 animate-fade-in">
          <div className="flex gap-3 items-start">
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-body font-bold text-cream text-sm">Lokasi Kedai Kami</p>
              <p className="text-cream/60 text-xs mt-0.5">{SHOP_ADDRESS}</p>
              <a
                href="https://maps.google.com/?q=Coffee+New+Cammary+Jl+Manisi+Cipadung+Bandung"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold text-xs font-bold mt-2 inline-flex items-center gap-1 hover:text-gold-light"
              >
                Buka di Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {deliveryType === 'delivery' && (
        <div className="animate-fade-in space-y-3">
          <p className="text-cream/70 text-sm font-body">Tolong konfirmasi alamat pengiriman ke admin melalui WhatsApp setelah order.</p>
        </div>
      )}

      <button onClick={onNext} disabled={!canProceed} className="btn-gold w-full text-base mt-2">
        Lanjut ke Pembayaran →
      </button>
    </div>
  );
}

function Step4Payment({ cart, deliveryType, paymentMethod, setPaymentMethod, onBack, onPay }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-cream/50 hover:text-cream transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-display text-2xl font-bold text-cream">Ringkasan & Pembayaran</h2>
      </div>

      <div className="card-coffee space-y-2">
        <p className="text-gold text-xs font-bold uppercase tracking-widest mb-3">Detail Pesanan</p>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <span className="text-cream/80 text-sm font-body">
              {item.name} <span className="text-cream/40">×{item.qty}</span>
            </span>
            <span className="text-cream text-sm font-body font-bold">{formatRupiah(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="divider-coffee" />
        <div className="flex justify-between items-center">
          <span className="text-cream font-bold font-body">Total</span>
          <span className="text-gold font-bold font-display text-xl">{formatRupiah(total)}</span>
        </div>
        {deliveryType === 'delivery' && (
          <p className="text-cream/40 text-xs">* Belum termasuk ongkir (akan dikonfirmasi admin via WhatsApp)</p>
        )}
      </div>

      <div className="card-coffee text-sm">
        <div className="flex gap-2 items-center">
          <span>{deliveryType === 'pickup' ? '🏠' : '🚚'}</span>
          <span className="text-cream/70 font-body">
            {deliveryType === 'pickup' ? 'Ambil di toko' : 'Delivery (konfirmasi alamat ke admin)'}
          </span>
        </div>
      </div>

      <div>
        <p className="text-cream/70 text-xs font-bold uppercase tracking-widest mb-3">Metode Pembayaran</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`card-coffee text-center py-5 flex flex-col items-center gap-2 transition-all ${
              paymentMethod === 'cash' ? 'border-gold/60 bg-espresso-mid shadow-[0_0_20px_rgba(201,136,12,0.15)]' : ''
            }`}
          >
            <span className="text-3xl">💵</span>
            <p className="font-body font-bold text-cream text-sm">Tunai / Cash</p>
            <p className="text-cream/40 text-xs">Bayar ke kurir/kasir</p>
          </button>

          <button
            onClick={() => setPaymentMethod('qris')}
            className={`card-coffee text-center py-5 flex flex-col items-center gap-2 transition-all ${
              paymentMethod === 'qris' ? 'border-gold/60 bg-espresso-mid shadow-[0_0_20px_rgba(201,136,12,0.15)]' : ''
            }`}
          >
            <span className="text-3xl">📱</span>
            <p className="font-body font-bold text-cream text-sm">QRIS</p>
            <p className="text-cream/40 text-xs">Scan & bayar</p>
          </button>
        </div>
      </div>

      <button onClick={onPay} disabled={!paymentMethod} className="btn-gold w-full text-base">
        {paymentMethod === 'qris' ? '📱 Bayar dengan QRIS' : '✅ Konfirmasi Pesanan via WhatsApp'}
      </button>
    </div>
  );
}

function QRISModal({ total, onConfirmPayment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-espresso-light border border-gold/20 rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-2xl">
        <div className="text-center space-y-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-cream">Scan QRIS</h3>
            <p className="text-cream/50 text-sm font-body mt-1">Coffee New Cammary</p>
          </div>

          <div className="bg-white rounded-xl p-4 mx-auto w-fit">
            <div className="relative w-56 h-56">
              <Image
                src="/qris.png"
                alt="QRIS Payment Code"
                fill
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded text-gray-400 text-center p-3">
                <Image
                src="/qris.png"
                alt="QRIS Payment Code"
                fill
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
                {/* <div className="text-4xl mb-2">📱</div>
                <p className="text-xs font-bold text-gray-500">Letakkan file QRIS</p>
                <p className="text-xs text-gray-400">/public/qris.png</p> */}
              </div>
            </div>
          </div>

          <div className="bg-espresso-mid border border-gold/20 rounded-xl p-3">
            <p className="text-cream/60 text-xs font-body">Total yang harus dibayar</p>
            <p className="text-gold font-display font-bold text-2xl">{formatRupiah(total)}</p>
          </div>

          <p className="text-cream/50 text-xs font-body">
            Scan QR code menggunakan aplikasi m-banking atau e-wallet favorit Anda
          </p>

          <div className="space-y-2">
            <button onClick={onConfirmPayment} className="btn-gold w-full text-sm">
              ✅ Sudah Bayar — Kirim Konfirmasi WhatsApp
            </button>
            <button onClick={onClose} className="btn-outline w-full text-sm">
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ paymentMethod, onNewOrder }) {
  return (
    <div className="animate-fade-in text-center space-y-6 py-8">
      <div className="text-7xl animate-bounce">{paymentMethod === 'qris' ? '🎉' : '✅'}</div>
      <div>
        <h2 className="font-display text-3xl font-bold text-cream">Pesanan Terkirim!</h2>
        <p className="text-cream/60 font-body text-sm mt-2">
          {paymentMethod === 'qris'
            ? 'Konfirmasi pembayaran QRIS sudah dikirim ke WhatsApp kami. Pesanan Anda sedang diproses!'
            : 'Pesanan Anda sudah kami terima via WhatsApp. Kami akan segera memprosesnya!'}
        </p>
      </div>

      <div className="card-coffee text-left space-y-3">
        <p className="text-gold text-xs font-bold uppercase tracking-widest">Coffee New Cammary</p>
        <div className="flex gap-2 text-sm">
          <span>📍</span>
          <p className="text-cream/70 font-body">{SHOP_ADDRESS}</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span>📱</span>
          <p className="text-cream/70 font-body">WhatsApp: {SHOP_WHATSAPP}</p>
        </div>
        <div className="flex gap-2 text-sm">
          <a
                href="https://instagram.com/coffee_newcammary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold text-xs font-bold mt-2 inline-flex items-center gap-1 hover:text-gold-light"
              >
              📸  
              Instagram: @{SHOP_INSTAGRAM}
              </a>
        </div>
      </div>

      <button onClick={onNewOrder} className="btn-outline w-full">☕ Buat Pesanan Baru</button>
    </div>
  );
}

export default function OrderPage() {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [cart, setCart] = useState([]);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showQRIS, setShowQRIS] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isShopActive, setIsShopActive] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    // Menambahkan cache: 'no-store' dan parameter waktu agar selalu mengambil data terbaru di production
    const timestamp = new Date().getTime();
    fetch(`/api/status?t=${timestamp}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        setIsShopActive(data.isActive);
        setIsLoadingStatus(false);
      })
      .catch(() => {
        setIsShopActive(true);
        setIsLoadingStatus(false);
      });
  }, []);

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const sendWhatsApp = useCallback(() => {
    const msg = buildWhatsAppMessage({ customer, cart, deliveryType, paymentMethod, total });
    window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
    setIsDone(true);
    setShowQRIS(false);
  }, [customer, cart, deliveryType, paymentMethod, total]);

  const handlePay = () => {
    if (paymentMethod === 'qris') setShowQRIS(true);
    else sendWhatsApp();
  };

  const handleNewOrder = () => {
    setStep(1); setCustomer({ name: '', phone: '' }); setCart([]);
    setDeliveryType('pickup');
    setPaymentMethod(''); setShowQRIS(false); setIsDone(false);
  };

  if (isLoadingStatus) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-[#1A0805]">
        <div className="animate-pulse text-gold font-body">Bentar...</div>
      </main>
    );
  }

  if (!isShopActive) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gradient-to-b from-[#1A0805] via-[#1A0805] to-[#100503] z-0" />
        <div className="relative z-10 text-center space-y-6 max-w-sm mx-auto p-8 bg-[#2A1612] rounded-3xl border border-gold/20 shadow-2xl">
          <div className="text-6xl animate-bounce">😴</div>
          <h1 className="font-display text-3xl font-bold text-cream">Mohon Maaf</h1>
          <p className="text-cream/70 font-body text-lg">Kurir nya lagi istirahat</p>
          <div className="w-16 h-px bg-gold/40 mx-auto mt-4" />
          <p className="text-cream/40 text-sm font-body mt-2">Coffee New Cammary</p>
          <p className="text-cream/40 text-sm font-body mt-2">Buka setiap hari jam 10.00 - 00.00</p>
          <p className="text-cream/40 text-sm font-body mt-2">kalo mau ngopi langsung ke Kedai aja</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-b from-[#1A0805] via-[#1A0805] to-[#100503] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl z-0 pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 pb-28">
        {!isDone && (
          <>
            <div className="sticky top-0 z-20 bg-espresso/90 backdrop-blur-md pt-3 pb-1 -mx-4 px-4 border-b border-gold/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* <span className="text-xl">☕</span> */}
                  <span className="font-display font-bold text-cream text-sm">Coffee New Cammary</span>
                </div>
                {cart.length > 0 && step !== 2 && (
                  <button onClick={() => setStep(2)} className="text-gold text-xs font-body font-bold flex items-center gap-1">
                    🛒 {cart.reduce((s, i) => s + i.qty, 0)} item
                  </button>
                )}
              </div>
              {step > 1 && <StepIndicator currentStep={step} />}
            </div>

            <div className="pt-6">
              {step === 1 && <Step1CustomerInfo customer={customer} onChange={setCustomer} onNext={() => setStep(2)} />}
              {step === 2 && <Step2Menu cart={cart} onUpdateCart={setCart} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
              {step === 3 && (
                <Step3Delivery
                  deliveryType={deliveryType}
                  setDeliveryType={setDeliveryType}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}
              {step === 4 && (
                <Step4Payment
                  cart={cart}
                  deliveryType={deliveryType}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onBack={() => setStep(3)}
                  onPay={handlePay}
                />
              )}
            </div>
          </>
        )}

        {isDone && (
          <div className="pt-8">
            <SuccessPage paymentMethod={paymentMethod} onNewOrder={handleNewOrder} />
          </div>
        )}
      </div>

      {showQRIS && (
        <QRISModal
          total={total}
          onConfirmPayment={sendWhatsApp}
          onClose={() => setShowQRIS(false)}
        />
      )}
    </main>
  );
}
