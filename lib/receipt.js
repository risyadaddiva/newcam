import EscPosEncoder from "esc-pos-encoder";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(n);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function buildReceipt(data) {
  const encoder = new EscPosEncoder();
  // Inisialisasi awal tanpa langsung set align
  let result = encoder.initialize();

  const line32 = "================================";
  const dash32 = "--------------------------------";

  // 1. BAGIAN LOGO DAN HEADER (RATA TENGAH)
  result = result.align("center");
  
  try {
    // Ubah ke format PNG monokrom jika memungkinkan
    const logoImg = await loadImage("/logo.png"); 
    result = result.image(logoImg, 192, 192, "atkinson").newline();
  } catch (err) {
    console.warn("Failed to load logo for receipt", err);
  }

  result = result
    .bold(true)
    .line("COFFEE NEW CAMMARY")
    .bold(false)
    .line("Jl. Manisi, Cibiru, Bandung")
    .line(line32);

  // 2. BAGIAN DETAIL PESANAN (KEMBALI RATA KIRI)
  result = result.align("left");

  if (data.customerName) {
    result = result.line(`Pelanggan: ${data.customerName}`);
  }
  result = result
    .line(new Date().toLocaleString("id-ID"))
    .line(dash32);

  for (const item of data.items) {
    let itemLine = item.name;
    if (item.variant) {
      itemLine += ` (${item.variant})`;
    }
    result = result.line(itemLine);
    if (item.note) {
      result = result.line(`  *${item.note}`);
    }
    result = result.line(`${item.qty}x Rp${fmt(item.price)} = Rp${fmt(item.qty * item.price)}`);
  }

  result = result.line(dash32);

  result = result
    .bold(true)
    .line(`Total   : Rp ${fmt(data.total)}`)
    .bold(false)
    .line(`Bayar   : Rp ${fmt(data.amountPaid)}`)
    .line(`Kembali : Rp ${fmt(data.change)}`)
    .line(`Metode  : ${data.paymentMethod.toUpperCase()}`)
    .line(line32);

  // 3. BAGIAN FOOTER (KEMBALI RATA TENGAH)
  result = result
    .align("center")
    .bold(true)
    .line('"Pertemuan Adalah Kabar"')
    .bold(false)
    .line("Wi-Fi: udahnyambungbelum")
    .newline()
    .line("Follow Atuh Euy")
    .line("@coffee_newcammary")
    .newline()
    .newline()
    .cut();

  return result.encode();
}

// Fungsi printViaBluetooth tidak perlu diubah, sudah sangat baik
export async function printViaBluetooth(receiptData) {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth API tidak tersedia di browser ini");
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ["000018f0-0000-1000-8000-00805f9b34fb"] }],
    optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(
    "000018f0-0000-1000-8000-00805f9b34fb"
  );
  const characteristic = await service.getCharacteristic(
    "00002af1-0000-1000-8000-00805f9b34fb"
  );

  const chunkSize = 100;
  for (let i = 0; i < receiptData.length; i += chunkSize) {
    const chunk = receiptData.slice(i, i + chunkSize);
    await characteristic.writeValue(chunk);
  }

  server.disconnect();
}