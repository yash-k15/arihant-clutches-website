import path from 'path';
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import slugify from 'slugify';

import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../middleware/asyncHandler.js';

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
const uploadMultipleImages = upload.array('images', 10);

//Upload buffer → Cloudinary
const uploadToCloudinary = (fileBuffer, folder, publicId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
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

    const productSlug = req.body.productName
      ? slugify(req.body.productName, {
          lower: true,
          strict: true,
        })
      : 'temp';

    const colorSlug = req.body.color
      ? slugify(req.body.color, {
          lower: true,
          strict: true,
        })
      : 'default';

    const folder = `products/${productSlug}/${colorSlug}`;

    try {
      const uploads = await Promise.all(
        req.files.map((file) => {
          const originalName = file.originalname.replace(/\.[^/.]+$/, '');

          const baseName = slugify(originalName, {
            lower: true,
            strict: true,
          });

          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1000,
          )}`;

          const publicId = `${baseName}-${uniqueSuffix}`;

          return uploadToCloudinary(file.buffer, folder, publicId);
        }),
      );

      const images = uploads.map((file) =>
        file.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'),
      );

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

// Delete Image on Cloudinary
const getPublicIdFromUrl = (url) => {
  const parts = url.split('/upload/')[1];

  const withoutVersion = parts.replace(/^.*?\/v\d+\//, '');

  return withoutVersion.replace(/\.[^/.]+$/, '');
};

const deleteProductImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  const publicId = getPublicIdFromUrl(imageUrl);

  await cloudinary.uploader.destroy(publicId);

  res.json({ message: 'Image deleted' });
});

router.delete('/', deleteProductImage);

export default router;
