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

// 58mm thermal paper standard width is 32 characters
export async function buildReceipt(data) {
  const encoder = new EscPosEncoder();
  let result = encoder.initialize().align("center");

  // Load and print logo (192x192 to fit well on 58mm paper, width max is ~384px)
  try {
    const logoImg = await loadImage("/menu/logo newcam.jpeg");
    result = result.image(logoImg, 192, 192, "atkinson").newline();
  } catch (err) {
    console.warn("Failed to load logo for receipt", err);
  }

  result = result
    .bold(true)
    .line("COFFEE NEW CAMMARY")
    .bold(false)
    .line("Jl. Manisi, Cipadung, Kec. Cibiru")
    .line("Kota Bandung, Jawa Barat 40614")
    .line("================================")
    .align("left");

  if (data.customerName) {
    result = result.line(`Pelanggan: ${data.customerName}`);
  }
  if (data.customerPhone) {
    result = result.line(`No. HP: ${data.customerPhone}`);
  }
  result = result
    .line(`Tanggal: ${new Date().toLocaleString("id-ID")}`)
    .line("--------------------------------");

  for (const item of data.items) {
    result = result.line(item.name);
    // Align price to the right on 58mm (32 chars)
    const qtyStr = `${item.qty} x ${fmt(item.price)}`;
    const totalStr = `${fmt(item.qty * item.price)}`;
    
    // Calculate padding
    // e.g., "  2 x 15.000" (12 chars) + "30.000" (6 chars) = 18 chars
    // Needs 14 spaces to reach 32
    const padLength = Math.max(0, 32 - qtyStr.length - totalStr.length);
    result = result.line(`${qtyStr}${" ".repeat(padLength)}${totalStr}`);
  }

  result = result
    .line("--------------------------------")
    .line(`Subtotal:${" ".repeat(32 - 9 - fmt(data.subtotal).length)}${fmt(data.subtotal)}`)
    .bold(true)
    .line(`TOTAL:${" ".repeat(32 - 6 - fmt(data.total).length)}${fmt(data.total)}`)
    .bold(false)
    .line("--------------------------------")
    .line(`Bayar (${data.paymentMethod.toUpperCase()}):${" ".repeat(32 - 9 - data.paymentMethod.length - fmt(data.amountPaid).length)}${fmt(data.amountPaid)}`)
    .line(`Kembali:${" ".repeat(32 - 8 - fmt(data.change).length)}${fmt(data.change)}`)
    .line("================================")
    .align("center")
    .line("")
    .line("Terima Kasih!")
    .line("Coffee New Cammary")
    .line("")
    .line("--------------------------------")
    .bold(true)
    .line("Wi-Fi: udahnyambungbelum")
    .bold(false)
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
