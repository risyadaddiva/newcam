import { NextResponse } from 'next/server';
import connectDB from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const statusSetting = await Setting.findOne({ key: "shopActive" });
    
    // Default to true if setting doesn't exist
    const isActive = statusSetting ? statusSetting.value : true;
    
    return NextResponse.json({ isActive });
  } catch (error) {
    return NextResponse.json({ isActive: true });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    await Setting.findOneAndUpdate(
      { key: "shopActive" },
      { value: body.isActive },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, isActive: body.isActive });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
