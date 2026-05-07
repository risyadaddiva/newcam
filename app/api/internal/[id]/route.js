import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import InternalRecord from "@/lib/models/InternalRecord";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const record = await InternalRecord.findByIdAndUpdate(params.id, body, { new: true });
  if (!record) {
    return NextResponse.json({ error: "Record tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(record);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const record = await InternalRecord.findByIdAndDelete(params.id);
  if (!record) {
    return NextResponse.json({ error: "Record tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ message: "Record berhasil dihapus" });
}
