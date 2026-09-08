const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const createOwner = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    const name = "Manoj Marble Owner";
    const email = "owner@example.com";
    const password = "ChangeThis@12345";

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      console.log(
        "Owner already exists."
      );

      await mongoose.disconnect();
      return;
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "owner",
    });

    console.log(
      "Owner created successfully."
    );

    await mongoose.disconnect();

  } catch (error) {
    console.error(
      "Create owner error:",
      error
    );

    process.exit(1);
  }
};

createOwner();