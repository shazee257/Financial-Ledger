const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const { ensureAuthenticated } = require("./middleware/auth");

// Passport config
require("./config/passport")(passport);

// Load config
dotenv.config({ path: "./config/config.env" });

// Database Connection
connectDB();

const app = express();

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.isAdmin = () => {
    if (req.user.accessLevel === "Admin") {
      return true;
    } else {
      return false;
    }
  };
  next();
});

// Handlebars Helpers
const {
  formatDate,
  invoicePaidAmount,
  invoiceDueAmount,
  invoicesAmount,
  invoicesPaidAmount,
  invoicesDueAmount,
  selectedVendor,
  selectedOption, //to be deleted after replacing selectedOption
  select,
  invoiceAmount,
} = require("./helpers/hbs");

// View Engine Setup
app.engine(
  "hbs",
  exphbs({
    helpers: {
      formatDate,
      invoicePaidAmount,
      invoiceDueAmount,
      invoicesAmount,
      invoicesPaidAmount,
      invoicesDueAmount,
      selectedVendor, //to be deleted after replacing selectedOption
      selectedOption,
      select,
      invoiceAmount,
    },
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");

// Static folder
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", require("./routes/index"));
app.use("/users", ensureAuthenticated, require("./routes/user"));
app.use("/vendors", ensureAuthenticated, require("./routes/vendor"));
app.use("/customers", ensureAuthenticated, require("./routes/customer"));
app.use("/items", ensureAuthenticated, require("./routes/item"));

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(`Server running ${process.env.NODE_ENV} mode on port ${PORT}`)
);
