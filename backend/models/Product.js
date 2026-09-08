const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Indian Marble",
        "Italian Marble",
        "Granite",
        "Glass",
      ],
    },

    description: {
      type: String,
      required: true,
    },

    finish: {
      type: String,
      required: true,
    },

    thickness: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    availableQuantity: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;