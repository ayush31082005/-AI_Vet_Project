
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/DB");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log("Server Error:", error.message);
    process.exit(1);
  }
};

startServer();
