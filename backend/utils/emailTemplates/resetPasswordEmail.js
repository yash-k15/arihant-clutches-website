const resetPasswordEmail = (resetUrl) => {
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
          background-color: #f7f5f2;
          font-family: Arial, Helvetica, sans-serif;
          color: #2c2222;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="background-color: #f7f5f2; padding: 40px 20px;"
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
                  background-color: #ffffff;
                  border: 1px solid #e8e1d9;
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
                      border-bottom: 1px solid #eee8e2;
                    "
                  >
                    <h1
                      style="
                        margin: 0;
                        color: #2c2222;
                        font-size: 26px;
                        font-weight: 700;
                      "
                    >
                      Arihant Clutches
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 40px 40px;">

                    <h2
                      style="
                        margin: 0 0 18px;
                        color: #2c2222;
                        font-size: 24px;
                        font-weight: 600;
                      "
                    >
                      Reset Your Password
                    </h2>

                    <p
                      style="
                        margin: 0 0 18px;
                        color: #555555;
                        font-size: 16px;
                        line-height: 1.6;
                      "
                    >
                      We received a request to reset the password for your
                      Arihant Clutches account.
                    </p>

                    <p
                      style="
                        margin: 0 0 28px;
                        color: #555555;
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
                            background-color: #2c2222;
                            border-radius: 8px;
                          "
                        >
                          <a
                            href="${resetUrl}"
                            style="
                              display: inline-block;
                              padding: 14px 28px;
                              color: #ffffff;
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
                        color: #777777;
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
                        color: #777777;
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
                        color: #777777;
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
                        border-top: 1px solid #eee8e2;
                        color: #999999;
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
                          color: #8a6a3f;
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
                      background-color: #faf9f7;
                      border-top: 1px solid #eee8e2;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: #999999;
                        font-size: 12px;
                        line-height: 1.5;
                      "
                    >
                      © 2026 Arihant Clutches. All rights reserved.
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
