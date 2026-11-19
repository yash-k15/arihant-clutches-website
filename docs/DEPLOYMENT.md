# Deployment Guide

This document describes the production hosting setup and deployment process for the Arihant Clutches ecommerce application.

The application is hosted on Hostinger, with the frontend and backend using separate subdomains.

## 1. Production Architecture

The current production configuration is:

| Component       | Technology        | Hosting                     | Domain                                   |
| --------------- | ----------------- | --------------------------- | ---------------------------------------- |
| Frontend        | React             | Hostinger Web/Cloud hosting | `https://arihantclutches.com`            |
| Backend         | Node.js + Express | Hostinger Web/Cloud hosting | `https://api.arihantclutches.com`        |
| Database        | MongoDB           | MongoDB                     | Configured through `MONGO_URI`           |
| Image storage   | Cloudinary        | Cloudinary                  | Configured through environment variables |
| Payment gateway | Razorpay          | Razorpay                    | Configured through environment variables |

The frontend communicates with the backend through the API subdomain.

The database and image storage services are external to the Hostinger application hosting environment.

**Hosting plan note:** This guide assumes Hostinger Business Web Hosting or Cloud hosting with Node.js Web App support. Confirm the exact plan and existing deployment settings in hPanel before making production changes.

## 2. Repository Structure

The project contains two applications in one GitHub repository:

```text
arihant-clutches-website/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── package.json
└── ...
```

The root `package.json` manages backend dependencies and scripts.

The frontend has its own `package.json` and uses Create React App.

Because both applications are in the same repository, deployment settings must point to the correct application and build output.

## 3. Backend Deployment

The backend is a Node.js application using Express.

### Production Entry Point

The backend entry point is:

```text
backend/server.js
```

The root `package.json` contains the production start script:

```json
{
  "scripts": {
    "start": "node backend/server.js"
  }
}
```

### Hostinger Configuration

For a Hostinger Node.js Web App deployment, the general setup is:

1. Sign in to Hostinger hPanel.
2. Open the Websites section.
3. Create or manage the Node.js Web App associated with the API subdomain.
4. Connect the GitHub repository or upload the application files.
5. Configure the repository root directory and deployment settings.
6. Select a compatible Node.js version.
7. Configure the required environment variables.
8. Set the application start command or entry file according to the available deployment options.
9. Deploy the application.
10. Review the deployment logs and verify the API.

The exact build and entry settings should be confirmed in the Hostinger deployment dashboard.

### Backend Environment Variables

Configure the backend environment variables in Hostinger.

These include:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- Cloudinary credentials.
- Razorpay credentials and webhook secret.
- General SMTP credentials.
- Authentication SMTP credentials.
- Optional pagination settings.

Refer to `ENVIRONMENT_CONFIGURATION.md` for the complete list.

Do not upload or commit the local `.env` file as a substitute for configuring production environment variables.

### Port Configuration

The backend uses:

```js
const PORT = process.env.PORT || 4000;
```

The hosting environment should supply the appropriate application port when required.

Do not force a fixed local development port if the hosting platform assigns its own port.

## 4. Frontend Deployment

The frontend uses React and Create React App.

### Production Build

The root project includes the following build command:

```bash
npm run build
```

This runs the frontend build script.

The production output directory is:

```text
frontend/build/
```

### API Configuration

The frontend uses:

```env
REACT_APP_API_URL=https://api.arihantclutches.com
```

This tells the frontend to send API requests to the production backend.

Unlike backend environment variables, React environment variables are embedded into the frontend build.

Therefore, if the API URL changes, rebuild and redeploy the frontend.

### Hostinger Frontend Hosting

The frontend can be deployed as a static React application.

The general deployment process is:

1. Open the website associated with `arihantclutches.com` in Hostinger.
2. Configure the frontend deployment using the repository or the generated production build.
3. Set the frontend project directory to `frontend` when using a repository-based build configuration.
4. Configure the React build command:

```bash
npm run build
```

5. Set the output directory to:

```text
build
```

The output directory is relative to the frontend project directory. If Hostinger uses the repository root as its build directory, the corresponding output path is `frontend/build`.

6. Configure `REACT_APP_API_URL` before building.
7. Deploy the generated frontend files.
8. Verify that the website loads and communicates with the production API.

The exact deployment method should match the existing Hostinger website configuration.

## 5. Domain and Subdomain Configuration

The production domains are:

| Domain                    | Purpose                            |
| ------------------------- | ---------------------------------- |
| `arihantclutches.com`     | Customer-facing ecommerce website. |
| `api.arihantclutches.com` | Backend API.                       |

Both domains must point to their respective hosting applications.

