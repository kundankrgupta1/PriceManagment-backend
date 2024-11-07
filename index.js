import dotenv from "dotenv";
import app from "./src/app/app.js";
import ConnectDB from "./src/config/db.js";

dotenv.config();

ConnectDB().then(() => {
	console.log(`🚀[Startup Success]: Database connected successfully! Server is starting...`);
	app.listen(process.env.PORT, () => {
		console.log(`🌐[Server Running] Application is Live on http://localhost:${process.env.PORT}`)
	})
}).catch((error) => {
	console.log(`❌ [Startup Failed] Unable to Start the server, Error ${error}`);
})
