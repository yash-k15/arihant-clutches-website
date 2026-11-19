# Database and Storage

This document explains the database and file storage architecture used by the Arihant Clutches ecommerce application.

The application uses:

- **MongoDB** for persistent application data.
- **Mongoose** for MongoDB object modeling.
- **Cloudinary** for image storage and management.
- **Multer** for handling file uploads on the backend.

## 1. Database Overview

The application uses MongoDB as its primary database.

The backend connects to MongoDB using Mongoose.

**Relevant files:**

| File                    | Responsibility                                                      |
| ----------------------- | ------------------------------------------------------------------- |
| `backend/config/db.js`  | Establishes the MongoDB connection.                                 |
| `backend/models/`       | Contains Mongoose models and database schemas.                      |
| `backend/controllers/`  | Contains application logic that reads and updates database records. |
| `backend/config/env.js` | Validates required environment configuration.                       |

### MongoDB Connection

The connection string is configured through the `MONGO_URI` environment variable.

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
```

The backend uses this value when establishing the database connection.

Never commit database credentials or expose the connection string publicly.

### Database Models

Mongoose models are maintained in:

```text
backend/models/
```

These models define the structure of the application's persistent data.

When modifying database schemas:

1. Review the existing model and its references.
2. Check the controllers and routes that use the model.
3. Consider existing database records and backward compatibility.
4. Test affected application workflows before deployment.

---

## 2. Cloudinary Storage

Cloudinary is used to store and manage uploaded images.

The application uses Cloudinary instead of storing uploaded image files directly in the application database.

**Relevant files:**

| File                            | Responsibility                                       |
| ------------------------------- | ---------------------------------------------------- |
| `backend/config/cloudinary.js`  | Configures the Cloudinary connection.                |
| `backend/routes/uploadRoute.js` | Handles upload API requests.                         |
| `backend/config/env.js`         | Validates required Cloudinary environment variables. |

### Cloudinary Environment Variables

The following variables must be configured in the backend `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

These values are available from the Cloudinary dashboard.

The API secret must only be used on the backend.

### How Image Storage Works

At a high level, the upload workflow is:

1. The frontend sends an image to the backend upload endpoint.
2. The backend processes the incoming file.
3. The backend uploads the file to Cloudinary.
4. Cloudinary returns information about the uploaded asset.
5. The application uses the returned image URL when saving or displaying the relevant product information.

The database stores references to uploaded images rather than the actual image binary data.

---

## 3. Image Upload Handling

The backend uses Multer to handle incoming multipart file uploads.

The upload implementation is maintained in:

```text
backend/routes/uploadRoute.js
```

Review this file before changing upload behavior, file validation, image processing, or Cloudinary upload options.

When adapting the application for another client, consider:

- Permitted image formats.
- Maximum upload size.
- Image quality and dimensions.
- Cloudinary folder organization.
- Image deletion and replacement behavior.

Any changes should be tested against product creation, product editing, and other workflows that use uploaded images.

---

## 4. Database and Storage Responsibilities

The database and Cloudinary have separate responsibilities.

| Component            | Responsibility                                     |
| -------------------- | -------------------------------------------------- |
| MongoDB              | Stores application records and data.               |
| Mongoose             | Provides schemas, models, and database operations. |
| Cloudinary           | Stores uploaded image assets.                      |
| Multer               | Handles incoming file uploads.                     |
| Backend upload route | Coordinates upload processing and storage.         |

This separation allows the application to store structured business data independently of the media storage service.

---

## 5. Backup and Recovery Considerations

Database records and Cloudinary assets should be considered separately when planning backups.

### MongoDB

Maintain appropriate database backups using MongoDB's available backup and restore facilities.

Before performing database migrations, bulk updates, or destructive operations, ensure a recoverable backup exists.

### Cloudinary

Maintain access to the Cloudinary account and understand how uploaded assets are organized.

Database backups alone do not contain the actual image files stored in Cloudinary.

When restoring a database, verify that the referenced Cloudinary assets remain available.

### Recovery Verification

After restoring data, verify:

- Product records load correctly.
- Product image URLs resolve.
- Product creation and editing work.
- Existing image references remain valid.
- The frontend displays images correctly.

---

## 6. Changing Storage Providers

Cloudinary is currently integrated into the backend upload workflow.

Replacing it with another storage provider would require reviewing and updating:

- Storage configuration.
- Upload handling.
- File URL generation.
- Image deletion and replacement.
- Database image references.
- Frontend image rendering.

A storage provider should not be replaced by changing environment variables alone unless the backend integration has also been implemented.

---

## 7. Important Considerations

- Keep MongoDB credentials private.
- Never expose Cloudinary API secrets in frontend code.
- Avoid deleting Cloudinary assets without checking their database references.
- Verify image URLs after changing storage configuration.
- Test image uploads and replacements after modifying the upload workflow.
- Back up database records and understand the separate recovery requirements for media assets.

For configuration details, refer to `ENVIRONMENT_CONFIGURATION.md`.
