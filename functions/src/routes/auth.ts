import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const router = express.Router();

const auth = getAuth();
const db = getFirestore();

router.post(
	"/register",
	asyncHandler(async (req: Request, res: Response) => {
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

export default router;
