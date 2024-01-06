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

initializeApp(firebaseConfig);

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase/firestore");

const app = express();

const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");

const defaultFirestore = getFirestore();
const auth = getAuth();

app.use(express.json());
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: false }));

app.get("/hello", (req, res) => {
	res.send("Testing hello world Relay backend!");
});

// app.post("/register", async (req, res) => {
//     const { email, password } = req.body;

// });

exports.app = onRequest(app);
