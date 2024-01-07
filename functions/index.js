const dotenv = require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");

const { initializeApp } = require("firebase/app");

const firebaseConfig = {
	apiKey: process.env.FB_WEB_API_KEY,
	authDomain: process.env.FB_AUTH_DOMAIN,
	projectId: process.env.FB_PROJECT_ID,
	storageBucket: process.env.FB_STORAGE_BUCKET,
	appId: process.env.FB_APP_ID,
	measurementId: process.env.FB_MEASUREMENT_ID,
};
const functions = require("firebase-functions");

const admin = require("firebase-admin");
// admin.initializeApp(functions.config().firebase);

initializeApp(firebaseConfig);

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase/firestore");

const app = express();

const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");

const db = getFirestore();
const auth = getAuth();

app.use(express.json());
// app.use(
// 	cors({
// 		origin: "https://www.google.com",
// 	})
// );

app.use(cors({ origin: true }));

app.use(express.urlencoded({ extended: false }));

app.get("/stuff", async (req, res) => {
	console.log(req.headers.referer, "referrer");
	res.send("Testing hello world Relay backend!");
});

app.post("/register", async (req, res) => {
	const { email, password } = req.body;

	// TODO: SET UP PASSWORD COMPLEXITY CHECK

	try {
		const response = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);

		// console.log(
		// 	"\n\n\n\n\n LOGGER \n\n\n\n",
		// 	response.user.uid,
		// 	"\n\n\n\n\n LOGGER \n\n\n\n"
		// );

		if (response?.user?.uid) {
			const uid = response.user.uid;

			// console.log(db, "db?");

			const dbResponse = await db.collection("users").doc(uid).set({
				email,
			});

			// console.log(dbResponse, "db response");

			res.send(`Success. UID: ${response.uid}`);
		}
	} catch (err) {
		console.log("Error: ", err);
		res.status(500).json({
			error: err.message,
		});
	}
});

exports.app = onRequest(app);
