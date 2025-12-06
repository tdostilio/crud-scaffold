require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const connectDB = require("./config/database")
const logger = require("./src/utils/logger")

// Import routes
const invoiceRoutes = require("./src/routes/invoice")
const apiKeyRoutes = require("./src/routes/apiKey")

// Connect to database
connectDB()

// Initialize Express app
const app = express()

// Middleware
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is running" })
})

app.use("/api/invoices", invoiceRoutes)
app.use("/api/api-keys", apiKeyRoutes)

// Global error handler - should rarely be hit if controllers handle errors properly
app.use((err, req, res, next) => {
  // HandledError - these should be handled in controllers, but just in case
  if (err.handled) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    })
  }

  // Mongoose duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: "Duplicate entry",
    })
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    })
  }

  // Unexpected errors - log with full details
  logger.error("Unhandled error in global handler", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Never expose error details in production
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  })
})

// 404 handler - must come AFTER error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
