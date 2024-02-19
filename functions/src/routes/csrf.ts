import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
	res.status(201).json({ csrfToken: req.csrfToken() });
});

export default router;
