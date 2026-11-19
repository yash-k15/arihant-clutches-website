# Troubleshooting

This document covers common issues that may occur while developing, configuring, or deploying the Arihant Clutches ecommerce application.

Issues are grouped by category to make diagnosis easier.

## 1. Application Setup Issues

### Backend fails to start because environment variables are missing

**Possible cause:**

One or more required environment variables are missing from the root `.env` file.

**Solution:**

1. Check that the root `.env` file exists.
2. Compare it with `.env.example`.
3. Verify that all required variables have values.
4. Restart the backend.

The backend validates environment variables during startup.

A successful validation displays:

```text
Environment configuration validated.
```

The validation implementation is located at:

```text
backend/config/env.js
```

### Frontend fails to start

**Possible causes:**

- Frontend dependencies have not been installed.
- Node.js or npm installation issues.
- Incorrect frontend environment configuration.

**Solution:**

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm start
```

If the issue persists, inspect the terminal output for the actual error.

### Backend and frontend dependencies are missing

Install the dependencies from both project directories:

```bash
npm install
cd frontend
npm install
cd ..
```

---

## 2. Backend and API Issues

### Frontend cannot communicate with the backend

**Possible causes:**

- Backend server is not running.
- Incorrect API base URL.
- Incorrect frontend proxy configuration.
- CORS configuration does not allow the frontend origin.

**Solution:**

For local development, verify the proxy in `frontend/package.json`:

```json
{
  "proxy": "http://localhost:4000"
}
```

Check that the backend is running on the expected port.

For production, verify:

```env
REACT_APP_API_URL=https://api.arihantclutches.com
```

Also verify the backend CORS configuration:

```env
CLIENT_URL=https://arihantclutches.com
```

The configured frontend origin must match the actual production frontend origin.

### CORS errors

**Possible causes:**

- Incorrect `CLIENT_URL`.
- Frontend is using a different domain or protocol.
- Backend CORS configuration does not match the request origin.

**Solution:**

1. Check the browser developer console.
2. Inspect the request's `Origin` header.
3. Verify `CLIENT_URL` in the backend environment.
4. Confirm that the backend is deployed with the updated configuration.
5. Restart or redeploy the backend if necessary.

Do not disable CORS security as a workaround.

### API returns HTTP 500

**Possible causes:**

- Database connection failure.
- Unexpected backend exception.
- Missing or invalid configuration.
- External service failure.

**Solution:**

1. Inspect backend logs.
2. Identify the failing API endpoint.
3. Check the corresponding controller and service.
4. Verify database and external service connectivity.
5. Review the error handler and underlying exception.

Avoid exposing internal error details to customers in production.

---

## 3. MongoDB Issues

### MongoDB connection fails

**Possible causes:**

- Incorrect `MONGO_URI`.
- Invalid database credentials.
- MongoDB Atlas network access restrictions.
- Database cluster unavailable.

**Solution:**

1. Verify the connection string.
2. Confirm the database username and password.
3. Check the MongoDB Atlas network access configuration.
4. Confirm that the cluster is available.
5. Restart the backend after correcting the configuration.

Relevant file:

```text
backend/config/db.js
```

### Database operations fail

**Possible causes:**

- Invalid request data.
- Unexpected database record structure.
- Mongoose validation errors.
- Database connectivity problems.

**Solution:**

Inspect the backend logs and identify the model and controller involved.

When modifying database models, consider existing records and backward compatibility.

---

## 4. Image Upload Issues

### Image upload fails

**Possible causes:**

- Incorrect Cloudinary credentials.
- Cloudinary service or configuration issue.
- Invalid uploaded file.
- Upload request or file processing error.

**Solution:**

Verify the following backend environment variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Also inspect:

```text
backend/config/cloudinary.js
backend/routes/uploadRoute.js
```

Check the backend logs for the actual upload error.

### Images are not displaying

**Possible causes:**

- Invalid or unavailable Cloudinary URL.
- Incorrect image reference in the database.
- Cloudinary asset has been deleted.
- Browser cannot access the image URL.

**Solution:**

1. Inspect the image URL stored in the relevant database record.
2. Open the URL directly in a browser.
3. Verify that the asset still exists in Cloudinary.
4. Check the browser network tab for failed image requests.

Avoid deleting Cloudinary assets without checking whether database records still reference them.

---

## 5. Razorpay Payment Issues

### Razorpay checkout does not open

**Possible causes:**

- Incorrect Razorpay key ID.
- Frontend checkout configuration issue.
- Backend order creation failure.
- Browser-side JavaScript error.

**Solution:**

1. Inspect browser console errors.
2. Check the backend response from the create-order endpoint.
3. Verify Razorpay credentials.
4. Confirm that the backend can communicate with Razorpay.

### Payment verification fails

**Possible causes:**

- Invalid payment signature.
- Incorrect payment details.
- Payment amount or currency mismatch.
- Payment is not associated with the expected application order.

**Solution:**

Inspect the payment verification logic in:

```text
backend/controllers/paymentController.js
```

Verify the configured Razorpay credentials and inspect the backend logs.

Do not bypass signature verification to make checkout succeed.

### Payment succeeds but order status is not updated

**Possible causes:**

- Frontend verification request failed.
- Backend payment reconciliation failed.
- Webhook was not received or processed.
- Duplicate or unexpected payment event.

**Solution:**

1. Check the application order in MongoDB.
2. Verify the payment status using Razorpay.
3. Inspect backend logs.
4. Check the webhook delivery status in the Razorpay dashboard.
5. Verify the webhook URL and secret.
6. Review the payment reconciliation logic.

Production webhook endpoint:

```text
https://api.arihantclutches.com/api/payment/webhook
```

### Razorpay webhook signature verification fails

**Possible causes:**

- Incorrect `RAZORPAY_WEBHOOK_SECRET`.
- Incorrect webhook configuration.
- Raw request body is not being preserved.

**Solution:**

1. Verify the webhook secret in Razorpay and the backend environment.
2. Confirm that the configured webhook URL is correct.
3. Check that raw request body handling has not been changed.
4. Inspect the webhook verification logic.

Do not remove webhook signature verification.

### Stock is not updated after payment

Stock deduction is part of the backend payment reconciliation workflow.

Inspect:

```text
backend/controllers/paymentController.js
```

Check the application order, payment state, transaction logs, and inventory records.

Do not manually deduct stock or modify payment state without understanding the existing reconciliation logic.

---

## 6. Email Issues

### Emails are not being delivered

**Possible causes:**

- Incorrect SMTP hostname or port.
- Invalid SMTP credentials.
- SMTP provider restrictions.
- Incorrect sender configuration.

**Solution:**

Check the relevant environment variables:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_EMAIL=
SMTP_PASSWORD=
FROM_NAME=
FROM_EMAIL=
```

