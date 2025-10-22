import express from "express";

import authRoutes from "./routes/auth.route.js";
import productsRoutes from "./routes/product.routes.js";

import { connectDB } from "./lib/db.js";
import "dotenv/config"
import cookieParser from "cookie-parser";
import cartRoutes from "./routes/cart.route.js"
import couponsRoutes from "./routes/coupons.route.js"
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json()) //req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponsRoutes)
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

connectDB().then(() =>{
	app.listen(PORT, () =>{
		console.log(`Server is running on http://localhost:${PORT}/`)
	});
}).catch((error) =>{
	console.error("Failed to connect to the database: ", error);
	process.exit(1);
});
