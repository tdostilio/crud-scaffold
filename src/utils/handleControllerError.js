const logger = require("./logger")

const handleControllerError = (res, err, context = "") => {
  // HandledError (expected errors)
  if (err.handled) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate entry",
    })
  }

  // Mongoose CastError
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
    })
  }

  // Unexpected errors
  logger.error(`Unexpected error ${context}`, {
    error: err.message,
    stack: err.stack,
    context,
  })

  return res.status(500).json({
    error: "Something went wrong",
  })
}

module.exports = handleControllerError
