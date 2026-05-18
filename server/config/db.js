const mongoose = require("mongoose");

const LOCAL_URI = "mongodb://127.0.0.1:27017/recipeDB";
const MAX_RETRIES = 3;
const RETRY_MS = 1500;

async function connectWithUri(uri) {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

async function connectInMemory() {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri("recipeDB");
  await connectWithUri(uri);
  global.__mongoMemoryServer = memoryServer;
  console.log(
    "Using in-memory MongoDB (dev only). Data is lost when the server restarts."
  );
  console.log("For persistent data, install MongoDB or set MONGO_URI to Atlas.");
}

const connectDB = async () => {
  const useMemoryOnly = process.env.USE_MEMORY_DB === "true";
  const uri = process.env.MONGO_URI || LOCAL_URI;
  const isDefaultLocal =
    !process.env.MONGO_URI || process.env.MONGO_URI === LOCAL_URI;

  if (useMemoryOnly) {
    try {
      await connectInMemory();
      return;
    } catch (error) {
      console.error("In-memory MongoDB failed:", error.message);
      return;
    }
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await connectWithUri(uri);
      return;
    } catch (error) {
      console.error(
        `MongoDB attempt ${attempt}/${MAX_RETRIES} failed:`,
        error.message
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
      }
    }
  }

  if (process.env.NODE_ENV === "production" && !isDefaultLocal) {
    console.error("Could not connect to MongoDB. Check MONGO_URI.");
    return;
  }

  console.warn("Local MongoDB not found — starting in-memory database for dev...");
  try {
    await connectInMemory();
  } catch (error) {
    console.error("Could not start in-memory MongoDB:", error.message);
  }
};

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
