const express = require("express");
const cors = require("cors");
const { onRequest } = require("firebase-functions/v2/https");

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./svcAccount.json");

// Initialize Firebase App
initializeApp({ credential: cert(serviceAccount) });

// Initialize Firebase Auth and Firestore
const auth = getAuth();
const db = getFirestore();

const app = express();

app.use(express.json());
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: false }));

// app.get("/", async (req, res) => {
// 	try {
// 		// Perform Firestore operation to test
// 		const querySnapshot = await getDocs(collection(db, "your_collection"));
// 		querySnapshot.forEach((doc) => {
// 			console.log(doc.id, "=>", doc.data());
// 		});

// 		res.send("Testing hello world Relay backend!");
// 	} catch (error) {
// 		console.error("Error:", error);
// 		res.status(500).send("Internal Server Error");
// 	}
// });

app.get("/", async (req, res) => {
	const userRef = db.collection("users");
	const doc = await userRef.get();

	if (!doc) {
		console.log("No such document!");
	} else {
		console.log(doc);
	}
	res.send("Hello world!");
});

app.post("/register", async (req, res) => {
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
});

exports.app = onRequest(app);
