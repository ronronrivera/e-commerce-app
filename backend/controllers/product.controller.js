import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import {updateFeatureProductCached} from "../lib/utils.js"
import User from "../models/user.model.js";

export const getAllProducts  = async (_, res) =>{
	try{
		const products = await Product.find({}); //find all products
		res.json({products});
	}	
	catch(error){
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({message: "Internal server error: ", error: error.message});
	}
}

export const getFeaturedProducts = async (_, res) => {
    try {
    	let featuredProducts = await redis.get("featured_products");
        
      if (featuredProducts) {
        try {
            // Try to parse the cached data
            const parsedProducts = JSON.parse(featuredProducts);
            return res.json(parsedProducts);
        } catch (parseError) {
            // If parsing fails, log and delete the corrupted cache
            await redis.del("featured_products");
            // Continue to fetch from database
        }
      }
        
      // If not in redis or cache was corrupted, fetch from MongoDB
      featuredProducts = await Product.find({ isFeatured: true }).lean();

      if (!featuredProducts || featuredProducts.length === 0) {
        return res.status(404).json({ message: "No featured products found" });
      }

      // Store in redis for future quick access
      try {
          await redis.set("featured_products", JSON.stringify(featuredProducts));
      } 
			catch (redisError) {
        	console.log("Error caching featured products:", redisError.message);
          // Continue without caching if Redis fails
      }
        
      res.json(featuredProducts);
    } 
		catch (error) {   
			console.log("Error in getFeaturedProducts controller: ", error.message);
      res.status(500).json({ 
          message: "Internal server error", 
          error: error.message 
      });
    }
}

export const createProduct = async(req, res) =>{
	try{
		const {name, description, price, image, category} = req.body;

		if(!name || !description || !price || !image || !category){
			return res.status(400).json({message: "All fields must required"});
		}

		let cloudinaryResponse = null;

		if(image){
			cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"})
		}
		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse?.secure_url? cloudinaryResponse.secure_url: "",
			category,
		})

		res.status(201).json(product);
	}
	catch(error){
		console.log("Error in createProduct controller: ",error.message);
		res.status(500).json({message: "Internal server error", error: error.message});
	}
}

export const deleteProduct = async (req, res) =>{
	try{
		const product = await Product.findById(req.params.id);
		
		if(!product) return res.status(404).json({message: "Product not found"});
		
		if(product.image){
			const publicId = product.image.split("/").pop().split(".")[0]; //this will get the id of the image to delete it
			try{
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloudinary");
			}
			catch(error){
				console.log("Error deleting image from cloudinary: ", error.message);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.status(200).json({message: "Product deleted successfully"});
	}
	catch(error){
		console.log("Error in deleteProduct controller: ", error.message);
		res.status(500).json({message: "Internal server error"});
	}
}	

export const getRecommendedProducts = async(_, res) =>{
	try{
		const products = await Product.aggregate([
			{
				$sample: {size: 3}
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				}
			}
		])

		res.json(products);
	}
	catch(error){
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({message: "Internal server error", error: error.message});
	}
}

export const getProductsByCategory =  async (req, res) =>{
	
	const {category} = req.params;
	try{
		const products = await Product.find({category});
		res.json({products});
	}
	catch(error){
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({message: "Internal server error", error: error.message});
	}
}

export const toggleFeatureProduct = async (req, res) =>{
	try{
		const product = await Product.findById(req.params.id);
		if(product){
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			
			await updateFeatureProductCached();
			res.json(updatedProduct);
		}
		else{
			res.status(404).json({message: "Product not found"});
		}
	}
	catch(error){
		console.log("Error in toggleFeatureProduct controller", error.message);
		res.status(500).json({message: "Internal server error", error: error.message});
	}
}

export const clearCart = async (req, res) =>{
	try{
		const user = await User.findById(req.user._id);
		user.cartItems = [];
		await user.save();

		res.json({message: "Cart cleared successfully"});
	}
	catch(error){
		res.status(500).json({message: "Error in clearCart controller", error: error});
	}
}

