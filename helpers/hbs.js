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
  // Due Amount per Invoice
  invoiceDueAmount: (invoice) => {
    let paid = 0;
    invoice.transactions.map((tr) => {
      paid += tr.amount;
    });
    return invoice.amount - paid;
  },
  // Total Invoices Amount
  invoicesAmount: (invoices) => {
    let amount = 0;
    invoices.map((inv) => {
      amount += inv.amount;
    });
    return amount;
  },
  // Total Balance Amount
  invoicesDueAmount: (invoices) => {
    let amount = 0;
    let paid = 0;
    invoices.map((inv) => {
      amount += inv.amount;
      inv.transactions.map((tr) => (paid += tr.amount));
    });
    return amount - paid;
  },
};
