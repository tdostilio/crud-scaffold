const winston = require("winston")

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // In development: log to console
    // In production: log to files
    ...(process.env.NODE_ENV === "production"
      ? [
          // Write errors to error.log
          new winston.transports.File({ filename: "logs/error.log", level: "error" }),
          // Write all logs to combined.log
          new winston.transports.File({ filename: "logs/combined.log" }),
        ]
      : [
          // Development: console with readable format
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString = Object.keys(meta).length ? JSON.stringify(meta) : ""
                return `${timestamp} ${level}: ${message}${metaString ? " " + metaString : ""}`
              })
            ),
          }),
        ]),
  ],
})

module.exports = logger

