import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const createUploadDirectoryinLocalSystem = path.join(__dirname, '../public/temp');
		if (!fs.existsSync(createUploadDirectoryinLocalSystem)) {
			fs.mkdirSync(createUploadDirectoryinLocalSystem, { recursive: true });
		}
		cb(null, createUploadDirectoryinLocalSystem);
	},
	filename: (req, file, cb) => {
		const generatedFileName = Date.now() + path.extname(file.originalname);
		cb(null, generatedFileName);
	}
})

export const upload = multer({ storage });
