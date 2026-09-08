const express = require("express");

const {
  loginOwner,
  changeOwnerCredentials,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// LOGIN
router.post(
  "/login",
  loginOwner
);


// CHANGE OWNER EMAIL + PASSWORD
router.put(
  "/change-credentials",
  protect,
  changeOwnerCredentials
);


module.exports = router;