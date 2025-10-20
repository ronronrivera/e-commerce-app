import express from "express";

import authRoutes from "./routes/auth.route.js";
import productsRoutes from "./routes/product.routes.js";

import { connectDB } from "./lib/db.js";
import "dotenv/config"
import cookieParser from "cookie-parser";


const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json()) //req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

app.listen(PORT, () =>{
	console.log(`Server is running on http://localhost:${PORT}/`)
	connectDB();
})


