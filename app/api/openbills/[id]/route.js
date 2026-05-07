import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import OpenBill from "@/lib/models/OpenBill";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const bill = await OpenBill.findByIdAndUpdate(params.id, body, { new: true });
  if (!bill) {
    return NextResponse.json({ error: "Open bill tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(bill);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const bill = await OpenBill.findByIdAndDelete(params.id);
  if (!bill) {
    return NextResponse.json({ error: "Open bill tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ message: "Open bill berhasil dihapus" });
}
