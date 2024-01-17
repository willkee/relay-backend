const express = require("express");
const router = express.Router();

const asyncHandler = require("express-async-handler");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const auth = getAuth();
const db = getFirestore();

router.post(
	"/register",
	asyncHandler(async (req, res) => {
		const { email, password, displayName, username, dob } = req.body;
		const { uid } = await auth.createUser({ email, password, displayName });

		if (!uid) throw new Error("Error in creating user.");

		const dateOfBirth = new Date(
			Date.UTC(dob.year, dob.month - 1, dob.day)
		);

		await db
			.collection("users")
			.doc(uid)
			.set({
				email,
				username,
				displayName,
				dateOfBirth: dateOfBirth.toISOString().split("T")[0],
			});

		res.json({ success: true });
	})
);

// router.get("/checkCookies", (req, res) => {
// 	res.json({ sessionCookie: !!req.cookies.session });
// });

// router.post(
// 	"/sessionLogin",
// 	asyncHandler(async (req, res) => {
// 		const { idToken, xsrfToken } = req.body;
// 		const id = idToken.toString();
// 		const xsrf = xsrfToken.toString();

// 		if (xsrf !== req.cookies["XSRF-TOKEN"]) {
// 			return res.status(403).send("Unauthorized request!");
// 		}

// 		// Set session expiration to 5 days.
// 		const expiresIn = 60 * 60 * 24 * 5 * 1000;

// 		const sessionCookie = await auth.createSessionCookie(id, { expiresIn });
// 		const options = { maxAge: expiresIn, httpOnly: true, secure: true };
// 		res.cookie("session", sessionCookie, options);
// 		res.json({ success: true });
// 	})
// );

module.exports = router;
