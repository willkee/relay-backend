const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("./svcAccount.json");

const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// Initialize Firebase App
initializeApp({ credential: cert(serviceAccount) });

const apiRoutes = require("./routes");
const { environment } = require("./config");

const isProduction = environment === "production";

const app = express();

app.use(express.json());
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
	helmet({
		contentSecurityPolicy: false,
	})
);

app.use("/api/v1", apiRoutes);

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
	const err = new Error("The requested resource couldn't be found.");
	err.title = "Resource Not Found";
	err.errors = ["The requested resource couldn't be found."];
	err.status = 404;
	next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
	res.status(err.status || 500);
	console.error(err);
	res.json({
		title: err.title || "Server Error",
		message: err.message,
		errors: err.errors,
		stack: isProduction ? null : err.stack,
	});
});

exports.app = onRequest(app);
