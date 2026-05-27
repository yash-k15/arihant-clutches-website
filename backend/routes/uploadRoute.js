import path from 'path';
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';

import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Store file in memory instead of uploads folder
const storage = multer.memoryStorage();

// Validate file type
function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });

// Use .array to accept an array of images
const uploadMultipleImages = upload.array('images', 5);

//Upload buffer → Cloudinary
const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
      },

      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

router.post('/', (req, res) => {
  uploadMultipleImages(req, res, async function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    try {
      const uploads = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer)),
      );

      const images = uploads.map((file) => file.secure_url);

      res.status(200).send({
        message: 'Image uploaded successfully',
        images,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Cloudinary upload failed',
      });
    }
  });
});

export default router;
