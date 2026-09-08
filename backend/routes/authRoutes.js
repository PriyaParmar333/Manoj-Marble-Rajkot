const express = require("express");

const {
  loginOwner,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  loginOwner
);

module.exports = router;