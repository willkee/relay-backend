const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.cookie("XSRF-TOKEN", req.csrfToken());
	res.status(201).json({});
});

module.exports = router;
