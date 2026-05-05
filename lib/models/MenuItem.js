import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem ||
  mongoose.model("MenuItem", MenuItemSchema);
