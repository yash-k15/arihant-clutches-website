import path from 'path';
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import slugify from 'slugify';

import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

import { protect, admin } from '../middleware/authMiddleware.js';

import { fileTypeFromBuffer } from 'file-type';

const router = express.Router();

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4']);

const validateFileContent = async (file, allowedTypes) => {
  const detectedType = await fileTypeFromBuffer(file.buffer);

  if (!detectedType || !allowedTypes.has(detectedType.mime)) {
    return false;
  }

  return true;
};

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
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
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
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({
          message: 'File size exceeds the allowed limit.',
        });
      }

      return res.status(400).send({
        message: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        message: 'Please select at least one image.',
      });
    }

    const body = req.body ?? {};

    const productSlug = body.productName
      ? slugify(body.productName, {
          lower: true,
          strict: true,
        })
      : 'temp';

    const colorSlug = body.color
      ? slugify(body.color, {
          lower: true,
          strict: true,
        })
      : 'default';

    const folder = `products/${productSlug}/${colorSlug}`;

    try {
      for (const file of req.files) {
        const isValid = await validateFileContent(file, ALLOWED_IMAGE_TYPES);

        if (!isValid) {
          return res.status(400).send({
            message: 'One or more uploaded files have invalid content.',
          });
        }
      }

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
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({
          message: 'File size exceeds the allowed limit.',
        });
      }

      return res.status(400).send({
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).send({
        message: 'Please select an MP4 video',
      });
    }

    const body = req.body ?? {};

    const productSlug = body.productName
      ? slugify(body.productName, {
          lower: true,
          strict: true,
        })
      : 'temp';

    const folder = `products/${productSlug}/video`;

    try {
      const isValid = await validateFileContent(req.file, ALLOWED_VIDEO_TYPES);

      if (!isValid) {
        return res.status(400).send({
          message: 'Invalid MP4 video content.',
        });
      }

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

const getPublicIdFromUrl = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return null;
  }

  try {
    const url = new URL(imageUrl);

    if (url.hostname !== 'res.cloudinary.com') {
      return null;
    }

    const uploadIndex = url.pathname.indexOf('/upload/');

    if (uploadIndex === -1) {
      return null;
    }

    let path = url.pathname.slice(uploadIndex + '/upload/'.length);

    path = path.replace(/^.*?\/v\d+\//, '');

    if (!path) {
      return null;
    }

    return path.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

/*
 * Delete product image
 */
const deleteProductImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body ?? {};

  if (!imageUrl) {
    return res.status(400).json({
      message: 'Image URL is required',
    });
  }

  const publicId = getPublicIdFromUrl(imageUrl);

  if (!publicId) {
    return res.status(400).json({
      message: 'Invalid Cloudinary image URL',
    });
  }

  const product = await Product.findOne({
    'variants.images': imageUrl,
  }).select('_id');

  if (!product) {
    return res.status(404).json({
      message: 'Image does not belong to any product',
    });
  }

  await cloudinary.uploader.destroy(publicId);

  res.json({
    message: 'Image deleted',
  });
});

router.delete('/', protect, admin, deleteProductImage);

/*
 * Cleanup unused product image
 *
 * Used only for Cloudinary images that were uploaded during
 * an unfinished product edit/create operation.
 */
const cleanupUnusedProductImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body ?? {};

  if (!imageUrl) {
    return res.status(400).json({
      message: 'Image URL is required',
    });
  }

  const publicId = getPublicIdFromUrl(imageUrl);

  if (!publicId) {
    return res.status(400).json({
      message: 'Invalid Cloudinary image URL',
    });
  }

  // Only allow cleanup of assets inside our product image folder.
  if (!publicId.startsWith('products/')) {
    return res.status(400).json({
      message: 'Invalid product image path',
    });
  }

  // Never delete an image that is currently referenced by a product.
  const product = await Product.findOne({
    'variants.images': imageUrl,
  }).select('_id');

  if (product) {
    return res.status(409).json({
      message: 'Image is currently used by a product',
    });
  }

  await cloudinary.uploader.destroy(publicId);

  res.json({
    message: 'Unused image deleted',
  });
});

router.delete('/cleanup', protect, admin, cleanupUnusedProductImage);

/*
 * Delete product video
 */
const deleteProductVideo = asyncHandler(async (req, res) => {
  const { publicId } = req.body ?? {};

  if (!publicId || typeof publicId !== 'string') {
    return res.status(400).json({
      message: 'Video public ID is required',
    });
  }

  const product = await Product.findOne({
    'video.publicId': publicId,
  }).select('_id');

  if (!product) {
    return res.status(404).json({
      message: 'Video does not belong to any product',
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
