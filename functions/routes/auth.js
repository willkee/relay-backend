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
	"/idToken",
	asyncHandler(async (req, res) => {
		const { idToken } = req.body;

		const {
			name: displayName,
			email,
			uid,
		} = await auth.verifyIdToken(idToken);

		if (!email) throw new Error("Invalid ID token.");

		// 1 hour in milliseconds = 3600000
		const options = { maxAge: 3600000, httpOnly: true, secure: true };
		res.cookie("id_token", idToken, options);
		res.json({ displayName, email, uid });
	})
);

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
	"/login",
	asyncHandler(async (req, res) => {
		const { email, password } = req.body;

		const userRecord = await auth.getUserByEmail(email);

		if (!userRecord || userRecord.disabled)
			throw new Error("User does not exist or has been disabled.");

		const response = await axios.post(
			`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
			{ email, password, returnSecureToken: true }
		);

		const id = response.data.idToken;
		// Set session expiration to 5 days.
		const expiresIn = 60 * 60 * 24 * 5 * 1000;

		const sessionCookie = await auth.createSessionCookie(id, { expiresIn });
		const options = { maxAge: expiresIn, httpOnly: true, secure: true };

		console.log(userRecord, "userRecord");

		res.cookie("id_token", id, options);
		res.cookie("session", sessionCookie, options);
		res.json({
			email: userRecord.email,
			uid: userRecord.uid,
			displayName: userRecord.displayName,
			phoneNumber: userRecord.phoneNumber,
		});
	})
);

router.post(
	"/register",
	asyncHandler(async (req, res) => {
		const { email, password, displayName, username, dob } = req.body;

		console.log(dob, "DOB");

		try {
			const userRecord = await auth.createUser({
				email,
				password,
				displayName,
			});

			if (userRecord) {
				const uid = userRecord.uid;
				await db
					.collection("users")
					.doc(uid)
					.set({
						email,
						username,
						displayName,
						dateOfBirth: new Date(dob.year, dob.month - 1, dob.day),
					});
				const token = await auth.createCustomToken(uid);
				res.json({ uid, email: userRecord.email, token });
			}
		} catch (err) {
			console.log("Error: ", err);
			res.status(500).json({ error: err.message });
		}
	})
);

module.exports = router;
