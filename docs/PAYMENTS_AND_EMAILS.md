# Payments and Emails

This document explains the payment processing and email functionality used by the Arihant Clutches ecommerce application.

The application uses:

- **Razorpay** for online payment processing.
- **MongoDB** for storing orders and payment-related information.
- **Nodemailer** for sending transactional and authentication emails.
- **SMTP** for email delivery.

## 1. Razorpay Configuration

Razorpay is integrated into the backend for online payments.

The following environment variables are required:

| Variable                  | Description                               |
| ------------------------- | ----------------------------------------- |
| `RAZORPAY_KEY_ID`         | Razorpay API key ID.                      |
| `RAZORPAY_KEY_SECRET`     | Razorpay API key secret.                  |
| `RAZORPAY_WEBHOOK_SECRET` | Secret used to verify webhook signatures. |

Configure these values in the root `.env` file.

For setup instructions, refer to `ENVIRONMENT_CONFIGURATION.md`.

### Relevant Files

| File                                       | Responsibility                                          |
| ------------------------------------------ | ------------------------------------------------------- |
| `backend/utils/razorpay.js`                | Initializes the Razorpay client.                        |
| `backend/routes/paymentRoute.js`           | Defines payment API endpoints.                          |
| `backend/controllers/paymentController.js` | Implements payment processing and reconciliation logic. |

---

## 2. Payment API Endpoints

The payment routes are registered under:

```text
/api/payment
```

The current endpoints include:

| Endpoint                           | Access    | Purpose                                                           |
| ---------------------------------- | --------- | ----------------------------------------------------------------- |
| `POST /api/payment/create-order`   | Protected | Creates a Razorpay order and the corresponding application order. |
| `POST /api/payment/verify-payment` | Protected | Verifies the payment and reconciles the application order.        |
| `POST /api/payment/webhook`        | Public    | Receives payment-related webhook events from Razorpay.            |

The webhook endpoint is public because Razorpay must be able to send requests to it. Its authenticity is verified using the configured webhook secret.

---

## 3. Online Payment Workflow

The online checkout process is implemented in:

```text
backend/controllers/paymentController.js
```

The general workflow is as follows.

### Step 1: Create Payment Order

When a customer initiates online checkout:

1. The backend receives the checkout request.
2. The backend calculates the order pricing using server-side data.
3. The backend creates a Razorpay order.
4. A durable application order is created before payment completion.
5. An idempotency mechanism helps prevent duplicate order creation.

The backend remains authoritative for pricing. It does not rely on frontend-submitted totals as the final order value.

### Step 2: Customer Completes Payment

The frontend uses the Razorpay checkout flow to allow the customer to complete payment.

### Step 3: Verify Payment

After checkout, the frontend submits the payment details to the backend verification endpoint.

The backend:

1. Verifies the Razorpay payment signature using `RAZORPAY_KEY_SECRET`.
2. Fetches the payment information from Razorpay.
3. Validates the payment amount and currency.
4. Checks the association between the payment and the application order.
5. Handles payment authorization and capture as required.
6. Reconciles the payment and application order status.

A successful frontend checkout response alone is not treated as sufficient proof of payment.

### Step 4: Update Inventory

Stock deduction is performed through a MongoDB transaction.

The implementation is designed to ensure that stock is deducted exactly once when the payment is successfully reconciled.

If stock is unavailable after payment capture, the backend attempts a refund and confirms the refund state.

---

## 4. Webhook Verification and Reconciliation

Razorpay webhooks provide an additional mechanism for receiving payment-related updates.

The webhook endpoint is:

```text
POST /api/payment/webhook
```

The backend verifies the webhook signature using:

