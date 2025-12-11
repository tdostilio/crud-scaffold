const Invoice = require("../models/Invoice")
const handleControllerError = require("../utils/handleControllerError")

// @desc    Get all invoices
// @route   GET /api/invoices
const getAllInvoices = async (req, res) => {}

// @desc    Get single invoice
// @route   GET /api/invoices/:id
const getInvoice = async (req, res) => {}

// @desc    Create new invoice
// @route   POST /api/invoices
const createInvoice = async (req, res) => {
  return res.status(201).send({ invoice: {} })
}

// @desc    Update invoice
// @route   PATCH /api/invoices/:id
const updateInvoice = async (req, res) => {}

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {}

module.exports = {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
}
