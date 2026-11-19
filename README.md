# Arihant Clutches — Ecommerce Website

A full-stack ecommerce application built for Arihant Clutches, featuring product browsing, customer accounts, shopping cart, checkout, online payments, Cash on Delivery, order management and an admin dashboard.

**Live Website:** https://arihantclutches.com

**Repository:** https://github.com/yash-k15/arihant-clutches-website

---

## Technology Stack

### Frontend

- React
- Redux Toolkit
- React Router
- React Bootstrap
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication

### Third-party Services

- **Razorpay:** Online payments
- **Cloudinary:** Image storage and management
- **Nodemailer / SMTP:** Transactional and authentication emails

---

## Project Structure

```text
arihant-clutches-website/
│
├── backend/
│   ├── config/          # Database, environment and application configuration
│   ├── controllers/     # API request handlers
│   ├── middleware/      # Authentication, validation and error handling
│   ├── models/          # Mongoose database models
│   ├── routes/          # API routes
│   ├── utils/           # Shared utilities and email templates
│   └── server.js         # Express application entry point
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── config/
│       ├── constants.js
│       ├── screens/
│       ├── slices/
│       └── ...
│
├── docs/                # Project and deployment documentation
├── .env.example
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following before setting up the project:

- Node.js and npm
- MongoDB database
- Git

You will also need credentials for the third-party services used by the application.

### 1. Clone the Repository

```bash
git clone https://github.com/yash-k15/arihant-clutches-website.git
cd arihant-clutches-website
```

### 2. Install Dependencies

Install backend dependencies from the project root:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables

Create the backend environment file:

```bash
cp .env.example .env
```

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Update both files with the appropriate configuration and credentials.

Never commit actual `.env` files or production credentials.

See [Environment Configuration](docs/ENVIRONMENT_CONFIGURATION.md) for details.

### 4. Run the Application

Start both frontend and backend in development mode:

```bash
npm run dev
```

Alternatively, run them separately.

Backend:

```bash
npm run server
```

Frontend (in another terminal):

```bash
npm run client
```

The frontend uses the configured development proxy to communicate with the backend.

### 5. Build the Frontend

```bash
npm run build
```

---

## Application Configuration

The application keeps business-specific settings separate from core application logic.

Important configuration files:

| File                                | Purpose                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| `frontend/src/config/siteConfig.js` | Frontend branding, SEO, contact details and theme        |
| `backend/config/siteConfig.js`      | Backend branding, website details and email presentation |
| `backend/config/businessConfig.js`  | Business rules, timezone and order limits                |
| `.env`                              | Backend secrets and integration credentials              |
| `frontend/.env`                     | Frontend environment configuration                       |

See [Application Configuration](docs/APPLICATION_CONFIGURATION.md).

---

## Documentation

Detailed project documentation is maintained in the `docs/` directory.

- [Development Setup](docs/DEVELOPMENT_SETUP.md)
- [Environment Configuration](docs/ENVIRONMENT_CONFIGURATION.md)
- [Application Configuration](docs/APPLICATION_CONFIGURATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Database and File Storage](docs/DATABASE_AND_STORAGE.md)
- [Payments and Emails](docs/PAYMENTS_AND_EMAILS.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

---

## Important Notes

- Order pricing is calculated and validated on the backend.
- Razorpay payment verification and webhook reconciliation are handled by the backend.
- Payment processing includes idempotency and safeguards against duplicate stock deductions.
- Never expose secret keys or credentials in frontend code.
- Production and development environments must use appropriate database and service credentials.

---

## License

This project is licensed under the MIT License.
