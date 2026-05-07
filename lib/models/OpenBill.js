import mongoose from "mongoose";

const OpenBillSchema = new mongoose.Schema(
  {
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
        variant: { type: String, default: "" },
        note: { type: String, default: "" },
      },
    ],
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.OpenBill ||
  mongoose.model("OpenBill", OpenBillSchema);
