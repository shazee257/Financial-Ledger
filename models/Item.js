const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: {
    type: String,
    required: true,
    enum: ["kg.", "ft.", "mtr.", "Pcs.", "ml.", "Dozen", "Packs"],
  },
  unitPrice: { type: Number, required: true },
  retailPrice: { type: Number },
  partialPaymentPrice: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
