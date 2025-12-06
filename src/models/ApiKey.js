const mongoose = require("mongoose")
const logger = require("../utils/logger")
const validator = require("validator")
const crypto = require("crypto")

const apiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tenantId: { type: String, required: true, index: true },
    keyHash: { type: String, required: true, unique: true, index: true }, // hashed version of the API key
    keyPrefix: { type: String, required: true }, // first few chars for identification (e.g., "sk_live_abc...")
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      index: true,
    },
    expiresAt: { type: Date, index: true },
    lastUsedAt: { type: Date },
    permissions: [{ type: String }], // optional: array of permission strings
    metadata: { type: mongoose.Schema.Types.Mixed }, // optional: additional metadata
  },
  {
    timestamps: true,
  }
)

// Static method to create a new API key
apiKeySchema.statics.createApiKey = async function (data) {
  const { name, tenantId, expiresAt, permissions, metadata } = data
  try {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new Error("name is required and must be a non-empty string")
    }
    if (!tenantId || typeof tenantId !== "string") {
      throw new Error("tenantId is required")
    }
    if (expiresAt && !validator.isDate(expiresAt)) {
      throw new Error("expiresAt must be a valid date")
    }

    // Generate a secure random API key
    const apiKey = `sk_live_${crypto.randomBytes(32).toString("hex")}`
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
    const keyPrefix = apiKey.substring(0, 12) // "sk_live_abc"

    const apiKeyDoc = await ApiKey.create({
      name,
      tenantId,
      keyHash,
      keyPrefix,
      expiresAt,
      permissions: permissions || [],
      metadata: metadata || {},
      status: "active",
    })

    // Return the document with the plain key (only time it's exposed)
    return {
      ...apiKeyDoc.toObject(),
      apiKey, // include the plain key only on creation
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

// Static method to validate an API key
apiKeySchema.statics.validateApiKey = async function (apiKey) {
  try {
    if (!apiKey || typeof apiKey !== "string") {
      return null
    }

    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex")
    const apiKeyDoc = await ApiKey.findOne({ keyHash, status: "active" })

    if (!apiKeyDoc) {
      return null
    }

    // Check if expired
    if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < new Date()) {
      await ApiKey.findByIdAndUpdate(apiKeyDoc._id, { status: "expired" })
      return null
    }

    // Update last used timestamp
    await ApiKey.findByIdAndUpdate(apiKeyDoc._id, { lastUsedAt: new Date() })

    return apiKeyDoc
  } catch (err) {
    logger.error(err)
    return null
  }
}

// Static method to revoke an API key
apiKeySchema.statics.revokeApiKey = async function (id, tenantId) {
  try {
    const apiKey = await ApiKey.findOne({ _id: id, tenantId })
    if (!apiKey) {
      throw new Error("API key not found")
    }
    apiKey.status = "revoked"
    await apiKey.save()
    return apiKey
  } catch (err) {
    logger.error(err)
    throw err
  }
}

// Static method to update an API key
// SECURITY: Only allows updating safe fields (name, metadata)
// Status, expiresAt, and permissions should be managed through dedicated methods
apiKeySchema.statics.updateApiKey = async function (id, tenantId, data) {
  try {
    const { name, metadata } = data
    const updateData = {}

    // Only allow updating name and metadata for security
    // Status changes should use revokeApiKey() or dedicated activate/deactivate methods
    // Expiration should not be extended (only shortened if needed)
    // Permissions should not be changed after creation (security risk)

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        throw new Error("name must be a non-empty string")
      }
      updateData.name = name.trim()
    }

    if (metadata !== undefined) {
      updateData.metadata = metadata
    }

    // Prevent updating status, expiresAt, or permissions through this method
    if (data.status !== undefined || data.expiresAt !== undefined || data.permissions !== undefined) {
      throw new Error(
        "Cannot update status, expiresAt, or permissions through this method. Use dedicated methods (revokeApiKey, etc.)"
      )
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid fields to update")
    }

    const apiKey = await ApiKey.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!apiKey) {
      throw new Error("API key not found")
    }

    return apiKey
  } catch (err) {
    logger.error(err)
    throw err
  }
}

// Static method to delete an API key
apiKeySchema.statics.deleteApiKey = async function (id, tenantId) {
  try {
    const apiKey = await ApiKey.findOneAndDelete({ _id: id, tenantId })
    if (!apiKey) {
      throw new Error("API key not found")
    }
    return apiKey
  } catch (err) {
    logger.error(err)
    throw err
  }
}

// Index for efficient queries
apiKeySchema.index({ tenantId: 1, status: 1 })
apiKeySchema.index({ tenantId: 1, createdAt: -1 })

const ApiKey = mongoose.model("ApiKey", apiKeySchema)

module.exports = ApiKey
