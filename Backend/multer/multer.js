// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadDir = path.join(__dirname, "..", "public", "uploads");

// fs.mkdirSync(uploadDir, { recursive: true });


// const storage = multer.diskStorage({

//     destination: (req, file, cb) => {


//         cb(null, uploadDir)

//     },
//     filename: (req, file, cb) => {

//         const safeName = file.originalname.replace(/\s+/g, "-");
//         const extension = path.extname(safeName);
//         const baseName = path.basename(safeName, extension);

//         cb(null, `${Date.now()}-${baseName}${extension}`)
//     }


// });

// const Upload = multer({

//     storage: storage,
//     limits: {
//         fileSize: 2 * 1024 * 1024
//     },
//     fileFilter: (req, file, cb) => {

//         if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//             cb(null, true)
//         }
//         else {
//             cb(new Error("Invalid file type"))
//         }
//     }
// });

// export default Upload;
