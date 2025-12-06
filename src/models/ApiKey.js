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

/**
 * Create a new API key
 * @static
 * @param {Object} data - The API key data
 * @param {string} data.name - The name/description of the API key
 * @param {string} data.tenantId - The tenant ID associated with the API key
 * @param {Date} [data.expiresAt] - Optional expiration date for the API key
 * @param {string[]} [data.permissions] - Optional array of permission strings
 * @param {Object} [data.metadata] - Optional metadata object
 * @returns {Promise<Object>} The created API key document with the plain API key (only exposed on creation)
 * @throws {Error} If name or tenantId is missing or invalid
 * @example
 * const result = await ApiKey.createApiKey({
 *   name: "Production API Key",
 *   tenantId: "tenant-123",
 *   expiresAt: new Date("2024-12-31"),
 *   permissions: ["read", "write"]
 * })
 * // result.apiKey contains the plain key (only time it's exposed)
 */
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

/**
 * Validate an API key and return the associated document
 * @static
 * @param {string} apiKey - The plain API key to validate
 * @returns {Promise<Object|null>} The API key document if valid and active, null otherwise
 * @description
 * - Hashes the provided API key and looks it up in the database
 * - Checks if the key is active and not expired
 * - Updates the lastUsedAt timestamp on successful validation
 * - Automatically marks expired keys as "expired" status
 * @example
 * const apiKeyDoc = await ApiKey.validateApiKey("sk_live_abc123...")
 * if (apiKeyDoc) {
 *   // Key is valid, use apiKeyDoc.tenantId
 * }
 */
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

/**
 * Revoke an API key by setting its status to "revoked"
 * @static
 * @param {string|ObjectId} id - The API key ID
 * @param {string} tenantId - The tenant ID (for security - ensures tenant can only revoke their own keys)
 * @returns {Promise<Object>} The revoked API key document
 * @throws {Error} If API key is not found
 * @example
 * const revokedKey = await ApiKey.revokeApiKey("507f1f77bcf86cd799439011", "tenant-123")
 */
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

/**
 * Update an API key (only safe fields)
 * @static
 * @param {string|ObjectId} id - The API key ID
 * @param {string} tenantId - The tenant ID (for security - ensures tenant can only update their own keys)
 * @param {Object} data - The fields to update
 * @param {string} [data.name] - The new name for the API key
 * @param {Object} [data.metadata] - The new metadata object
 * @returns {Promise<Object>} The updated API key document
 * @throws {Error} If API key is not found, or if attempting to update restricted fields (status, expiresAt, permissions)
 * @description
 * SECURITY: Only allows updating safe fields (name, metadata).
 * Status, expiresAt, and permissions should be managed through dedicated methods to prevent security issues.
 * @example
 * const updated = await ApiKey.updateApiKey("507f1f77bcf86cd799439011", "tenant-123", {
 *   name: "Updated Key Name",
 *   metadata: { note: "Updated metadata" }
 * })
 */
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

/**
 * Permanently delete an API key from the database
 * @static
 * @param {string|ObjectId} id - The API key ID
 * @param {string} tenantId - The tenant ID (for security - ensures tenant can only delete their own keys)
 * @returns {Promise<Object>} The deleted API key document
 * @throws {Error} If API key is not found
 * @description
 * WARNING: This permanently deletes the API key. Consider using revokeApiKey() instead if you want to keep a record.
 * @example
 * const deleted = await ApiKey.deleteApiKey("507f1f77bcf86cd799439011", "tenant-123")
 */
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
