const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");


// ===============================
// CLOUDINARY UPLOAD HELPER
// ===============================

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "manoj-marble",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier
      .createReadStream(fileBuffer)
      .pipe(stream);
  });
};


// ===============================
// CREATE PRODUCT
// ===============================

const createProduct = async (req, res) => {
  try {
    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }
    const product = await Product.create({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      finish: req.body.finish,
      thickness: req.body.thickness,
      price: Number(req.body.price),
      availableQuantity: Number(req.body.availableQuantity),
      image: imageUrl,
      imagePublicId: imagePublicId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};


// ===============================
// GET ALL
// ===============================

const getProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};


// ===============================
// GET ONE
// ===============================

const getProduct = async (req, res) => {
  try {

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};


// ===============================
// UPDATE
// ===============================

const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(
      req.params.id
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      finish: req.body.finish,
      thickness: req.body.thickness,
      price: Number(req.body.price),
      availableQuantity: Number(
        req.body.availableQuantity
      ),
    };

    // New image uploaded
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer
      );

      updateData.image = result.secure_url;
      updateData.imagePublicId = result.public_id;

      // Delete old Cloudinary image
      if (existingProduct.imagePublicId) {
        await cloudinary.uploader.destroy(
          existingProduct.imagePublicId
        );
      }
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ===============================
// DELETE
// ===============================

const deleteProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete image from Cloudinary first
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(
        product.imagePublicId
      );
    }

    // Delete product from MongoDB
    await Product.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Product and its image deleted successfully",
    });

  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};