```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

The webhook signature is calculated against the raw request body.

The Express application preserves the raw request body for the payment webhook route so that signature verification can be performed correctly.

### Why Webhooks Matter

Webhooks help the backend receive payment updates independently of the customer's browser session.

For example, a customer may complete payment but close the browser before the frontend finishes its verification request.

Webhook processing helps the backend reconcile payment state in such situations.

### Important Considerations

- Never remove webhook signature verification.
- Never trust an unsigned webhook request.
- Keep the webhook secret private.
- Preserve raw request body handling.
- Ensure payment reconciliation remains safe against duplicate events.

---

## 5. Idempotency and Payment Safety

The payment implementation includes idempotency protections to help prevent duplicate order creation and repeated inventory deductions.

When modifying payment-related code, preserve the following safeguards:

- Server-side price calculation.
- Razorpay signature verification.
- Payment amount and currency validation.
- Payment-to-order association checks.
- Duplicate request protection.
- Safe stock deduction.
- MongoDB transaction handling.
- Refund handling when stock cannot be fulfilled after payment capture.
- Webhook signature verification and reconciliation.

Payment logic should always be tested carefully before deploying changes.

---

## 6. Cash on Delivery

The application also supports Cash on Delivery (COD).

The COD order creation workflow is handled by the backend.

The implementation:

1. Validates the order request.
2. Processes stock changes.
3. Creates the application order.
4. Uses a MongoDB transaction to maintain consistency.
5. Includes idempotency protection.

COD does not follow the Razorpay payment flow, but it still requires the backend to validate order data and manage inventory safely.

---

## 7. Email Configuration

The application uses Nodemailer with SMTP credentials to send emails.

There are two separate email configurations.

### General Emails

General email functionality is implemented in:

```text
backend/utils/sendEmail.js
```

It uses the following environment variables:

| Variable        | Description                        |
| --------------- | ---------------------------------- |
| `SMTP_HOST`     | SMTP server hostname.              |
| `SMTP_PORT`     | SMTP server port.                  |
| `SMTP_EMAIL`    | SMTP authentication email account. |
| `SMTP_PASSWORD` | SMTP authentication password.      |
| `FROM_NAME`     | Sender display name.               |
| `FROM_EMAIL`    | Sender email address.              |

### Authentication Emails

Authentication email functionality is implemented in:

```text
backend/utils/sendAuthEmail.js
```

It uses a separate SMTP configuration:

| Variable             | Description                        |
| -------------------- | ---------------------------------- |
| `AUTH_SMTP_HOST`     | SMTP server hostname.              |
| `AUTH_SMTP_PORT`     | SMTP server port.                  |
| `AUTH_SMTP_EMAIL`    | SMTP authentication email account. |
| `AUTH_SMTP_PASSWORD` | SMTP authentication password.      |
| `AUTH_FROM_NAME`     | Sender display name.               |
| `AUTH_FROM_EMAIL`    | Sender email address.              |

Keeping these configurations separate allows authentication-related emails to use a dedicated SMTP account.

---

## 8. Email Branding

Email branding is configured through:

```text
backend/config/siteConfig.js
```

The configuration includes:

- Brand name.
- Website URL.
- Support email.
- Email logo URL.
- Email colors.
- Email subjects.
- Email footer.

The general email utility also replaces the `{brandName}` placeholder in configured subjects with the current brand name.

When adapting the application for another client, update the email branding and review the email templates to ensure they reflect the new business.

---

## 9. Testing Payment and Email Changes

After modifying payment or email functionality, verify the affected workflows in an appropriate test environment.

### Payment Verification Checklist

- [ ] Razorpay credentials are configured correctly.
- [ ] Online order creation works.
- [ ] Backend pricing is calculated correctly.
- [ ] Successful payments are verified.
- [ ] Invalid payment signatures are rejected.
- [ ] Payment amount and currency are validated.
- [ ] Duplicate requests do not create duplicate orders.
- [ ] Stock is deducted correctly and only once.
- [ ] Webhook signatures are verified.
- [ ] Webhook reconciliation works.
- [ ] Refund handling is verified for relevant failure scenarios.
- [ ] COD order creation works correctly.

### Email Verification Checklist

- [ ] General SMTP credentials are configured.
- [ ] Authentication SMTP credentials are configured.
- [ ] General emails are delivered.
- [ ] Authentication emails are delivered.
- [ ] Sender names and email addresses are correct.
- [ ] Email branding and links are correct.

---

## 10. Security Guidelines

- Never expose Razorpay secrets in frontend code.
- Never commit payment or SMTP credentials.
- Always verify payment signatures on the backend.
- Always verify webhook signatures.
- Do not trust frontend-submitted order totals.
- Preserve idempotency protections.
- Do not remove transaction handling from inventory updates without reviewing the consequences.
- Use Razorpay test credentials while developing and testing.
- Use live credentials only in the production environment.

Payment processing is a critical part of the application. Changes to this area should be reviewed carefully to avoid incorrect order states, duplicate charges, or inventory inconsistencies.
