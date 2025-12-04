const Invoice = require("../models/Invoice")
const logger = require("../utils/logger")
const validator = require("validator")

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public
const getAllInvoices = async (req, res) => {}

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Public
const getInvoice = async (req, res) => {}

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Public
const createInvoice = async (req, res) => {
  logger.info("hit method")
  return res.status(201).send({ success: true, invoice: {} })
}

// @desc    Update invoice
// @route   PATCH /api/invoices/:id
// @access  Public
const updateInvoice = async (req, res) => {}

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Public
const deleteInvoice = async (req, res) => {}

module.exports = {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
}
