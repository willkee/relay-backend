import dotenv from "dotenv";
dotenv.config();

export const environment = process.env.NODE_ENV || "development";
export const port = process.env.PORT || 5000;
