import jwt from "jsonwebtoken";

import { redis } from "../lib/redis.js";
import { stripe } from "./stripe.js";

import Coupon from "../models/coupons.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";


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

export const createStripeCoupon = async (discountPercentage) =>{

	
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	})

	return coupon.id;
}

export const createNewCoupon = async (userId) =>{

	await Coupon.findOneAndDelete({userId})

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now on
		userId: userId
	})

	await newCoupon.save();

	return newCoupon
}

export const getAnalyticsData = async () =>{
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$group: {
				_id: null, //it groups all documents together
				totalSales: {$sum: 1},
				totalRevenue: {$sum: "$totalAmount"}
			}
		}
	]);
	
	const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0};

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue
	}
}

export const getDailySalesData = async (startDate, endDate) =>{

	try{
	const dailySalesData = await Order.aggregate([{

		$match:{
			createdAt:{
				$gte: startDate,
				$lte: endDate,
			},

		},

	},
		{
			$group:{
				_id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
				sales: {$sum: 1},
				revenue: {$sum: "$totalAmount"},
			}
		},
		{$sort: {_id: 1}},
	])
	const dateArray = getDatesInRange(startDate, endDate);

	return dateArray.map(date => {
		const foundData = dailySalesData.find(item => item._id === date)

		return {
			date,
			sales: foundData?.sales || 0,
			revenue: foundData?.revenue || 0
		}
	})

	}
	catch(error){
		throw error
	}

}

function getDatesInRange(startDate, endDate){
	const dates = []
	let currentDate = new Date(startDate);

	while(currentDate <= endDate){
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1)
	}

	return dates;
}
