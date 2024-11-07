import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const ConnectDB = async () => {
	try {
		const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DBNAME}`)
		console.log(`✅ [Database Connected]: MongoDB Connected, HOST: ${connectionInstance.connection.host}`)
	} catch (error) {
		console.log(`❌ [Connection Failed]: Database Connection Failed, Error: ${error}`)
		throw new Error(`❌ Databse Connection Failed!!!!`)
	}
}

export default ConnectDB;
