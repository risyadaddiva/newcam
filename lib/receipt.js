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
  let result = encoder.initialize().align("center");

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
    .line("COFFEE NEW CAMMARY")
    .bold(false)
    .line("Jl. Manisi, Cipadung, Kec. Cibiru")
    .line("================================");

  // Customer name
  if (data.customerName) {
    result = result.line(data.customerName);
  }

  // Date & time
  result = result
    .line(new Date().toLocaleString("id-ID"))
    .line("================================");

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
    result = result.line(`${item.qty} x Rp ${fmt(item.price)} = Rp ${fmt(item.qty * item.price)}`);
  }

  result = result.line("================================");

  // Total
  result = result
    .bold(true)
    .line(`Total: Rp ${fmt(data.total)}`)
    .bold(false);

  // Bayar
  result = result.line(`Bayar: Rp ${fmt(data.amountPaid)}`);

  // Kembali
  result = result.line(`Kembali: Rp ${fmt(data.change)}`);

  // Payment method
  result = result.line(`Metode: ${data.paymentMethod.toUpperCase()}`);

  result = result
    .line("================================")
    .line("")
    .bold(true)
    .line("\"Pertemuan Adalah Kabar\"")
    .bold(false)
    .line("")
    .line("Wi-Fi: udahnyambungbelum")
    .newline()
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
