module.exports = {
  ensureAdmin: (req, res, next) => {
    // if (req.user.accessLevel === "Admin") {
    return next();
    // }
    // req.flash("error_msg", "Access denied!");
    // res.redirect("/dashboard");
  },
};
