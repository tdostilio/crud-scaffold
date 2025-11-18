const Item = require("../models/Item")

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ status: { $ne: "deleted" } })
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    })
  }
}

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)

    if (!item || item.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    res.status(200).json({
      success: true,
      data: item,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching item",
      error: error.message,
    })
  }
}

// @desc    Create new item
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
  try {
    const item = await Item.createItem(req.body)
    res.status(201).json({
      success: true,
      data: item,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating item",
      error: error.message,
    })
  }
}

// @desc    Update item
// @route   PATCH /api/items/:id
// @access  Public
const updateItem = async (req, res) => {
  try {
    const item = await Item.updateItem(req.params.id, req.body)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    res.status(200).json({
      success: true,
      data: item,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    })
  }
}

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const item = await Item.deleteItem(req.params.id)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      data: {},
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    })
  }
}

module.exports = {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
}
