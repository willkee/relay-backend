import express from "express";
import authRouter from "./auth.js";
import csrfRouter from "./csrf.js";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/csrf", csrfRouter);

export default router;
