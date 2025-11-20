const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  }
)

invoiceSchema.statics.createInvoice = async function (data) {
  const item = await this.create(data)
  return item
}

invoiceSchema.statics.updateInvoice = async function (id, data) {
  return this.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
}

invoiceSchema.statics.deleteInvoice = async function (id) {
  return this.findByIdAndUpdate(
    id,
    {
      status: "deleted",
      deletedAt: new Date(),
    },
    { new: true }
  )
}

const Invoice = mongoose.model("Invoice", invoiceSchema)

module.exports = Invoice
