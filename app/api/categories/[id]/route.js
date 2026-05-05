import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/lib/models/Category";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update kategori" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await Category.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Kategori dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
