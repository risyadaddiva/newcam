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
  let result = encoder.initialize().align("left");

  const centerText = (text) => {
    if (text.length >= 32) return text;
    const pad = Math.floor((32 - text.length) / 2);
    // Menggunakan non-breaking space (\xa0) agar tidak di-trim oleh printer
    return "\xa0".repeat(pad) + text;
  };

  const line32 = "================================";
  const dash32 = "--------------------------------";

  // Logo
  try {
    const logoImg = await loadImage("/menu/logo newcam.jpeg");
    result = result.image(logoImg, 192, 192, "atkinson").newline();
  } catch (err) {
    console.warn("Failed to load logo for receipt", err);
  }

  // Header
  result = result
    .bold(true)
    .line(centerText("COFFEE NEW CAMMARY"))
    .bold(false)
    .line(centerText("Jl. Manisi, Cibiru, Bandung"))
    .line(line32);

  // Customer name & Date
  if (data.customerName) {
    result = result.line(`Pelanggan: ${data.customerName}`);
  }
  result = result
    .line(new Date().toLocaleString("id-ID"))
    .line(dash32);

  // Items
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

  // Total
  result = result
    .bold(true)
    .line(`Total   : Rp ${fmt(data.total)}`)
    .bold(false)
    .line(`Bayar   : Rp ${fmt(data.amountPaid)}`)
    .line(`Kembali : Rp ${fmt(data.change)}`)
    .line(`Metode  : ${data.paymentMethod.toUpperCase()}`)
    .line(line32);

  // Footer
  result = result
    .bold(true)
    .line(centerText('"Pertemuan Adalah Kabar"'))
    .bold(false)
    .line(centerText("Wi-Fi: udahnyambungbelum"))
    .newline()
    .line(centerText("follow atuh euy @coffee_newcammary"))
    .newline()
    .newline()
    .cut();

  return result.encode();
}

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