For authentication emails, check:

```env
AUTH_SMTP_HOST=
AUTH_SMTP_PORT=
AUTH_SMTP_EMAIL=
AUTH_SMTP_PASSWORD=
AUTH_FROM_NAME=
AUTH_FROM_EMAIL=
```

### General emails work but authentication emails fail

The application uses separate SMTP configurations.

Inspect:

```text
backend/utils/sendEmail.js
backend/utils/sendAuthEmail.js
```

Verify the credentials for the affected email configuration independently.

### Incorrect brand name or email appearance

Inspect:

```text
backend/config/siteConfig.js
```

Review:

- Brand name.
- Email logo URL.
- Email colors.
- Email subjects.
- Email footer.

Also review the relevant email template.

---

## 7. Production Deployment Issues

### Frontend works locally but fails in production

**Possible causes:**

- Incorrect `REACT_APP_API_URL`.
- Frontend was not rebuilt after changing environment variables.
- Incorrect static build deployment.
- API domain or SSL issue.

**Solution:**

1. Verify the production API URL.
2. Rebuild the frontend.
3. Deploy the latest `frontend/build` output.
4. Check browser console and network errors.
5. Verify the API domain independently.

Remember that React environment variables are embedded during the build process.

### Backend deployment fails

**Possible causes:**

- Missing environment variables.
- Incorrect Node.js version.
- Dependency installation failure.
- Incorrect application start configuration.
- Hosting resource or configuration limitations.

**Solution:**

1. Inspect Hostinger deployment logs.
2. Verify the configured Node.js version.
3. Check that dependencies install successfully.
4. Verify the backend entry point and start command.
5. Confirm that required environment variables are configured.
6. Check the hosting plan's application requirements and limitations.

### Website works but API subdomain does not

Verify:

- DNS records for `api.arihantclutches.com`.
- Backend application deployment status.
- Domain association in Hostinger.
- SSL configuration.
- Backend startup logs.
- API environment variables.

### Changes are not appearing after deployment

**Possible causes:**

- Changes were not pushed to the deployed branch.
- Deployment did not complete.
- Incorrect repository branch is connected.
- Browser or CDN cache contains older assets.

**Solution:**

1. Confirm that the latest changes are pushed to GitHub.
2. Check the connected deployment branch.
3. Verify the latest deployment status.
4. Check the deployed build.
5. Clear the browser cache if necessary.

---

## 8. General Debugging Guidelines

When troubleshooting an issue:

1. Reproduce the issue locally if possible.
2. Record the exact error message.
3. Check browser developer tools for frontend errors.
4. Check terminal or hosting logs for backend errors.
5. Identify the affected API endpoint.
6. Inspect the relevant controller, route, or configuration.
7. Make one change at a time.
8. Verify that the fix does not break related functionality.

Useful debugging locations:

| Area                   | Where to inspect                           |
| ---------------------- | ------------------------------------------ |
| Frontend errors        | Browser developer console                  |
| API requests           | Browser network tab                        |
| Backend errors         | Backend terminal or Hostinger logs         |
| Database connection    | `backend/config/db.js`                     |
| Environment validation | `backend/config/env.js`                    |
| Image uploads          | `backend/routes/uploadRoute.js`            |
| Payment processing     | `backend/controllers/paymentController.js` |
| Email delivery         | Backend email utility files                |

## 9. Important Safety Considerations

When debugging production issues:

- Never share API secrets or database credentials.
- Do not disable payment signature verification.
- Do not bypass authentication or authorization.
- Avoid modifying production database records without a backup.
- Do not manually change order or payment states without understanding their dependencies.
- Avoid deleting uploaded images without checking database references.
- Do not expose sensitive backend error details to customers.

For payment-related problems, always verify the actual payment state with Razorpay before making changes to an application order.
