const express = require("express");
const router = express.Router();

// Load Models
const Customer = require("../models/customer");
const Invoice = require("../models/invoice");
const Transaction = require("../models/transaction");

// Get All Customers
router.get("/", async (req, res) => {
  const customers = await Customer.find({}).lean();
  res.render("customers/list", {
    customers,
    title: "All Customers' List",
  });
});

// GET - New Customer
router.get("/new", (req, res) => {
  res.render("customers/new", { title: "New Customer" });
});

// POST - New Customer
router.post("/new", async (req, res) => {
  const customer = await Customer.create(req.body);
  res.redirect("/customers");
});

// GET - Edit Customer
router.get("/edit/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean();
  res.render("customers/edit", {
    customer,
    title: "Edit Customer Information",
  });
});

// POST - Edit Customer
router.post("/edit/:id", async (req, res) => {
  await Customer.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/customers");
});

// GET - Delete Customer
router.get("/delete/:id", async (req, res) => {
  let match = false;
  const invoices = await Invoice.find().lean();
  invoices.map((inv) => {
    if (inv.customer == req.params.id) {
      match = true;
    }
  });
  if (match) {
    req.flash(
      "error_msg",
      "This customer contains payment invoice(s), please remove invoice(s) to perform this operation!"
    );
  } else {
    await Customer.findByIdAndDelete(req.params.id);
  }
  res.redirect("/customers");
});

//
// INVOICE SECTION
//

// Get All Invoices
router.get("/invoices", async (req, res) => {
  const invoices = await Invoice.find({ vendor: null })
    .select("number amount date customer")
    .populate("transactions customer")
    .lean();
  res.render("customers/invoices/list", {
    invoices,
    title: "All Customers' Invoices",
  });
});

// Single Invoice by ID
router.get("/invoices/detail/:id", async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("transactions customer")
    .lean();
  res.render("customers/invoices/detail", { invoice });
});

// Create a new Invoice
router.get("/invoices/new", async (req, res) => {
  const customers = await Customer.find().lean();
  res.render("customers/invoices/new", {
    customers,
    title: "Create a new Invoice",
  });
});

// Create New Invoice
router.post("/invoices/new", async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.redirect(`/customers/invoices/detail/${invoice._id}`);
});

// Edit Invoice
router.get("/invoices/edit/:id", async (req, res) => {
  const customers = await Customer.find().lean();
  const invoice = await Invoice.findById(req.params.id)
    .populate("customer")
    .lean();
  res.render("customers/invoices/edit", {
    invoice,
    customers,
    title: "Edit Invoice",
  });
});

// Edit Invoice
router.post("/invoices/edit/:id", async (req, res) => {
  await Invoice.findByIdAndUpdate(req.params.id, {
    number: req.body.number,
    amount: req.body.amount,
    customer: req.body.customer,
    date: Date.parse(req.body.date),
  });
  res.redirect("/customers/invoices");
});

// Delete Invoice
router.get("/invoices/delete/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice.transactions.length < 1 || invoice.transactions == undefined) {
      await Invoice.findByIdAndDelete(req.params.id);
    } else {
      req.flash(
        "error_msg",
        "This invoice contains payment transactions, please remove them to perform this operation!"
      );
    }
  } catch (error) {
    console.log(error);
  }
  res.redirect("/customers/invoices");
});

//
//
//

// GET - Customer Invoices
router.get("/invoices/customer/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean();
  const invoices = await Invoice.find({ customer: req.params.id })
    .populate("transactions customer items")
    .lean();
  res.render("customers/invoices/customer-invoices", {
    invoices,
    title: `Invoices - ${customer.name}`,
  });
});

// GET - Edit Payment
router.get("/invoices/payment/edit/:id", async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).lean();
  const invoice = await Invoice.findOne({ transactions: req.params.id }).lean();
  res.render("customers/invoices/edit-payment", {
    number: invoice.number,
    transaction,
  });
});

// POST - Edit Payment
router.post("/invoices/payment/edit/:id", async (req, res) => {
  await Transaction.findByIdAndUpdate(req.params.id, {
    amount: req.body.amount,
    date: Date.parse(req.body.date),
  });
  const invoice = await Invoice.findOne({ transactions: req.params.id });
  res.redirect(`/customers/invoices/detail/${invoice._id}`);
});

// Make Invoice Payment
router.post("/invoices/payments/:id", async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  const transaction = await Transaction.create(req.body);
  invoice.transactions.push(transaction);
  await invoice.save();
  res.redirect(`/customers/invoices/detail/${invoice._id}`);
});

// Get - Delete  Payment
router.get("/invoices/payment/delete/:id", async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  const invoice = await Invoice.findOne({ transactions: req.params.id });

  const index = invoice.transactions.indexOf(req.params.id);
  if (index > -1) {
    invoice.transactions.splice(index, 1);
  }
  invoice.save();
  res.redirect(`/customers/invoices/detail/${invoice._id}`);
});

module.exports = router;
