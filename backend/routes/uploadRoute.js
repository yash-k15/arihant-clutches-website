import path from 'path';
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import slugify from 'slugify';

import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../middleware/asyncHandler.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
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

function videoFileFilter(req, file, cb) {
  const filetypes = /mp4/;
  const mimetypes = /video\/mp4/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('MP4 videos only!'), false);
  }
}

const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
});

const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
});

const uploadMultipleImages = imageUpload.array('images', 10);

const uploadVideo = videoUpload.single('video');

const uploadToCloudinary = (fileBuffer, folder, publicId, resourceType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
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

/*
 * Upload product images
 */
router.post('/', protect, admin, (req, res) => {
  uploadMultipleImages(req, res, async function (err) {
    if (err) {
      return res.status(400).send({
        message: err.message,
      });
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

          return uploadToCloudinary(file.buffer, folder, publicId, 'image');
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

/*
 * Upload product video
 */
router.post('/video', protect, admin, (req, res) => {
  uploadVideo(req, res, async function (err) {
    if (err) {
      return res.status(400).send({
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).send({
        message: 'Please select an MP4 video',
      });
    }

    const productSlug = req.body.productName
      ? slugify(req.body.productName, {
          lower: true,
          strict: true,
        })
      : 'temp';

    const folder = `products/${productSlug}/video`;

    try {
      const originalName = req.file.originalname.replace(/\.[^/.]+$/, '');

      const baseName = slugify(originalName, {
        lower: true,
        strict: true,
      });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1000)}`;

      const publicId = `${baseName}-${uniqueSuffix}`;

      const upload = await uploadToCloudinary(
        req.file.buffer,
        folder,
        publicId,
        'video',
      );

      res.status(200).send({
        message: 'Video uploaded successfully',
        video: {
          url: upload.secure_url,
          publicId: upload.public_id,
        },
      });
    } catch (error) {
      res.status(500).send({
        message: 'Cloudinary video upload failed',
      });
    }
  });
});

const getPublicIdFromUrl = (url) => {
  const parts = url.split('/upload/')[1];
  const withoutVersion = parts.replace(/^.*?\/v\d+\//, '');

  return withoutVersion.replace(/\.[^/.]+$/, '');
};

/*
 * Delete product image
 */
const deleteProductImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  const publicId = getPublicIdFromUrl(imageUrl);

  await cloudinary.uploader.destroy(publicId);

  res.json({
    message: 'Image deleted',
  });
});

router.delete('/', protect, admin, deleteProductImage);

/*
 * Delete product video
 */
const deleteProductVideo = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({
      message: 'Video public ID is required',
    });
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'video',
  });

  res.json({
    message: 'Video deleted',
  });
});

router.delete('/video', protect, admin, deleteProductVideo);

export default router;
