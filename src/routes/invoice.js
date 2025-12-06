const express = require("express")
const router = express.Router()
const requireAuth = require("../middleware/requireAuth")
const {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController")

// All invoice routes require authentication
router.use(requireAuth)

router.route("/").get(getAllInvoices).post(createInvoice)

router.route("/:id").get(getInvoice).patch(updateInvoice).delete(deleteInvoice)

module.exports = router
