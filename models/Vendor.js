const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
});

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
