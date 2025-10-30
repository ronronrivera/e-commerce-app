import Coupon from "../models/coupons.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import { createStripeCoupon, createNewCoupon } from "../lib/utils.js";
import "dotenv/config";
import User from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
	try{
		const {products, coupon} = req.body; // Changed from couponCode to coupon
		
		if(!Array.isArray(products) || products.length === 0){
			return res.status(400).json({message: "Invalid or empty products array"});
		}

		let totalAmount = 0;

		const lineItems = products.map(product =>{
			const amount = Math.round(product.price * 100);
			totalAmount += amount * (product.quantity || 1);

			return {
				price_data:{
					currency: "usd",
					product_data:{
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount
				},
				quantity: product.quantity || 1,
			}
		})

		let stripeCouponId = null;
		let couponCode = coupon || "";

		if(coupon){
			// Fixed: added missing variable declaration
			const foundCoupon = await Coupon.findOne({
				code: coupon, 
				userId: req.user._id, 
				isActive: true // Fixed: added missing variable
			});
			
			if(foundCoupon){
				stripeCouponId = await createStripeCoupon(foundCoupon.discountPercentage);
				totalAmount -= Math.round(totalAmount * foundCoupon.discountPercentage / 100);
			}
		}

		const sessionParams = {
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			metadata:{
				userId: req.user._id.toString(),
				couponCode: couponCode,
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price
					}))
				)
			}
		};

		// Only add discounts if we have a valid coupon
		if(stripeCouponId){
			sessionParams.discounts = [{
				coupon: stripeCouponId
			}];
		}

		const session = await stripe.checkout.sessions.create(sessionParams);

		// Create coupon if total is high enough (after discounts)
		if(totalAmount >= 20000){
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({id: session.id, url: session.url, totalAmount: totalAmount / 100 });
	}
	catch(error){
		console.log("Error in createCheckoutSession controller", error.message);
		res.status(500).json({message: "Internal server error", error: error.message});
	}
}

export const createCheckoutSuccess = async (req, res) =>{
	try{
		const {sessionId} = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if(session.payment_status === "paid"){
			if(session.metadata.couponCode){
				await Coupon.findOneAndUpdate({
					code: session.metadata.couponCode,
					userId: session.metadata.userId
				}, {isActive: false})
			}
		}
		//create a new Order
		const products = JSON.parse(session.metadata.products);
		const newOrder = new Order({
			user: session.metadata.userId,
			products: products.map(product => ({
				product: product.id,
				quantity: product.quantity,
				price: product.price
			})),
			totalAmount: session.amount_total / 100, //convert from cents to dollar
			stripeSessionId: sessionId,
		})

		await newOrder.save();
		

    // Clear user's cart after successful payment
    const user = await User.findById(req.user._id);
    user.cartItems = [];
    await user.save();

		res.status(200).json({
			success: true,
			message: "Payment successful, order created and coupon deactivated if used",
			orderId: newOrder._id,
		})
	}
	catch(error){
		console.log("Error in createCheckoutSuccess controller", error.message);
		res.status(500).json({message: "Internal server error", error: error.message});
	}
}
