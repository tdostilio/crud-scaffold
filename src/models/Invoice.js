const mongoose = require("mongoose")
const logger = require("../utils/logger")
const validator = require("validator")
const HandledError = require("../utils/HandledError")

const invoiceSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  }
)

invoiceSchema.statics.createInvoice = async function (data) {}

invoiceSchema.statics.updateInvoice = async function (id, data) {}

invoiceSchema.statics.deleteInvoice = async function (id) {}

const Invoice = mongoose.model("Invoice", invoiceSchema)

module.exports = Invoice
