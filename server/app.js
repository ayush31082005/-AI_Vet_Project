
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const petRoutes = require("./routes/petRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const medicalHistoryRoutes = require("./routes/medicalHistoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiProviderRoutes = require("./routes/aiProviderRoutes");
const aiModelRoutes = require("./routes/aiModelRoutes");
const aiChatRoutes = require("./routes/aiChatRoutes");

const app = express();


// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ================= STATIC FILES =================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


// ================= TEST API =================

app.get("/", (req, res) => {

  res.send("AI Vet API is Working!");

});


// ================= HEALTH API =================

app.get("/api/health", (req, res) => {

  res.status(200).json({

    success: true,

    message: "AI Vet Backend is Running"

  });

});


// ================= API ROUTES =================

app.use("/api/auth", authRoutes);

app.use("/api/pets", petRoutes);

app.use("/api/doctors", doctorRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/prescriptions", prescriptionRoutes);

app.use("/api/medical-history", medicalHistoryRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/ai/providers", aiProviderRoutes);

app.use("/api/ai/models", aiModelRoutes);

app.use("/api/ai/chat", aiChatRoutes);


// ================= INVALID ROUTE =================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Route Not Found"

  });

});


// ================= ERROR HANDLER =================

app.use((error, req, res, next) => {

  console.log(error.message);

  if (error instanceof multer.MulterError) {

    return res.status(400).json({

      success: false,

      message: error.code === "LIMIT_FILE_SIZE"
        ? "Image size must be less than 5 MB"
        : error.message

    });

  }

  if (
    error.message ===
    "Only JPG, PNG and WEBP images are allowed"
  ) {

    return res.status(400).json({

      success: false,

      message: error.message

    });

  }

  return res.status(
    error.status === 400 ? 400 : 500
  ).json({

    success: false,

    message: error.status === 400
      ? "Invalid Request"
      : "Server Error"

  });

});


module.exports = app;
