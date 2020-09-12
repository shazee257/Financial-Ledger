const express = require("express");
const router = express.Router();
const passport = require("passport");
const { ensureGuest, ensureAuthenticated } = require("../middleware/auth");

// GET - /
//router.get("/", ensureGuest, (req, res) => res.render("welcome"));

// GET - Login
router.get("/login", ensureGuest, (req, res) =>
  res.render("login", { layout: false })
);

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get("/logout", ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash("success_msg", "You are now logged out!");
  res.redirect("/login");
});

// GET - Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  //const isAdmin = req.user.accessLevel === "Admin" ? true : false;
  // res.render("dashboard", { name: req.user.name, isAdmin: res.locals.isAdmin });
  res.render("dashboard", { name: "Muhammad Shahzad", isAdmin: true });
});

module.exports = router;
