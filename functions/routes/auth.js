// const axios = require("axios");
const express = require("express");
const asyncHandler = require("express-async-handler");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const router = express.Router();

const auth = getAuth();
const db = getFirestore();

// const FIREBASE_API_KEY = process.env.FB_WEB_API_KEY;

router.get("/checkCookies", (req, res) => {
	res.json({ sessionCookie: !!req.cookies.session });
});

router.post(
	"/sessionLogin",
	asyncHandler(async (req, res) => {
		const { idToken, xsrfToken } = req.body;
		const id = idToken.toString();
		const xsrf = xsrfToken.toString();

		if (xsrf !== req.cookies["XSRF-TOKEN"]) {
			return res.status(403).send("Unauthorized request!");
		}

		// Set session expiration to 5 days.
		const expiresIn = 60 * 60 * 24 * 5 * 1000;

		const sessionCookie = await auth.createSessionCookie(id, { expiresIn });
		const options = { maxAge: expiresIn, httpOnly: true, secure: true };
		res.cookie("session", sessionCookie, options);
		res.json({ success: true });
	})
);

router.post(
	"/register",
	asyncHandler(async (req, res) => {
		const { email, password, displayName, username, dob } = req.body;
		const { uid } = await auth.createUser({ email, password, displayName });

		if (!uid) throw new Error("Error in creating user.");

		const dateOfBirth = new Date(dob.year, dob.month - 1, dob.day);

		await db
			.collection("users")
			.doc(uid)
			.set({ email, username, displayName, dateOfBirth });

		res.json({ success: true });
	})
);

// router.post(
// 	"/login",
// 	asyncHandler(async (req, res) => {
// 		const { email, password } = req.body;

// 		const user = await auth.getUserByEmail(email);

// 		if (!user || user.disabled)
// 			throw new Error("User does not exist or has been disabled.");

// 		const { data } = await axios.post(
// 			`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
// 			{ email, password, returnSecureToken: true }
// 		);

// 		const id = data?.idToken;

// 		// Set session expiration to 5 days.
// 		const expiresIn = 60 * 60 * 24 * 5 * 1000;

// 		const sessionCookie = await auth.createSessionCookie(id, { expiresIn });
// 		const options = { maxAge: expiresIn, httpOnly: true, secure: true };

// 		res.cookie("id_token", id, options);
// 		res.cookie("session", sessionCookie, options);
// 		res.json({
// 			email: user.email,
// 			uid: user.uid,
// 			displayName: user.displayName,
// 			phoneNumber: user.phoneNumber,
// 		});
// 	})
// );

// router.get("/reload", async (req, res) => {
// 	console.log(req.cookies, "cookies");
// });

module.exports = router;
