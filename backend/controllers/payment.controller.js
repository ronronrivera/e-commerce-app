import Coupon from "../models/coupons.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import { createStripeCoupon, createNewCoupon } from "../lib/utils.js";
import "dotenv/config";

export const createCheckoutSession = async (req, res) =>{
	try{
		const {products, couponCode} = req.body;
		
		if(!Array.isArray(products) || products.length === 0){
			return res.status(400).json({message: "Invalid or empty products array"});
		}

		let totalAmount = 0;

		const lineItems = products.map(product =>{
			const amount = Math.round(product.price * 100); // stripe use cents apparently
			totalAmount += amount * product.quantity;

			return {
				price_data:{
					currency: "usd",
					product_data:{
						name: product.name,
						images: [product.image],
					},
					unit_amout: amount
				}
			}
		})

		let coupon = null;

		if(couponCode){
			coupon = await Coupon.findOne({coupon: couponCode, userId: req.user._id, isActive});
			if(coupon){
				totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
			}
		}
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card", "paypal"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon? [{
				coupon: await createStripeCoupon(coupon.discountPercentage)
			}]:
			[],
			metadata:{
				userId:req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price
					}))
				)
			}
		})

		if(totalAmount >= 20000 /*200$*/){
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({id:session.id, totalAmount: totalAmount / 100 })
	}
	catch(error){
		console.log("Error in createCheckoutSession controller", error.message);
		res.status(500).json({message: "Internal server error", message: error.message});
	}
}

export const createCheckoutSuccess = async (req, res) =>{
	try{
		const {sessionId} = req.body;
		const session = await stripe.checkout.session.retrieve(sessionId);

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
