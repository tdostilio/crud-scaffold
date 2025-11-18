const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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

itemSchema.statics.createItem = async function (data) {
  // Add any custom validation or preprocessing here
  if (!data.name) {
    throw new Error("Name is required")
  }

  if (!data.description) {
    data.description = `Auto-generated description for ${data.name}`
  }

  data.status = "active"

  // Create and return the document
  const item = await this.create(data)
  return item
}

itemSchema.statics.updateItem = async function (id, data) {
  // Prevent status from being changed via update
  delete data.status

  return this.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
}

itemSchema.statics.deleteItem = async function (id) {
  return this.findByIdAndUpdate(
    id,
    {
      status: "deleted",
      deletedAt: new Date(),
    },
    { new: true }
  )
}

const Item = mongoose.model("Item", itemSchema)

module.exports = Item
