import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import MenuItem from "@/lib/models/MenuItem";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const txns = await Transaction.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(txns);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();

  const txn = await Transaction.create(body);

  for (const item of body.items) {
    await MenuItem.findByIdAndUpdate(item.menuItem, {
      $inc: { stock: -item.qty },
    });
  }

  return NextResponse.json(txn, { status: 201 });
}
