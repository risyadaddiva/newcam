import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/lib/models/MenuItem";

export async function GET() {
  await dbConnect();
  const items = await MenuItem.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  const item = await MenuItem.create(body);
  return NextResponse.json(item, { status: 201 });
}
