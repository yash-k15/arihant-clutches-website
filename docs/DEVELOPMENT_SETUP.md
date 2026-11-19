# Development Setup

This guide explains how to set up and run the Arihant Clutches ecommerce application locally.

## 1. Prerequisites

Make sure the following tools are installed:

- **Node.js** – JavaScript runtime.
- **npm** – Installed with Node.js.
- **Git** – For cloning and managing the repository.
- **MongoDB** – A MongoDB database, either locally or through MongoDB Atlas.

You will also need access to the project's third-party services for full functionality:

- Cloudinary – Product and other image storage.
- Razorpay – Online payment processing.
- SMTP email services – Transactional and authentication emails.

## 2. Clone the Repository

Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/yash-k15/arihant-clutches-website.git
cd arihant-clutches-website
```

## 3. Install Dependencies

Install the backend dependencies from the project root:

```bash
npm install
```

Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

The project uses a root `package.json` for backend dependencies and scripts, while the frontend has its own `package.json`.

## 4. Configure Environment Variables

Create the backend environment file:

```bash
cp .env.example .env
```

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Open both `.env` files and configure the required values.

Refer to [Environment Configuration](ENVIRONMENT_CONFIGURATION.md) for details about each variable.

**Important:** Never commit actual `.env` files or expose API keys, database credentials, SMTP passwords, or payment secrets.

## 5. Start the Application

### Run frontend and backend together

From the project root:

```bash
npm run dev
```

This starts:

- Backend API using Nodemon.
- React frontend development server.

### Run the backend separately

```bash
npm run server
```

The backend runs on port `4000` by default, unless overridden through the `PORT` environment variable.

### Run the frontend separately

```bash
npm run client
```

The React development server runs on port `3000` by default.

The frontend is configured with a development proxy pointing to `http://localhost:4000`.

## 6. Build the Frontend

To create a production build of the React application:

```bash
npm run build
```

This executes the frontend build script and generates the production files in the frontend build directory.

## 7. Application URLs

Default local development URLs:

| Service               | URL                    |
| --------------------- | ---------------------- |
| Frontend              | http://localhost:3000  |
| Backend API           | http://localhost:4000  |
| Backend root endpoint | http://localhost:4000/ |

The backend root endpoint returns a simple API status response.

## 8. Project Structure

```text
arihant-clutches-website/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── Components/
│       ├── Screens/
│       ├── config/
│       └── ...
│
├── docs/
├── .env.example
├── package.json
└── README.md
```

The backend contains the API, database models, business logic, authentication, payment integration, and server configuration.

The frontend contains the React application, UI components, screens, Redux state management, and frontend configuration.

## 9. Environment Validation

The backend validates required environment variables during startup.

If required variables are missing, the application reports which variables need to be configured and exits instead of starting with an incomplete configuration.

A successful validation displays:

```text
Environment configuration validated.
```

## 10. Additional Documentation

Refer to the following guides for more information:

- [Environment Configuration](ENVIRONMENT_CONFIGURATION.md)
- [Application Configuration](APPLICATION_CONFIGURATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Database and Storage](DATABASE_AND_STORAGE.md)
- [Payments and Emails](PAYMENTS_AND_EMAILS.md)
- [Troubleshooting](TROUBLESHOOTING.md)
