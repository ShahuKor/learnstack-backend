import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; //5secs

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;
    mongoose.set("strictQuery", true);

    // Event listeners for mongoose connection events
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
      this.retryConnection();
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connect() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MongoDb URI is not defined in the env file");
      }

      const connectionOptions = {
        useNewUrlParser: true, // Uses new MongoDB connection string parser
        useUnifiedTopology: true, // Uses new connection management engine
        maxPoolSize: 10, // Maximum 10 simultaneous connections
        serverSelectionTimeoutMS: 5000, // Wait 5 seconds to find MongoDB server
        socketTimeoutMS: 4500, // Close inactive connections after 4.5 seconds
        family: 4, // Use IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0;
    } catch (error) {
      console.error(error.message);
      await this.handleConnetionError();
    }
  }

  async handleConnetionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying the connection, Attempt ${this.retryCount} / ${MAX_RETRIES}`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));

      return this.connect();
    } else {
      console.error(
        `Failed to connect to Mongodb after ${MAX_RETRIES} attempts`,
      );
      process.exit(1);
    }
  }

  async retryConnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to mongodb");
      this.connect();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (error) {
      console.error(
        "Error during disconnecting the database through app Termination error : ",
        error,
      );
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      hostName: mongoose.connection.host,
    };
  }
}

// create singleton object
const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);
export const getDbStatus = dbConnection.getConnectionStatus.bind(dbConnection);
