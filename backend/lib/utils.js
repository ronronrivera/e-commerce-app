import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const generateToken = (userId) =>{
	const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET,{
		expiresIn: "15m",
	})
	
	const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d"
	})
	
	return {accessToken, refreshToken}
}

export const storeRefreshToken = async (userId, refreshToken) =>{
	await redis.set(`refresh_token:${userId}`, refreshToken, {
		ex: 7 * 24 * 60 * 60, //expiresIn 7 days
	}); 
	
}

export const setCookies = (res, accessToken, refreshToken) =>{
	res.cookie("accessToken", accessToken, {
		httpOnly: true, //prevent xss attack, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", //CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000,
	})
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, //prevent xss attack, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", //CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 1000,
	})
}

export const updateFeatureProductCached = async () =>{
	try{
		 //lean() is gonna return a plain javascript object instead of a mongodb document
		 //which is good performance
		const featuredProducts = await Product.find({isFeatured: true}).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts));

	}
	catch(error){
		console.log("Error in updateFeatureProductCached function", error.message);
	}
}
