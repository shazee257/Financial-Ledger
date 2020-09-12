const express = require("express");
const router = express.Router();
const { ensureGuest, ensureAuthenticated } = require("../middleware/auth");

// Load Models
const Item = require("../models/item");
const Category = require("../models/category");

// GET - Items List
router.get("/", ensureAuthenticated, async (req, res) => {
  const items = await Item.find().populate("category").lean();
  res.render("items/itemList", { items, title: "List of Items" });
});

// GET - New Item
router.get("/new", ensureAuthenticated, async (req, res) => {
  const categories = await Category.find().lean();
  res.render("items/itemForm", {
    categories,
    title: "New Item",
    route: "/items/new",
    submit: "Add Item",
    faIcon: "far fa-file-alt",
  });
});

// GET - New Item
router.post("/new", ensureAuthenticated, async (req, res) => {
  const item = await Item.create(req.body);
  res.redirect("/items");
});

// GET - Edit Item
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  const categories = await Category.find().lean();
  const item = await Item.findById(req.params.id).lean();
  res.render("items/itemForm", {
    item,
    categories,
    title: "Edit Item",
    submit: "Update",
    route: `/items/edit/${req.params.id}`,
    faIcon: "fas fa-edit",
  });
});

// POST - Edit Item
router.post("/edit/:id", ensureAuthenticated, async (req, res) => {
  await Item.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/items");
});

// GET - Delete Item
router.get("/delete/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect("/items");
});

//
//
//  ITEM CATEGORIES
//
// GET - Category List
router.get("/categories", ensureAuthenticated, async (req, res) => {
  const categories = await Category.find().lean();
  res.render("items/categories/categoriesList", {
    categories,
    title: "Item Categories",
  });
});

// GET - New Category
router.get("/categories/new", ensureAuthenticated, async (req, res) => {
  res.render("items/categories/categoryForm", {
    title: "New Category",
    route: "/items/categories/new",
    submit: "Add Category",
    faIcon: "far fa-file-alt",
  });
});

// POST - New Category
router.post("/categories/new", ensureAuthenticated, async (req, res) => {
  const category = await Category.create(req.body);
  res.redirect("/items/categories");
});

// GET - Edit Category
router.get("/categories/edit/:id", ensureAuthenticated, async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  res.render("items/categories/categoryForm", {
    category,
    title: "Edit Category",
    route: `/items/categories/edit/${req.params.id}`,
    submit: "Update Category",
    faIcon: "fas fa-edit",
  });
});

// POST - New Category
router.post("/categories/edit/:id", ensureAuthenticated, async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/items/categories");
});

// GET - Delete Category
router.get("/categories/delete/:id", async (req, res) => {
  let match = false;
  const items = await Item.find().lean();
  items.map((item) => {
    if (item.category == req.params.id) {
      match = true;
      return;
    }
  });
  if (match) {
    req.flash(
      "error_msg",
      "This Category exists in Item(s), please remove items(s) to perform this operation!"
    );
  } else {
    await Category.findByIdAndDelete(req.params.id);
  }
  res.redirect("/items/categories");
});

//
//
//
//
// GET - items/stock
router.get("/stock", ensureAuthenticated, async (req, res) => {
  const items = await Item.find().populate("category").lean();
  res.render("items/itemStock", { items, title: "Stock Management" });
});

// POST - items/stock/:id
router.post("/stock/:id", ensureAuthenticated, async (req, res) => {
  const item = await Item.findById(req.params.id);
  item.quantity += Number(req.body.quantity);
  await item.save();

  res.redirect("/items/stock");
});

module.exports = router;
