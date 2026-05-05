import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let statusFilePath = path.join(process.cwd(), 'status.json');
let memoryStatus = true;

// Handle read-only file systems (like Vercel)
try {
  if (!fs.existsSync(statusFilePath)) {
    fs.writeFileSync(statusFilePath, JSON.stringify({ isActive: true }));
  }
  // Coba test apakah bisa ditulis
  fs.accessSync(statusFilePath, fs.constants.W_OK);
} catch (e) {
  // Jika gagal (Read-only Vercel), fallback ke /tmp
  statusFilePath = path.join(os.tmpdir(), 'status.json');
  try {
    if (!fs.existsSync(statusFilePath)) {
      fs.writeFileSync(statusFilePath, JSON.stringify({ isActive: true }));
    }
  } catch (err) {}
}

export async function GET() {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    memoryStatus = JSON.parse(data).isActive;
    return NextResponse.json({ isActive: memoryStatus });
  } catch (error) {
    return NextResponse.json({ isActive: memoryStatus });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    memoryStatus = body.isActive;
    
    try {
      fs.writeFileSync(statusFilePath, JSON.stringify({ isActive: body.isActive }));
    } catch (e) {
      // Abaikan error jika tidak bisa tulis file, memoryStatus sudah diupdate
    }
    
    return NextResponse.json({ success: true, isActive: body.isActive });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
