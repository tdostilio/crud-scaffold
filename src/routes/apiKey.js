const express = require("express")
const router = express.Router()
const requireAuth = require("../middleware/requireAuth")

// Import controllers
const { createApiKey, getAllApiKeys, revokeApiKey } = require("../controllers/apiKeyController")

// Create API key endpoint is public (no auth required - you need a key to get a key!)
// All other endpoints require authentication
router.post("/", createApiKey)

// Protected routes - require authentication
router.use(requireAuth)
router.route("/").get(getAllApiKeys)
router.route("/:id/revoke").patch(revokeApiKey)

module.exports = router
