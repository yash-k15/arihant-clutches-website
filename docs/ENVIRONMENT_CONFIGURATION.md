# Environment Configuration

This document describes the environment variables used by the Arihant Clutches ecommerce application.

The project uses two environment files:

- Root `.env` – Backend configuration.
- `frontend/.env` – Frontend configuration.

Use the corresponding example files as starting points:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Never commit actual environment files or expose credentials in source control.

---

## 1. Backend Environment Variables

The backend environment file is located at the project root.

### Server Configuration

| Variable     | Required | Description                                                |
| ------------ | -------- | ---------------------------------------------------------- |
| `PORT`       | No       | Port on which the backend server runs. Defaults to `4000`. |
| `CLIENT_URL` | Yes      | Frontend URL allowed by the backend CORS configuration.    |

Example:

```env
PORT=4000
CLIENT_URL=http://localhost:3000
```

For production, `CLIENT_URL` should contain the deployed frontend's origin.

### MongoDB Configuration

| Variable    | Required | Description                                 |
| ----------- | -------- | ------------------------------------------- |
| `MONGO_URI` | Yes      | MongoDB connection string used by Mongoose. |

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
```

**Where to obtain it:**

1. Create or sign in to a MongoDB Atlas account.
2. Create a cluster and database.
3. Configure database access credentials.
4. Allow connections from the appropriate IP addresses.
5. Copy the application's MongoDB connection string.

Keep database credentials private.

### Authentication Configuration

| Variable     | Required | Description                                     |
| ------------ | -------- | ----------------------------------------------- |
| `JWT_SECRET` | Yes      | Secret used to sign and verify JSON Web Tokens. |

Example:

```env
JWT_SECRET=replace_with_a_long_random_secret
```

Use a strong, randomly generated secret. Do not reuse example values or expose this variable to the frontend.

### Cloudinary Configuration

Cloudinary is used for storing and managing uploaded images.

| Variable                | Required | Description            |
| ----------------------- | -------- | ---------------------- |
| `CLOUDINARY_CLOUD_NAME` | Yes      | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY`    | Yes      | Cloudinary API key.    |
| `CLOUDINARY_API_SECRET` | Yes      | Cloudinary API secret. |

Example:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Where to obtain these values:**

1. Sign in to your Cloudinary account.
2. Open the Cloudinary dashboard.
3. Find the cloud name, API key, and API secret in the account details.

The API secret must remain on the backend.

### Razorpay Configuration

Razorpay is used for online payment processing.

| Variable                  | Required | Description                                        |
| ------------------------- | -------- | -------------------------------------------------- |
| `RAZORPAY_KEY_ID`         | Yes      | Razorpay API key ID.                               |
| `RAZORPAY_KEY_SECRET`     | Yes      | Razorpay API key secret.                           |
| `RAZORPAY_WEBHOOK_SECRET` | Yes      | Secret used to verify Razorpay webhook signatures. |

Example:

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Where to obtain these values:**

1. Sign in to the Razorpay Dashboard.
2. Open the API Keys section to obtain the key ID and key secret.
3. Configure a webhook endpoint for the application.
4. Set a webhook secret and use the same value in `RAZORPAY_WEBHOOK_SECRET`.

Use the appropriate test or live credentials depending on the environment.

Never expose the Razorpay key secret or webhook secret in frontend code.

### General SMTP Email Configuration

These variables are used by the general email utility.

| Variable        | Required | Description                                              |
| --------------- | -------- | -------------------------------------------------------- |
| `SMTP_HOST`     | Yes      | SMTP server hostname.                                    |
| `SMTP_PORT`     | Yes      | SMTP server port.                                        |
| `SMTP_EMAIL`    | Yes      | Email account used to authenticate with the SMTP server. |
| `SMTP_PASSWORD` | Yes      | SMTP password or application-specific password.          |
| `FROM_NAME`     | Yes      | Sender display name.                                     |
| `FROM_EMAIL`    | Yes      | Sender email address.                                    |

Example:

```env
SMTP_HOST=your_smtp_host
SMTP_PORT=465
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_smtp_password
FROM_NAME=Arihant Clutches
FROM_EMAIL=your_email@example.com
```

These credentials are used by `backend/utils/sendEmail.js`.

### Authentication Email Configuration

