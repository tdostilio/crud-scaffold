const ApiKey = require("../models/ApiKey")
const logger = require("../utils/logger")

/**
 * @desc    Create new API key
 * @route   POST /api/api-keys
 * @access  Public (no auth required - you need a key to get a key!)
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - The name/description of the API key
 * @param {Date} [req.body.expiresAt] - Optional expiration date for the API key
 * @param {string[]} [req.body.permissions] - Optional array of permission strings
 * @param {Object} [req.body.metadata] - Optional metadata object
 * @returns {Object} 201 - Success response with the API key (only time plain key is exposed)
 * @returns {Object} 500 - Error response
 * @example
 * // POST /api/api-keys
 * {
 *   "name": "Production API Key",
 *   "expiresAt": "2024-12-31T00:00:00.000Z",
 *   "permissions": ["read", "write"]
 * }
 * // Note: For production, you might want to require some other form of auth (e.g., user session)
 */
const createApiKey = async (req, res) => {
  try {
    const { name, expiresAt, permissions, metadata } = req.body

    // Hardcoded tenantId for testing - remove this in production
    // In production, you might get this from:
    // - req.user?.tenantId (if user is authenticated via session)
    // - req.body.tenantId (if passed in request)
    // - Some other authentication mechanism
    const tenantId = "test-tenant-123"

    const data = {
      name,
      tenantId,
      expiresAt,
      permissions,
      metadata,
    }

    const result = await ApiKey.createApiKey(data)

    // Return the API key (only time it's exposed)
    return res.status(201).json({
      success: true,
      apiKey: result.apiKey,
      apiKeyData: {
        id: result._id,
        name: result.name,
        keyPrefix: result.keyPrefix,
        status: result.status,
        expiresAt: result.expiresAt,
        createdAt: result.createdAt,
      },
    })
  } catch (err) {
    logger.error("Error creating API key", { error: err.message })
    return res.status(500).json({
      success: false,
      error: err.message || "Error creating API key",
    })
  }
}

/**
 * @desc    Get all API keys for tenant
 * @route   GET /api/api-keys
 * @access  Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {string} req.tenantId - Tenant ID set by requireAuth middleware
 * @returns {Object} 200 - Success response with array of API keys (keyHash excluded)
 * @returns {Object} 401 - Unauthorized if tenantId is missing
 * @returns {Object} 500 - Error response
 * @description Returns all API keys for the authenticated tenant, sorted by creation date (newest first)
 * @example
 * // GET /api/api-keys
 * // Headers: Authorization: Bearer sk_live_abc123...
 */
const getAllApiKeys = async (req, res) => {
  try {
    // tenantId is set by requireAuth middleware
    const tenantId = req.tenantId

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - tenantId not found",
      })
    }

    const apiKeys = await ApiKey.find({ tenantId }).select("-keyHash").sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      apiKeys,
    })
  } catch (err) {
    logger.error("Error fetching API keys", { error: err.message })
    return res.status(500).json({
      success: false,
      error: err.message || "Error fetching API keys",
    })
  }
}

/**
 * @desc    Revoke an API key
 * @route   PATCH /api/api-keys/:id/revoke
 * @access  Private (requires authentication)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - The API key ID to revoke
 * @param {string} req.tenantId - Tenant ID set by requireAuth middleware
 * @returns {Object} 200 - Success response with revoked API key details
 * @returns {Object} 401 - Unauthorized if tenantId is missing
 * @returns {Object} 500 - Error response
 * @description Revokes an API key by setting its status to "revoked". The key will no longer be valid for authentication.
 * @example
 * // PATCH /api/api-keys/507f1f77bcf86cd799439011/revoke
 * // Headers: Authorization: Bearer sk_live_abc123...
 */
const revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params

    // tenantId is set by requireAuth middleware
    const tenantId = req.tenantId

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - tenantId not found",
      })
    }

    const apiKey = await ApiKey.revokeApiKey(id, tenantId)

    return res.status(200).json({
      success: true,
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        status: apiKey.status,
        updatedAt: apiKey.updatedAt,
      },
    })
  } catch (err) {
    logger.error("Error revoking API key", { error: err.message })
    return res.status(500).json({
      success: false,
      error: err.message || "Error revoking API key",
    })
  }
}

module.exports = {
  createApiKey,
  getAllApiKeys,
  revokeApiKey,
}
