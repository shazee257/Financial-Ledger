const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "InvoiceItems" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  date: {
    type: Date,
    default: Date.now,
  },
  customerType: {
    type: String,
    required: true,
    enum: ["WholeSaleCustomer", "PartialPaymentCustomer", "WalkInCustomer"],
    default: "WalkInCustomer",
  },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
