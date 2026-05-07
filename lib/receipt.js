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

// Fungsi manipulasi string untuk rata tengah (software padding)
function centerText(text, width = 31) {
  if (text.length >= width) return text.substring(0, width);
  // Menghitung jumlah spasi yang dibutuhkan di sisi kiri
  const leftPad = Math.floor((width - text.length) / 2);
  return " ".repeat(leftPad) + text;
}

export async function buildReceipt(data) {
  const encoder = new EscPosEncoder();
  let result = encoder.initialize();

  // Menetapkan batas absolut sesuai observasi hardware Anda
  const MAX_CHAR = 31;
  const lineChars = "=".repeat(MAX_CHAR);
  const dashChars = "-".repeat(MAX_CHAR);

  // 1. LOGO: Tetap gunakan hardware alignment karena sudah berfungsi baik
  result = result.align("center");

  try {
    const logoImg = await loadImage("/logo.png"); 
    result = result.image(logoImg, 192, 192, "atkinson").newline();
  } catch (err) {
    console.warn("Failed to load logo for receipt", err);
  }

  // Header (center aligned)
  result = result.align("center")
    .bold(true)
    .line("COFFEE NEW CAMMARY")
    .bold(false)
    .line("Jl. Manisi, Cibiru, Bandung")
    .line(lineChars);

  // Konten utama (left aligned)
  result = result.align("left");

  // Detail Transaksi
  if (data.customerName) {
    result = result.line(`Pelanggan: ${data.customerName}`);
  }
  result = result
    .line(new Date().toLocaleString("id-ID"))
    .line(dashChars);

  // Item Menu (tanpa fungsi potong karena item pendek)
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

  result = result.line(dashChars);

  // Kalkulasi Total
  result = result
    .bold(true)
    .line(`Total   : Rp ${fmt(data.total)}`)
    .bold(false)
    .line(`Bayar   : Rp ${fmt(data.amountPaid)}`)
    .line(`Kembali : Rp ${fmt(data.change)}`)
    .line(`Metode  : ${data.paymentMethod.toUpperCase()}`)
    .line(lineChars);

  // Footer (center aligned)
  result = result.align("center")
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

// Fungsi printViaBluetooth tetap sama seperti sebelumnya
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
