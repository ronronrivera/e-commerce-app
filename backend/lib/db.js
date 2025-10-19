import mongoose from "mongoose";

export const connectDB = async () =>{
	try{
		
		if(!process.env.MONGO_URI) throw new Error("MongoURI is not set");

	 	const conn =	await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected: ${conn.connection.host}`);
	}
	catch(error){
		console.log(`Error connecting to mongodb:  ${error.message}`);
		process.exit(1);
	}
}
