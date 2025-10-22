import Coupon from "../models/coupons.model.js";

export const getCoupon = async (req, res) =>{
	try{
		const coupon = await Coupon.findOne({userId: req.user._id, isActive: true});
		res.json(
			 coupon
    	? { code: coupon.code, discountPercentage: coupon.discountPercentage, expirationDate: coupon.expirationDate }
    	: null
 	)
	}
	catch(error){
		console.log("Error in getCoupon controller: ", error.message);
		res.status(500).json({message: "Internal server error", error: message.error});
	}
}

export const validateCoupon = async (req, res) =>{
	try{
		const {code} = req.body;
		const coupon = await Coupon.findOne({code: code, userId: req.user._id, isActive:true})
		
		if(!coupon) return res.status(404).json({message: "Coupon not found"});
		if(coupon.expirationDate < new Date()){
			coupon.isActive = false;
			await coupon.save();
			return res.status(404).json({message: "Coupon expired"});
		}

		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		})
	}
	catch(error){
		console.log("Error in valitdateCoupon controller: ", error.message);
		res.status(500).json({message: "Internal server error", error: message.error});	
	}
}
