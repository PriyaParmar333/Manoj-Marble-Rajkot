const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// =====================================
// CORS
// =====================================

const frontendUrl = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / Thunder Client / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      // Allow local development on any Vite port
      const isLocalhost =
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      // Allow all origins only when FRONTEND_URL is explicitly "*"
      const allowAll = frontendUrl === "*";

      // Allow configured production frontend
      const isConfiguredFrontend =
        frontendUrl && frontendUrl !== "*" && origin === frontendUrl;

      if (isLocalhost || allowAll || isConfiguredFrontend) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =====================================
// BODY PARSERS
// =====================================

app.use(express.json());

// =====================================
// ROUTES
// =====================================

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// =====================================
// ROOT
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Manoj Marble API is running",
  });
});

// =====================================
// DATABASE + SERVER
// =====================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  });