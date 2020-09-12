const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { ensureAdmin } = require("../middleware/isAdmin");

// User Model
const User = require("../models/User");

// GET - new User
router.get("/new", (req, res) => res.render("users/new"));

// POST - new User
router.post("/new", async (req, res) => {
  const { name, phone, email, accessLevel, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !phone || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check password match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  // Check phone length
  if (phone.length !== 11) {
    errors.push({ msg: "Phone number should be length of 11 digits!" });
  }

  if (errors.length > 0) {
    res.render("users/new", {
      errors,
      name,
      phone,
      email,
      accessLevel,
    });
  } else {
    // Validation passed
    let newUser = await User.findOne({ phone: phone });
    // User exists
    if (newUser) {
      errors.push({
        msg: "Phone number already registered, please try with new one!",
      });
      res.render("users/new", {
        errors,
        name,
        phone,
        email,
        accessLevel,
      });
    } else {
      // Create new User
      const newUser = new User({
        name,
        phone,
        email,
        accessLevel,
        password: await bcrypt.hash(password, 10),
      });
      await User.create(newUser);
      req.flash("success_msg", "User created successfully!");
      res.redirect("/users/list");
    }
  }
});

//

//

//

// GET - All Users
router.get("/list", async (req, res) => {
  const users = await User.find().lean();
  res.render("users/list", { users });
});

// GET - Edit User
router.get("/edit/:id", async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  res.render("users/edit", { user });
});

// POST - Edit User
router.post("/edit/:id", async (req, res) => {
  const { name, phone, email, accessLevel, password, password2 } = req.body;
  await User.findByIdAndUpdate(req.params.id, {
    name,
    phone,
    email,
    accessLevel,
    password: await bcrypt.hash(password, 10),
  });
  req.flash("success_msg", "User updated successfully!");
  res.redirect("/users/list");
});

// GET - Delete User
router.get("/delete/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/users/list");
});

module.exports = router;
