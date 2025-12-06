const handleControllerError = (res, err, context = "") => {
  // HandledError (expected errors)
  if (err.handled) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: "Duplicate entry",
    })
  }

  // Unexpected errors
  console.error(`Unexpected error ${context}:`, err)
  return res.status(500).json({
    success: false,
    error: "Something went wrong",
  })
}

module.exports = handleControllerError
