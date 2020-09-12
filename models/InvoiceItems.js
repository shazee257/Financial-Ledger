const mongoose = require("mongoose");

const invoiceItemsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
});

const InvoiceItems = mongoose.model("InvoiceItems", invoiceItemsSchema);

module.exports = InvoiceItems;
