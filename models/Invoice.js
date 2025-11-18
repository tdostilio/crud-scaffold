const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

invoiceSchema.statics.createInvoice = async function (data) {
  // Add any custom validation or preprocessing here
  if (!data.email) {
    throw new Error("Email is required")
  }

  if (!data.description) {
    data.description = `Auto-generated description for ${data.name}`
  }

  data.status = "active"

  // Create and return the document
  const item = await this.create(data)
  return item
}

invoiceSchema.statics.updateInvoice = async function (id, data) {
  // Prevent status from being changed via update
  delete data.status

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
