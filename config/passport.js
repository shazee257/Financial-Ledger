const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Model
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "phone" },
      async (phone, password, done) => {
        // Match user
        let user = await User.findOne({ phone: phone });
        if (!user) {
          return done(null, false, { message: "Phone is not registered!" });
        }
        // Match password
        await bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Password is incorrect!" });
          }
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    await User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
