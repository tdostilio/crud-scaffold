require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const connectDB = require("./config/database")
const logger = require("./src/utils/logger")

// Import routes
const invoiceRoutes = require("./src/routes/invoice")

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

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
  })
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
