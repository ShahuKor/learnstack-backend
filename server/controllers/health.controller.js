import { getDbStatus } from "../database/db.js";

export const getHealthCheckStatus = async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    const healthStatus = {
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "healthy" : "unhealthy",
          details: {
            ...dbStatus,
            readyState: getReadyState(dbStatus.readyState),
          },
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };
    const httpStatus =
      healthStatus.services.database.status === "healthy" ? 200 : 503;

    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.error("We failed to check the health status", error);
  }
};

function getReadyState(state) {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";

    default:
      return "unkown";
  }
}
