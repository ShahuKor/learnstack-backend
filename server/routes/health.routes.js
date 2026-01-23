import express from "express";
import { getHealthCheckStatus } from "../controllers/health.controller.js";

const router = express.Router();

router.get("/", getHealthCheckStatus);

export default router;