Authentication emails use a separate SMTP configuration.

| Variable             | Required | Description                                     |
| -------------------- | -------- | ----------------------------------------------- |
| `AUTH_SMTP_HOST`     | Yes      | SMTP server hostname for authentication emails. |
| `AUTH_SMTP_PORT`     | Yes      | SMTP server port.                               |
| `AUTH_SMTP_EMAIL`    | Yes      | Email account used for SMTP authentication.     |
| `AUTH_SMTP_PASSWORD` | Yes      | SMTP password or application-specific password. |
| `AUTH_FROM_NAME`     | Yes      | Sender display name for authentication emails.  |
| `AUTH_FROM_EMAIL`    | Yes      | Sender email address for authentication emails. |

Example:

```env
AUTH_SMTP_HOST=your_smtp_host
AUTH_SMTP_PORT=465
AUTH_SMTP_EMAIL=auth@example.com
AUTH_SMTP_PASSWORD=your_smtp_password
AUTH_FROM_NAME=Arihant Clutches
AUTH_FROM_EMAIL=auth@example.com
```

These credentials are used by `backend/utils/sendAuthEmail.js`.

Keeping authentication email credentials separate allows the application to use a dedicated email account for authentication-related messages.

### Optional Pagination Configuration

The following variables control pagination defaults for specific application areas.

| Variable                   | Required | Description                                                         |
| -------------------------- | -------- | ------------------------------------------------------------------- |
| `ADMIN_USERS_PER_PAGE`     | No       | Number of users displayed per page in the admin users section.      |
| `ADMIN_ORDERS_PER_PAGE`    | No       | Number of orders displayed per page in the admin orders section.    |
| `CUSTOMER_ORDERS_PER_PAGE` | No       | Number of orders displayed per page in the customer orders section. |

Example:

```env
ADMIN_USERS_PER_PAGE=
ADMIN_ORDERS_PER_PAGE=
CUSTOMER_ORDERS_PER_PAGE=
```

These values can be left empty to use the application's configured defaults.

---

## 2. Frontend Environment Variables

The frontend environment file is located at:

```text
frontend/.env
```

| Variable            | Required | Description                                             |
| ------------------- | -------- | ------------------------------------------------------- |
| `REACT_APP_API_URL` | No       | Base URL used by the frontend when making API requests. |

Example:

```env
REACT_APP_API_URL=
```

### Local Development

The variable can remain empty during local development because the React development server uses the proxy configured in `frontend/package.json`:

```json
{
  "proxy": "http://localhost:4000"
}
```

### Production

When the frontend and backend are hosted on separate origins, configure this variable with the backend API's base URL.

For example:

```env
REACT_APP_API_URL=https://api.example.com
```

The value must be the backend base URL, not an individual API endpoint.

**Important:** Variables prefixed with `REACT_APP_` are embedded into the frontend build and are publicly accessible. Never store passwords, private API secrets, or other sensitive credentials in frontend environment variables.

---

## 3. Environment Validation

The backend validates required environment variables during application startup.

Validation is implemented in:

```text
backend/config/env.js
```

If a required variable is missing, the application:

1. Identifies the missing variable names.
2. Displays an error message.
3. Exits instead of starting with incomplete configuration.

A successful validation displays:

```text
Environment configuration validated.
```

The validation checks whether required values are present. It does not guarantee that external credentials are valid or that third-party services are reachable.

---

## 4. Security Guidelines

Follow these practices when configuring the application:

- Never commit `.env` files to GitHub.
- Never expose backend credentials in frontend code.
- Use strong, randomly generated JWT secrets.
- Keep MongoDB credentials private.
- Use separate Razorpay test and live credentials.
- Protect Cloudinary API secrets.
- Use application-specific SMTP passwords where supported.
- Restrict database network access to trusted sources.
- Rotate credentials if they are accidentally exposed.

The repository includes `.gitignore` rules to prevent actual environment files from being committed while allowing the example files.

---

## 5. Environment File Reference

| File                    | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `.env`                  | Backend environment variables.          |
| `.env.example`          | Backend environment variable template.  |
| `frontend/.env`         | Frontend environment variables.         |
| `frontend/.env.example` | Frontend environment variable template. |

When setting up a new development environment or deploying the application, use the example files as references and provide the appropriate environment-specific values.
