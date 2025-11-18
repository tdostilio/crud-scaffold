const Invoice = require("../models/Invoice")

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ status: { $ne: "deleted" } })
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching invoices",
      error: error.message,
    })
  }
}

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Public
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)

    if (!invoice || invoice.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "invoice not found",
      })
    }

    res.status(200).json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching invoice",
      error: error.message,
    })
  }
}

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Public
const createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.createInvoice(req.body)
    res.status(201).json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating invoice",
      error: error.message,
    })
  }
}

// @desc    Update invoice
// @route   PATCH /api/invoices/:id
// @access  Public
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.updateInvoice(req.params.id, req.body)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "invoice not found",
      })
    }

    res.status(200).json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating invoice",
      error: error.message,
    })
  }
}

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Public
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.deleteInvoice(req.params.id)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "invoice not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "invoice deleted successfully",
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting invoice",
      error: error.message,
    })
  }
}

module.exports = {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
}
