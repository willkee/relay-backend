import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import createAssessment from "../utils/useRecaptcha";
const router = express.Router();

const auth = getAuth();
const db = getFirestore();

router.post(
	"/register",
	asyncHandler(async (req: Request, res: Response) => {
		const { email, password, displayName, username, dob, token } = req.body;

		if (!token) {
			res.status(400).json({ error: "reCAPTCHA token is missing" });
			return;
		}

		const assessmentResult = await createAssessment({
			token,
			recaptchaAction: "REGISTER",
		});

		if (!assessmentResult) {
			res.status(400).json({ error: "Invalid reCAPTCHA token" });
			return;
		}

		const { uid } = await auth.createUser({ email, password, displayName });

		if (!uid) throw new Error("Error in creating user.");

		const dateOfBirth = new Date(
			Date.UTC(dob.year, dob.month - 1, dob.day)
		);

		const badges = {
			staff: false,
			dev: false,
			bug_hunter: false,
		};

		await db
			.collection("users")
			.doc(uid)
			.set({
				email,
				username,
				displayName,
				friends: [],
				badges,
				avatar: "default_1",
				dateOfBirth: dateOfBirth.toISOString().split("T")[0],
			});

		res.json({ success: true });
	})
);

export default router;
