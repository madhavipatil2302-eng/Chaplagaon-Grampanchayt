import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage= multer.diskStorage({

    destination:function(req,file,cb)
    {

        cb(null,uploadDir);
    },
    filename:function(req,file,cb )
    {

        const safeName = file.originalname.replace(/\s+/g, "-");
        const extension = path.extname(safeName);
        const baseName = path.basename(safeName, extension);

        cb(null,`${Date.now()}-${baseName}${extension}`);
    }


});

const upload= multer({

    storage:storage,
    fileFilter:function(req,file,cb)
    {
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if(file.mimetype.startsWith("image/") || allowedTypes.includes(file.mimetype))
        {
            return cb(null,true);
        }

        return cb(new Error("Only image, PDF, and Word files are allowed."));
    }
});

export default upload;
