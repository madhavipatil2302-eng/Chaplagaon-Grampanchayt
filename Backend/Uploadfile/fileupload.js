// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// fs.mkdirSync(uploadDir, { recursive: true });

// const storage= multer.diskStorage({

//     destination:function(req,file,cb)
//     {

//         cb(null,uploadDir);
//     },
//     filename:function(req,file,cb )
//     {

//         const safeName = file.originalname.replace(/\s+/g, "-");
//         const extension = path.extname(safeName);
//         const baseName = path.basename(safeName, extension);

//         cb(null,`${Date.now()}-${baseName}${extension}`);
//     }


// });

// const upload= multer({

//     storage:storage,
//     fileFilter:function(req,file,cb)
//     {
//         const allowedTypes = [
//             "application/pdf",
//             "application/msword",
//             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         ];

//         if(file.mimetype.startsWith("image/") || allowedTypes.includes(file.mimetype))
//         {
//             return cb(null,true);
//         }

//         return cb(new Error("Only image, PDF, and Word files are allowed."));
//     }
// });

// export default upload;

import multer from "multer";
import multerS3 from "multer-s3";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "public", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const hasAwsConfig = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_BUCKET_NAME &&
    process.env.AWS_REGION
);

const s3Client = hasAwsConfig
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

let storage;

if (hasAwsConfig && s3Client) {
  storage = multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    key: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "-");
      cb(null, `${Date.now()}-${safeName}`);
    },
  });
}

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Simple function to extract bucket name and key from S3 URL string
const parseS3Url = (urlString) => {
  try {
    const url = new URL(urlString);
    let bucket, key;

    // Remove query parameters from pathname
    const pathname = url.pathname.split('?')[0];

    // Format 1: https://bucket.s3.amazonaws.com/key
    if (url.hostname.includes(".s3")) {
      bucket = url.hostname.split(".")[0];
      key = decodeURIComponent(pathname.replace(/^\/+/, ""));
    }
    // Format 2: https://s3.region.amazonaws.com/bucket/key
    else if (url.hostname.includes("amazonaws.com")) {
      const parts = pathname.split("/").filter(Boolean);
      bucket = parts[0];
      key = parts.slice(1).join("/");
      if (key) {
        key = decodeURIComponent(key);
      }
    }

    return { bucket, key };
  } catch (err) {
    console.error("Error parsing S3 URL:", err.message);
    return { bucket: null, key: null };
  }
};

// Generate presigned URL from S3 URL string stored in MongoDB
export const generatePresignedUrlFromString = async (s3UrlString) => {
  if (!s3UrlString || !hasAwsConfig || !s3Client) {
    return s3UrlString || "";
  }

  try {
    const { bucket, key } = parseS3Url(s3UrlString);
    
    if (!bucket || !key) {
      console.warn("Failed to parse S3 URL:", s3UrlString, "bucket:", bucket, "key:", key);
      return s3UrlString;
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Generated presigned URL for:", key);
    return presignedUrl;
  } catch (error) {
    console.error("Presigned URL generation failed for:", s3UrlString, error.message);
    return s3UrlString;
  }
};

export const generatePresignedUrl = async (file) => {
  if (!file || !hasAwsConfig || !s3Client) {
    return file?.location || "";
  }

  try {
    const fileKey = file.key || file.Key || "";
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (fileKey) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });
      return await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });
    }

    if (file.location) {
      const parsedUrl = new URL(file.location);
      const keyFromUrl = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));

      if (keyFromUrl) {
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: keyFromUrl,
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 });
      }
    }
  } catch (error) {
    console.error("Presigned URL generation failed:", error);
  }

  return file?.location || "";
};

export const getUploadedFileUrl = async (file) => {
  if (!file) return "";

  if (hasAwsConfig && s3Client) {
    const presignedUrl = await generatePresignedUrl(file);
    if (presignedUrl) {
      return presignedUrl;
    }
  }

  if (file.location) {
    return file.location;
  }

  if (file.path) {
    const fileName = path.basename(file.path);
    return `/uploads/${fileName}`;
  }

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return "";
};

export { upload };
export default upload;