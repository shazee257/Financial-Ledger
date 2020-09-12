module.exports = {
  ensureAuthenticated: (req, res, next) => {
    // if (req.isAuthenticated()) {
    return next();
    // }
    // req.flash("error_msg", "Please log in with your credentials!");
    // res.redirect("/login");
  },
  ensureGuest: (req, res, next) => {
    // if (req.isAuthenticated()) {
    //   res.redirect("/dashboard");
    // } else {
    return next();
    // }
  },
};