When changing domain or hosting configuration:

- Verify DNS records.
- Confirm that the correct application is associated with each domain.
- Configure HTTPS.
- Check that the frontend API URL matches the backend domain.
- Verify that backend CORS allows the production frontend origin.

The backend currently uses `CLIENT_URL` for its CORS origin configuration.

Production example:

```env
CLIENT_URL=https://arihantclutches.com
```

Do not change production DNS or remove an existing website without first understanding the current configuration and taking an appropriate backup.

## 6. SSL and HTTPS

Both production domains should use HTTPS:

- `https://arihantclutches.com`
- `https://api.arihantclutches.com`

Verify SSL configuration in Hostinger for both domains.

HTTPS is particularly important because the application handles:

- Customer authentication.
- User information.
- Checkout requests.
- Payment verification.
- API communication.

After deployment, check that there are no mixed-content errors or insecure API requests.

## 7. Razorpay Production Configuration

The production backend must use the appropriate Razorpay live credentials.

Configure:

```env
RAZORPAY_KEY_ID=your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

The Razorpay webhook must point to the production backend endpoint:

```text
https://api.arihantclutches.com/api/payment/webhook
```

Verify that:

- The webhook URL is correct.
- The configured webhook secret matches Razorpay.
- The required webhook events are enabled.
- Webhook signature verification continues to work.
- Payment verification and order reconciliation work correctly.

Refer to `PAYMENTS_AND_EMAILS.md` for the payment lifecycle and security requirements.

## 8. Deployment Workflow for Future Updates

The GitHub repository is the source code repository.

A typical deployment workflow is:

1. Make and test changes locally.
2. Run the frontend production build.
3. Commit the changes.
4. Push the changes to the appropriate GitHub branch.
5. Deploy the backend if backend code or configuration has changed.
6. Deploy the frontend if frontend code or configuration has changed.
7. Verify the production application.

If the Hostinger application is connected to GitHub with automatic deployments enabled, pushing to its configured deployment branch may trigger a new deployment.

Confirm the connected branch and deployment behavior in hPanel before relying on automatic deployment.

## 9. Post-Deployment Verification

After deploying an update, verify the following.

### Frontend

- [ ] Homepage loads correctly.
- [ ] Product listings load.
- [ ] Product images display correctly.
- [ ] Product details pages work.
- [ ] Login and registration work.
- [ ] Cart functionality works.
- [ ] Checkout works.
- [ ] Customer order history loads.
- [ ] Admin functionality works.
- [ ] Mobile layout works correctly.

### Backend

- [ ] API responds correctly.
- [ ] MongoDB connection succeeds.
- [ ] Authentication works.
- [ ] Product APIs work.
- [ ] Order APIs work.
- [ ] Image uploads work.
- [ ] Email functionality works.
- [ ] CORS allows the production frontend.
- [ ] Error handling works correctly.

### Payments

- [ ] Razorpay checkout opens.
- [ ] Payment verification works.
- [ ] Webhook requests are verified.
- [ ] Successful orders are reconciled.
- [ ] Stock is deducted correctly.
- [ ] COD orders work correctly.

### Infrastructure

- [ ] Frontend domain uses HTTPS.
- [ ] API domain uses HTTPS.
- [ ] DNS records resolve correctly.
- [ ] Hostinger deployment status is successful.
- [ ] No unexpected errors appear in deployment logs.

## 10. Hosting Limitations and Considerations

Hostinger Web/Cloud Node.js hosting has plan-dependent resource and process limits.

Before adding new backend functionality, review the limitations of the selected hosting plan.

In particular, verify whether a feature requires:

- Inbound WebSocket connections.
- Persistent background workers.
- Custom listening ports.
- Additional services such as Redis or Docker.
- Long-running requests.

Some of these capabilities are not supported by Hostinger's managed Node.js Web/Cloud hosting environment and may require a VPS or a separate service.

## 11. Deployment and Recovery Best Practices

- Keep production credentials outside GitHub.
- Maintain database backups.
- Keep track of deployed Git commits.
- Review deployment logs after updates.
- Avoid making untested changes directly in production.
- Verify payment and inventory workflows after relevant backend changes.
- Keep frontend and backend API configuration synchronized.
- Take appropriate backups before major infrastructure changes.

---

## 12. Official Hostinger Resources

Refer to Hostinger's documentation for current deployment instructions and plan-specific limitations:

- [Node.js hosting options at Hostinger](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/)
- [How to add a Node.js web app in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/)
- [Hostinger Node.js limits for Web and Cloud plans](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/)

Hostinger may update its dashboard and deployment workflow. Always verify the current settings in hPanel before making production changes.
