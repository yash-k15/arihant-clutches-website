# Application Configuration

This document explains how to customize the application for a different business or client.

The project separates brand information, business rules, and frontend presentation settings into configuration files. This makes it easier to reuse the ecommerce application without searching through multiple components and controllers for hardcoded values.

## 1. Configuration Overview

The main configuration files are:

| File                                | Purpose                                                               |
| ----------------------------------- | --------------------------------------------------------------------- |
| `backend/config/siteConfig.js`      | Backend brand and email configuration.                                |
| `backend/config/businessConfig.js`  | Business rules, timezone, and order limits.                           |
| `frontend/src/config/siteConfig.js` | Frontend brand identity, SEO, contact information, assets, and theme. |

When adapting the project for another client, review all three files.

---

## 2. Backend Brand Configuration

**File:** `backend/config/siteConfig.js`

This file contains backend-facing brand information and email presentation settings.

Current configuration includes:

- Brand name.
- Website URL.
- Support email.
- Email logo URL.
- Timezone.
- Email colors.
- Email subjects.
- Email footer.

For a new client, update these values to match the business.

For example, the brand-related settings should reflect the new business:

```js
brandName: 'New Business Name',
websiteUrl: 'https://example.com',
supportEmail: 'support@example.com',
emailLogoUrl: 'https://example.com/logo.png',
```

The email colors, subjects, and footer should also be reviewed so that transactional emails match the client's branding.

**Important:** Keep the backend and frontend brand information consistent.

---

## 3. Business Configuration

**File:** `backend/config/businessConfig.js`

This file contains business rules that affect backend application behavior.

Current configuration:

| Setting                           |  Current Value | Description                                          |
| --------------------------------- | -------------: | ---------------------------------------------------- |
| `timezone`                        | `Asia/Kolkata` | Business timezone used by the application.           |
| `orderLimits.maxItems`            |           `50` | Maximum number of items allowed in an order.         |
| `orderLimits.maxQuantityPerItem`  |           `15` | Maximum quantity allowed for an individual item.     |
| `temporaryOnlineOrderExpiryHours` |           `48` | Expiry period for temporary online orders, in hours. |

When reusing the application, review these values with the client.

For example, a business with different order restrictions may need different limits.

Do not change these settings without reviewing the corresponding backend logic. In particular, order expiry and inventory handling should remain consistent with the payment workflow.

---

## 4. Frontend Brand and Website Configuration

**File:** `frontend/src/config/siteConfig.js`

This file contains the frontend-facing business identity and presentation settings.

It currently groups configuration into the following areas.

### Business and Brand

Contains:

- Business timezone.
- Brand name.
- Brand tagline.

Update these values when changing the business identity.

### SEO

Contains:

- Website description.
- SEO keywords.
- Website URL.
- Social sharing image.

Review these values for every new client. SEO content should describe the actual products and business rather than retaining Arihant Clutches information.

### Assets

Contains the website logo URL.

Replace the existing logo with the new client's logo.

### Contact Information

Contains:

- Contact name.
- Contact email.
- Display phone number.
- Phone link.

Update these values using the client's approved contact details.

### Social Links

Contains the business's Instagram URL.

Update this link or review the social configuration if the new client uses different social platforms.

### Developer Information

Contains developer credit and contact information displayed by the application.

Review this section when deploying the application for another client.

### Theme

Contains the frontend theme colors.

Update these values to match the client's branding. Check the website across its main screens after changing colors to ensure sufficient contrast and consistent presentation.

---

## 5. Email Configuration

Email-related settings are distributed between the backend configuration and environment variables.

| File                             | Responsibility                                                              |
| -------------------------------- | --------------------------------------------------------------------------- |
| `backend/config/siteConfig.js`   | Brand name, website URL, support email, logo, colors, subjects, and footer. |
| `backend/utils/sendEmail.js`     | General email sending configuration.                                        |
| `backend/utils/sendAuthEmail.js` | Authentication email sending configuration.                                 |
| Root `.env`                      | SMTP credentials and sender configuration.                                  |

When adapting the application:

1. Update the brand and email presentation settings.
2. Configure the client's SMTP credentials in the environment file.
3. Review sender names and email addresses.
4. Test general and authentication emails independently.

Refer to `PAYMENTS_AND_EMAILS.md` for more details about the email workflows.

---

## 6. Configuration Checklist for a New Client

Use this checklist when adapting the project for another business.

### Brand Identity

- [ ] Update the brand name.
- [ ] Update the tagline.
- [ ] Replace the logo.
- [ ] Update the website URL.
- [ ] Update the SEO description and keywords.
- [ ] Update the social sharing image.

### Business Information

- [ ] Update the support email.
- [ ] Update contact name and phone number.
- [ ] Update social media links.
- [ ] Review the business timezone.
- [ ] Review maximum order item and quantity limits.
- [ ] Review temporary online order expiry settings.

### Email Configuration

- [ ] Update email branding.
- [ ] Update email subjects and footer.
- [ ] Configure general SMTP credentials.
- [ ] Configure authentication SMTP credentials.
- [ ] Verify sender email addresses.

### Visual Appearance

- [ ] Update theme colors.
- [ ] Check logo sizing and placement.
- [ ] Verify text contrast.
- [ ] Review the main screens on desktop and mobile.

### Final Verification

- [ ] Search the codebase for remaining Arihant Clutches references.
- [ ] Check that no old contact details or social links remain.
- [ ] Verify frontend and backend brand information are consistent.
- [ ] Test the application using the new client's configuration.

---

## 7. Important Considerations

Configuration files make customization easier, but they do not automatically make every part of the application client-independent.

Before using this project for another business:

- Search for hardcoded brand names, URLs, contact details, and business-specific text.
- Review email templates and other user-facing messages.
- Review payment credentials and webhook configuration.
- Review business rules before changing order limits or expiry settings.
- Test the complete checkout and order lifecycle after customization.

The goal is to keep client-specific information centralized and make future customization predictable without changing core ecommerce functionality.
