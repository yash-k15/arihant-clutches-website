import siteConfig from '../../config/siteConfig.js';

const resetPasswordEmail = (resetUrl) => {
  const colors = siteConfig.emailColors;
  const copyright = siteConfig.emailFooter.copyright
    .replace('{year}', new Date().getFullYear())
    .replace('{brandName}', siteConfig.brandName);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: ${colors.resetBackground};
          font-family: Arial, Helvetica, sans-serif;
          color: ${colors.primary};
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="background-color: ${colors.resetBackground}; padding: 40px 20px;"
        >
          <tr>
            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 600px;
                  background-color: ${colors.white};
                  border: 1px solid ${colors.resetBorder};
                  border-radius: 12px;
                  overflow: hidden;
                "
              >

                <!-- Header -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 30px 30px 24px;
                      border-bottom: 1px solid ${colors.resetDivider};
                    "
                  >
                    <h1
                      style="
                        margin: 0;
                        color: ${colors.primary};
                        font-size: 26px;
                        font-weight: 700;
                      "
                    >
                      ${siteConfig.brandName}
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 40px 40px;">

                    <h2
                      style="
                        margin: 0 0 18px;
                        color: ${colors.primary};
                        font-size: 24px;
                        font-weight: 600;
                      "
                    >
                      Reset Your Password
                    </h2>

                    <p
                      style="
                        margin: 0 0 18px;
                        color: ${colors.resetText};
                        font-size: 16px;
                        line-height: 1.6;
                      "
                    >
                      We received a request to reset the password for your
                      ${siteConfig.brandName} account.
                    </p>

                    <p
                      style="
                        margin: 0 0 28px;
                        color: ${colors.resetText};
                        font-size: 16px;
                        line-height: 1.6;
                      "
                    >
                      Click the button below to create a new password:
                    </p>

                    <!-- Button -->
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="margin: 0 auto 28px;"
                    >
                      <tr>
                        <td
                          align="center"
                          style="
                            background-color: ${colors.primary};
                            border-radius: 8px;
                          "
                        >
                          <a
                            href="${resetUrl}"
                            style="
                              display: inline-block;
                              padding: 14px 28px;
                              color: ${colors.white};
                              text-decoration: none;
                              font-size: 16px;
                              font-weight: 600;
                            "
                          >
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p
                      style="
                        margin: 0 0 18px;
                        color: ${colors.resetMuted};
                        font-size: 14px;
                        line-height: 1.6;
                      "
                    >
                      This link is valid for <strong>10 minutes</strong> and
                      can only be used once.
                    </p>

                    <p
                      style="
                        margin: 0 0 18px;
                        color: ${colors.resetMuted};
                        font-size: 14px;
                        line-height: 1.6;
                      "
                    >
                      If you did not request a password reset, you can safely
                      ignore this email. Your password will remain unchanged.
                    </p>

                    <p
                      style="
                        margin: 0 0 28px;
                        color: ${colors.resetMuted};
                        font-size: 14px;
                        line-height: 1.6;
                      "
                    >
                      For your security, please do not share this email or
                      reset link with anyone.
                    </p>

                    <!-- Fallback URL -->
                    <p
                      style="
                        margin: 0;
                        padding-top: 20px;
                        border-top: 1px solid ${colors.resetDivider};
                        color: ${colors.resetSubtle};
                        font-size: 12px;
                        line-height: 1.6;
                      "
                    >
                      If the button above does not work, copy and paste the
                      following link into your browser:
                    </p>

                    <p
                      style="
                        margin: 8px 0 0;
                        word-break: break-all;
                        font-size: 12px;
                        line-height: 1.5;
                      "
                    >
                      <a
                        href="${resetUrl}"
                        style="
                          color: ${colors.resetLink};
                          text-decoration: underline;
                        "
                      >
                        ${resetUrl}
                      </a>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 22px 30px;
                      background-color: ${colors.resetFooterBackground};
                      border-top: 1px solid ${colors.resetDivider};
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: ${colors.resetSubtle};
                        font-size: 12px;
                        line-height: 1.5;
                      "
                    >
                      ${copyright}
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export default resetPasswordEmail;
