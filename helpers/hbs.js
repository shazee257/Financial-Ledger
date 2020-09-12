const moment = require("moment");

module.exports = {
  formatDate: (date, format) => {
    return moment(date).format(format);
  },
  // Paid Amount per Invoice
  invoicePaidAmount: (invoice) => {
    let paid = 0;
    invoice.transactions.map((item) => {
      paid += item.amount;
    });
    return paid;
  },

  // Total Paid Amount
  invoicesPaidAmount: (invoices) => {
    let paid = 0;
    invoices.map((inv) => {
      inv.transactions.map((item) => {
        paid += item.amount;
      });
    });
    return paid;
  },

  selectedVendor: (id, id2) => {
    if (id.toString() === id2.toString()) {
      return `selected`;
    }
  },
  selectedOption: (id, id2) => {
    if (id.toString() === id2.toString()) {
      return `selected`;
    }
  },
  // Select auto on edit form
  select: (selected, options) => {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$& selected="selected"'
      )
      .replace(
        new RegExp(">" + selected + "</option>"),
        ' selected="selected"$&'
      );
  },
  // Invoice Amount
  invoiceAmount: (invoice) => {
    let amount = 0;
    invoice.items.map((item) => {
      amount += item.amount * item.quantity;
    });
    return amount;
  }, // Due Amount per Invoice
  invoiceDueAmount: (invoice) => {
    let amount = 0;
    let paid = 0;
    invoice.items.map((item) => {
      amount += item.amount * item.quantity;
    });
    invoice.transactions.map((tr) => {
      paid += tr.amount;
    });
    return amount - paid;
  },
  // Total Invoices Amount
  invoicesAmount: (invoices) => {
    let amount = 0;
    invoices.map((inv) => {
      inv.items.map((item) => {
        amount += item.amount * item.quantity;
      });
    });
    return amount;
  },
  // Total Balance Amount
  invoicesDueAmount: (invoices) => {
    let amount = 0;
    let paid = 0;
    invoices.map((inv) => {
      inv.items.map((item) => (amount += item.amount * item.quantity));
      inv.transactions.map((tr) => (paid += tr.amount));
    });
    return amount - paid;
  },
};
