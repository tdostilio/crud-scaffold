const ApiKey = require("../models/ApiKey")
const logger = require("../utils/logger")

// Middleware: Authenticate requests using Bearer token (API key)
// Extracts API key from Authorization header, validates it, and sets tenantId on request
const requireAuth = async (req, res, next) => {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Missing or invalid Authorization header. Expected format: 'Bearer <api-key>'",
      })
    }

    // Extract the API key (everything after "Bearer ")
    const apiKey = authHeader.substring(7).trim()

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - API key is required",
      })
    }

    // Validate the API key and get the API key document
    const apiKeyDoc = await ApiKey.validateApiKey(apiKey)

    if (!apiKeyDoc) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Invalid or expired API key",
      })
    }

    // Set tenantId on request for use in controllers
    req.tenantId = apiKeyDoc.tenantId

    // Optionally attach the full API key document if needed elsewhere
    req.apiKey = {
      id: apiKeyDoc._id,
      name: apiKeyDoc.name,
      permissions: apiKeyDoc.permissions,
    }

    next()
  } catch (err) {
    logger.error("Error in requireAuth middleware", { error: err.message })
    return res.status(500).json({
      success: false,
      error: "Internal server error during authentication",
    })
  }
}

module.exports = requireAuth
