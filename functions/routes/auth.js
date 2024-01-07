const express = require("express");
const asyncHandler = require("express-async-handler");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const router = express.Router();

const auth = getAuth();
const db = getFirestore();

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
