import "express";

declare module "express-serve-static-core" {
	interface Request {
		csrfToken(): string;
	}
}
declare module "*.svg" {
	const content: string;
	export default content;
}
