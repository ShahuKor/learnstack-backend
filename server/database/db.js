import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; //5secs

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;
    mongoose.set("strictQuery", true);
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected Successfully");
      this.isConnected = true;
    });
    mongoose.connection.on("error", () => {
      console.log("MongoDB connection Error");
      this.isConnected = false;
    });
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      this.isConnected = false;
    });
  }

  async connect() {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDb URI is not defined in the env file");
    }

    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 4500,
      family: 4,
    };

    if (process.env.NODE_ENV === "development") {
      mongoose.set("debug", true);
    }

    await mongoose.connect(process.env.MONGO_URI, connectionOptions);
  }
}
