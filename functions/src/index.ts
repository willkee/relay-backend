import express, { Request, Response, NextFunction } from "express";
import csrf from "csurf";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import serviceAccount from "./svcAccount.json";
import { initializeApp, cert } from "firebase-admin/app";

initializeApp({ credential: cert(serviceAccount as any) });
import { onRequest } from "firebase-functions/v2/https";

import apiRoutes from "./routes";
import CustomError from "./utils/customError";

import { environment } from "../config";
const isProduction = environment === "production";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser() as any);
app.use(csrf({ cookie: true }) as any);
app.use(
	helmet({
		contentSecurityPolicy: false,
	})
);

app.get("/test", (_req: Request, res: Response) => {
	res.json({ message: "Hello from server!" });
});

app.use("/api/v1", apiRoutes);

// Catch unhandled requests and forward to error handler.
app.use((_req: Request, _res: Response, next: NextFunction) => {
	const err = new CustomError(
		"The requested resource couldn't be found.",
		"Resource Not Found",
		["The requested resource couldn't be found."],
		404
	);
	next(err);
});

// Error formatter
app.use(
	(
		err: CustomError | Error,
		_req: Request,
		res: Response,
		_next: NextFunction
	) => {
		// Default values for a generic error
		let errorCode = 500;
		let errorTitle = "Server Error";
		let errorMessages = ["An unexpected error occurred"];

		// If the error is an instance of CustomError, use its properties
		if (err instanceof CustomError) {
			errorCode = err.status || 500;
			errorTitle = err.title;
			errorMessages = err.errors;
		}

		res.status(errorCode);
		console.error(err);
		res.json({
			title: errorTitle,
			message: err.message,
			errors: errorMessages,
			stack: isProduction ? null : err.stack,
		});
	}
);

export default onRequest(app);
