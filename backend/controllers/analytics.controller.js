import { getAnalyticsData, getDailySalesData } from "../lib/utils.js";


export const analyticsController = async (_, res) =>{
	try{
		const analyticsData = await getAnalyticsData();
		
		const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

		const dailySalesData = await getDailySalesData(startDate, endDate);

		res.json({
			analyticsData,
			dailySalesData
		});
		
	}
	catch(error){
		console.log("Error in analyticsController error: ", error.message);
		res.status(500).json({message: "Internal server error", error: error.message})
	}
}
