# Application Configuration

This document explains how to customize the application for a different business or client.

The project separates brand information, business rules, and frontend presentation settings into configuration files.

## 1. Configuration Overview

| File | Purpose |
| --- | --- |
| `backend/config/siteConfig.js` | Backend brand and email configuration. |
| `backend/config/businessConfig.js` | Business rules, timezone, and order limits. |
| `frontend/src/config/siteConfig.js` | Frontend brand identity, SEO, contact information, assets, and theme. |

## 2. Backend Brand Configuration

**File:** `backend/config/siteConfig.js`

Contains the brand name, website URL, support email, email logo URL, email colors, email subjects, and email footer. Update these values for a new client and keep backend and frontend brand information consistent.

## 3. Business Configuration

**File:** `backend/config/businessConfig.js`

| Setting | Current Value | Description |
| --- | ---: | --- |
| `timezone` | `Asia/Kolkata` | Business timezone used by backend date and reporting logic. |
| `orderLimits.maxItems` | `50` | Maximum number of items allowed in an order. |
| `orderLimits.maxQuantityPerItem` | `15` | Maximum quantity allowed for an individual item. |
| `temporaryOnlineOrderExpiryHours` | `48` | Expiry period for temporary online orders, in hours. |

The backend timezone is defined here and consumed by backend reporting and order-date logic. The frontend has its own timezone setting in `frontend/src/config/siteConfig.js`; keep both values consistent. Review business rules before changing them.

## 4. Frontend Brand and Website Configuration

**File:** `frontend/src/config/siteConfig.js`

Review the business timezone, brand name and tagline, SEO description and keywords, website URL, social sharing image, logo, contact details, social links, developer information, and theme colors when adapting the application.

## 5. Email Configuration

| File | Responsibility |
| --- | --- |
| `backend/config/siteConfig.js` | Brand and email presentation settings. |
| `backend/utils/sendEmail.js` | General email sending configuration. |
| `backend/utils/sendAuthEmail.js` | Authentication email sending configuration. |
| Root `.env` | SMTP credentials and sender configuration. |

Configure the client's SMTP credentials and test general and authentication emails independently. Refer to [Payments and Emails](PAYMENTS_AND_EMAILS.md) for more details.

## 6. Configuration Checklist for a New Client

- [ ] Update brand name, tagline, logo, website URL, and SEO content.
- [ ] Update support email, contact details, and social links.
- [ ] Keep backend and frontend timezone settings consistent.
- [ ] Review order limits and temporary online order expiry.
- [ ] Update email branding, subjects, footer, and SMTP credentials.
- [ ] Update theme colors and verify text contrast.
- [ ] Search for remaining Arihant Clutches references.
- [ ] Test the complete checkout and order lifecycle.

## 7. Important Considerations

Configuration files do not automatically make every part of the application client-independent. Review hardcoded brand details, email templates, payment credentials, webhook configuration, and business rules before reusing the application.
