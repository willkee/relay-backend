const router = require("express").Router();
const authRouter = require("./auth");
const csrfRouter = require("./csrf");

router.use("/auth", authRouter);
router.use("/csrf", csrfRouter);

module.exports = router;
