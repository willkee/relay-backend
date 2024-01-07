const axios = require("axios");
const express = require("express");
const asyncHandler = require("express-async-handler");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const router = express.Router();

const auth = getAuth();
const db = getFirestore();

const FIREBASE_API_KEY = process.env.FB_WEB_API_KEY;

router.get("/test", async (req, res) => {
	const userRef = db.collection("users");
	const doc = await userRef.get();

	if (!doc) {
		console.log("No such document!");
	} else {
		console.log(doc);
	}
	res.send("Hello world!");
});

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
		const { email, password, phoneNumber } = req.body;

		// TODO: SET UP PASSWORD COMPLEXITY CHECK

		try {
			const userRecord = await auth.createUser({
				email,
				password,
				phoneNumber,
			});

			if (userRecord) {
				const response = await db
					.collection("users")
					.doc(userRecord.uid)
					.set({
						email,
					});

				console.log(response, "db response");
				res.send(`User record created with UID: ${userRecord.uid}`);
			}
		} catch (err) {
			console.log("Error: ", err);
			res.status(500).json({
				error: err.message,
			});
		}
	})
);

module.exports = router;
