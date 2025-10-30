import express from "express";
import path from "path";

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

const __dirname = path.resolved();

app.use(express.json({limit: "10mb"})) //req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponsRoutes)
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if(process.env.NODE_ENV === "production"){
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (_, res) =>{
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

try{
	await connectDB();
	app.listen(PORT, () =>{
		console.log(`Server is running on http://localhost:${PORT}/`)
	})
}
catch(error){
	console.log("Failed to connect to the database", error)
	process.exit(1);
}

/*
connectDB().then(() =>{
	app.listen(PORT, () =>{
		console.log(`Server is running on http://localhost:${PORT}/`)
	});
}).catch((error) =>{
	console.error("Failed to connect to the database: ", error);
	process.exit(1);
});
*/
