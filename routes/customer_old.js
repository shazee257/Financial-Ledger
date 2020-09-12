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
//
//
//
// INVOICE SECTION
//
//
//

// Get All Invoices with Transactions & Customers
router.get("/invoices", async (req, res) => {
  const invoices = await Invoice.find({ vendor: null })
    .populate("transactions customer items")
    .lean();
  res.render("customers/invoices/list", {
    invoices,
    title: "All Customers' Invoices",
  });
});

// Show Single Invoice by ID
router.get("/invoices/detail/:number", async (req, res) => {
  const invoice = await Invoice.findOne({
    number: req.params.number,
  })
    .populate("transactions customer items")
    .lean();
  res.render("customers/invoices/detail", { invoice });
});

// Make Payment against invoice
router.post("/invoices/payments/:number", async (req, res) => {
  const invoice = await Invoice.findOne({ number: req.params.number });
  const transaction = await Transaction.create(req.body);
  invoice.transactions.push(transaction);
  await invoice.save();
  res.redirect(`/customers/invoices/detail/${invoice.number}`);
});

// Create a new Invoice
router.get("/invoices/new", async (req, res) => {
  const customers = await Customer.find({}).lean();
  res.render("customers/invoices/new", {
    customers,
    title: "Create a new Invoice",
  });
});

// Create New Invoice
router.post("/invoices/new", async (req, res) => {
  const invoice = await Invoice.create(req.body);
  res.redirect(`/customers/invoices/items/${invoice._id}`);
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
    title: "Update Invoice",
  });
});

// Update Invoice
router.post("/invoices/edit/:id", async (req, res) => {
  await Invoice.findByIdAndUpdate(req.params.id, {
    number: req.body.number,
    customer: req.body.customer,
    date: Date.parse(req.body.date),
  });
  res.redirect("/customers/invoices");
});

// Delete Invoice
router.get("/invoices/delete/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (
      (invoice.transactions.length < 1 || invoice.transactions == undefined) &&
      (invoice.items.length < 1 || invoice.items == undefined)
    ) {
      await Invoice.findByIdAndDelete(req.params.id);
    } else {
      req.flash(
        "error_msg",
        "This invoice contains items or payment transactions, please delete them to remove the invoice!"
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
//
//

// Get Customer Invoices
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

// Get - Edit Payment
router.get("/invoices/payment/edit/:id", async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).lean();
  const invoice = await Invoice.findOne({ transactions: req.params.id }).lean();
  res.render("customers/invoices/edit-payment", {
    number: invoice.number,
    transaction,
  });
});

// Post - Edit Payment
router.post("/invoices/payment/edit/:id", async (req, res) => {
  await Transaction.findByIdAndUpdate(req.params.id, {
    amount: req.body.amount,
    date: Date.parse(req.body.date),
  });
  const invoice = await Invoice.findOne({ transactions: req.params.id }).lean();
  res.redirect(`/customers/invoices/detail/${invoice.number}`);
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
  res.redirect(`/customers/invoices/detail/${invoice.number}`);
});

//
//
//  Invoice Items
//
//
// GET - items against invoice
router.get("/invoices/items/:id", async (req, res) => {
  const items = await Item.find().populate("category").lean();
  const invoice = await Invoice.findById(req.params.id)
    .populate("items customer transactions")
    .lean();
  res.render("customers/invoices/invoiceItems", { invoice, items });
});

// POST - Add item against Invoice
router.post("/invoices/items/add/:id", async (req, res) => {
  const item = await Item.findById(req.params.id).populate("category");
  const invoice = await Invoice.findById(req.body.invNumber).populate("items");

  let factor = 0;
  switch (invoice.customerType) {
    case "WholeSaleCustomer":
      factor = 0;
    case "WalkInCustomer":
      factor = 5;
    case "PartialPaymentCustomer":
      factor = 20;
  }

  let match = false;
  invoice.items.map((it) => {
    if (item.name === it.name) {
      match = true;
    }
  });
  if (match) {
    req.flash(
      "error_msg",
      "This item already exists, please remove the item to add it again!"
    );
  } else {
    if (req.body.quantity < 1) {
      req.flash("error_msg", "Please set proper item quantity!");
    } else {
      const invoiceItem = {
        name: item.name,
        unitPrice: item.unitPrice + (factor / 100) * item.unitPrice,
        quantity: Number(req.body.quantity),
        amount:
          Number(req.body.quantity) * item.unitPrice +
          (factor / 100) * item.unitPrice,
        category: item.category.name,
      };

      const savedItem = await InvoiceItems.create(invoiceItem);
      invoice.items.push(savedItem);
      await invoice.save();
      //Stock Update
      item.quantity -= Number(req.body.quantity);
      await item.save();
    }
  }
  res.redirect(`/customers/invoices/items/${invoice._id}`);
});

// Get - Delete Invoice Item
router.get("/invoices/items/delete/:id", async (req, res) => {
  const deletedItem = await InvoiceItems.findByIdAndDelete(req.params.id);
  const item = await Item.findOne({ name: deletedItem.name });
  item.quantity += deletedItem.quantity;
  await item.save();

  const invoice = await Invoice.findOne({ items: req.params.id });
  const index = invoice.items.indexOf(req.params.id);
  if (index > -1) {
    invoice.items.splice(index, 1);
  }
  invoice.save();
  res.redirect(`/customers/invoices/items/${invoice._id}`);
});

module.exports = router;
