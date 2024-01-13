const axios = require("axios");
const express = require("express");
const asyncHandler = require("express-async-handler");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const router = express.Router();

const auth = getAuth();
const db = getFirestore();

const FIREBASE_API_KEY = process.env.FB_WEB_API_KEY;

router.get("/checkCookies", (req, res) => {
	res.json({ sessionCookie: !!req.cookies.session });
});

router.get("/reload", async (req, res) => {
	// On hard refresh, Redux data is lost. We want to regenerate the Redux store.
	// This route is called on hard refresh in App.js.
	const sessionCookie = req.cookies.session || "";
	console.log(req.cookies, "cookies");
	res.json({});
});

router.post(
	"/sessionLogin",
	asyncHandler(async (req, res) => {
		const { idToken, xsrfToken } = req.body;
		const id = idToken.toString();
		const xsrf = xsrfToken.toString();

		if (xsrf !== req.cookies["XSRF-TOKEN"]) {
			res.status(403).send("Unauthorized request!");
			return;
		}

		// Set session expiration to 5 days.
		const expiresIn = 60 * 60 * 24 * 5 * 1000;

		const sessionCookie = await auth.createSessionCookie(id, { expiresIn });
		const options = { maxAge: expiresIn, httpOnly: true, secure: true };
		res.cookie("session", sessionCookie, options);
		res.end(JSON.stringify({ status: "success" }));
	})
);

router.post(
	"/idToken",
	asyncHandler(async (req, res) => {
		const { idToken } = req.body;
		// await auth.verifyIdToken(idToken);

		// 1 hour in milliseconds = 3600000
		const options = { maxAge: 3600000, httpOnly: true, secure: true };
		res.cookie("id_token", idToken, options);
		res.json({ success: true });
	})
);

router.post(
	"/login",
	asyncHandler(async (req, res) => {
		const { email, password } = req.body;

		try {
			const userRecord = await auth.getUserByEmail(email);

			console.log(userRecord, "response from get user by email \n\n\n\n");

			const response = await axios.post(
				`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
				{ email, password, returnSecureToken: true }
			);
			console.log(response, "login response");

			if (response?.data) {
				res.json(response.data);
			} else {
				throw new Error("No or invalid response from Firebase.");
			}
		} catch (err) {
			const { data, status } = err.response || {};
			res.status(status || 500).json({
				error:
					data?.error?.message ||
					"Internal Server Error (Login route)",
			});
			console.log(`Unhandled Error: ${err}`);
		}
	})
);

router.post(
	"/register",
	asyncHandler(async (req, res) => {
		const { email, password, displayName, username, dob } = req.body;

		console.log(req.body, "req.body");

		try {
			const userRecord = await auth.createUser({
				email,
				password,
				displayName,
			});

			if (userRecord) {
				const uid = userRecord.uid;
				await db.collection("users").doc(uid).set({ email, username });
				const token = await auth.createCustomToken(uid);

				console.log(token, "token");

				res.json({ uid, email: userRecord.email, token });
			}
		} catch (err) {
			console.log("Error: ", err);
			res.status(500).json({ error: err.message });
		}
	})
);

module.exports = router;
