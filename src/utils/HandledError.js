/**
 * HandledError - A custom error class for expected application errors
 * These are errors we anticipate and handle gracefully (validation, not found, etc.)
 *
 * @example
 * throw new HandledError("Invalid email", 400)
 * throw new HandledError("Invoice not found", 404)
 */
class HandledError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.name = "HandledError"
    this.statusCode = statusCode
    this.handled = true

    // Maintain proper stack trace
    Error.captureStackTrace(this, HandledError)
  }
}

module.exports = HandledError
