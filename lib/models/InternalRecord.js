import mongoose from "mongoose";

const InternalRecordSchema = new mongoose.Schema(
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
      },
    ],
    takenBy: { type: String, required: true },
    note: { type: String, default: "" },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.InternalRecord ||
  mongoose.model("InternalRecord", InternalRecordSchema);
