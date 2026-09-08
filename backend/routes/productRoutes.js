const express = require("express");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const upload = require("../middleware/upload");

const {
  protect,
  ownerOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// PUBLIC ROUTES
// ===============================

router.get("/", getProducts);

router.get("/:id", getProduct);


// ===============================
// OWNER ONLY ROUTES
// ===============================

// CREATE PRODUCT
router.post(
  "/",
  protect,
  ownerOnly,
  upload.single("image"),
  createProduct
);


// UPDATE PRODUCT
router.put(
  "/:id",
  protect,
  ownerOnly,
  upload.single("image"),
  updateProduct
);


// DELETE PRODUCT
router.delete(
  "/:id",
  protect,
  ownerOnly,
  deleteProduct
);


module.exports = router;