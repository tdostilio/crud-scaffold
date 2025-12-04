// Middleware: Extract tenant from header
const requireTenant = (req, res, next) => {
  const tenantId = req.headers["x-tenant-id"]

  if (!tenantId) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  req.tenantId = tenantId
  next()
}

module.exports = requireTenant
