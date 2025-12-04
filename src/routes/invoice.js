const express = require("express")
const router = express.Router()
const requireTenant = require("../middleware/requireTenant")
const {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController")

router.use(requireTenant)

router.route("/").get(getAllInvoices).post(createInvoice)

router.route("/:id").get(getInvoice).patch(updateInvoice).delete(deleteInvoice)

module.exports = router
