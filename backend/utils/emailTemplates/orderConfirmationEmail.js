const orderConfirmationEmail = (order, paymentId, customerEmail) => {
  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const isCOD = paymentId === 'Cash on Delivery';

  const customerName = escapeHtml(
    order.shippingAddress?.fullName || 'Customer',
  );

  const getOrdinal = (day) => {
    if (day >= 11 && day <= 13) {
      return `${day}th`;
    }

    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const orderDateValue = order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  const orderDate = `${getOrdinal(
    orderDateValue.getDate(),
  )} ${orderDateValue.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })}`;

  const paymentMethod = isCOD ? 'Cash on Delivery' : 'Online Payment';

  const shippingPrice = Number(order.shippingPrice || 0);
  const subtotal = Number(order.itemsPrice || 0);
  const total = Number(order.totalPrice || 0);

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  const logoUrl =
    'https://res.cloudinary.com/doykjfgps/image/upload/v1790252476/Arihant_Clutches_Logo.png';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Order Confirmation - Arihant Clutches</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f7f3ee;
        font-family: Arial, Helvetica, sans-serif;
        color: #2c2222;
      ">
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background-color: #f7f3ee;
            padding: 30px 15px;
          "
        >
          <tr>
            <td align="center">

              <!-- Main Container -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 680px;
                  background-color: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  border: 1px solid #e8ddcd;
                "
              >

                <!-- Header -->
                <tr>
                  <td
                    align="center"
                    style="
                      background-color: #2c2222;
                      padding: 28px 25px 24px;
                    "
                  >
                    <!-- Logo Container -->
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        background-color: #fdfaf5;
                        border-radius: 10px;
                        margin: 0 auto;
                      "
                    >
                      <tr>
                        <td
                          align="center"
                          style="
                            padding: 12px 20px;
                          "
                        >
                          <img
                            src="${logoUrl}"
                            alt="Arihant Clutches"
                            width="220"
                            style="
                              display: block;
                              width: 220px;
                              max-width: 100%;
                              height: auto;
                              margin: 0 auto;
                            "
                          />
                        </td>
                      </tr>
                    </table>

                    <div style="
                      color: #fdfaf5;
                      font-size: 13px;
                      margin-top: 16px;
                      letter-spacing: 0.3px;
                    ">
                      Thank you for shopping with us
                    </div>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="
                    padding: 35px 35px 20px;
                  ">
                    <h1 style="
                      margin: 0 0 12px;
                      color: #2c2222;
                      font-size: 26px;
                      line-height: 1.3;
                    ">
                      Thank You for Your Order!
                    </h1>

                    <p style="
                      margin: 0;
                      color: #6f6258;
                      font-size: 15px;
                      line-height: 1.6;
                    ">
                      Hi ${customerName}, your order has been placed
                      successfully. We've received your order and will
                      begin preparing it shortly.
                    </p>

                    <p style="
                      margin: 10px 0 0;
                      color: #8a7b6d;
                      font-size: 13px;
                      line-height: 1.6;
                    ">
                      You can view your orders anytime from your profile.
                    </p>
                  </td>
                </tr>

                <!-- Order Information -->
                <tr>
                  <td style="
                    padding: 10px 35px 25px;
                  ">
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        background-color: #fdfaf5;
                        border: 1px solid #e8ddcd;
                        border-radius: 10px;
                      "
                    >
                      <!-- Order ID / Date -->
                      <tr>
                        <td style="
                          width: 50%;
                          padding: 18px;
                          vertical-align: top;
                        ">
                          <div style="
                            color: #9a8979;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 1px;
                            text-transform: uppercase;
                            margin-bottom: 7px;
                          ">
                            Order Number
                          </div>

                          <div style="
                            color: #2c2222;
                            font-size: 15px;
                            font-weight: 600;
                            word-break: break-all;
                          ">
                            ${escapeHtml(order._id)}
                          </div>
                        </td>

                        <td style="
                          width: 50%;
                          padding: 18px;
                          vertical-align: top;
                        ">
                          <div style="
                            color: #9a8979;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 1px;
                            text-transform: uppercase;
                            margin-bottom: 7px;
                          ">
                            Order Date
                          </div>

                          <div style="
                            color: #2c2222;
                            font-size: 15px;
                            font-weight: 600;
                          ">
                            ${orderDate}
                          </div>
                        </td>
                      </tr>

                      <!-- Payment -->
                      <tr>
                        <td style="
                          padding: 0 18px 18px;
                          vertical-align: top;
                        ">
                          <div style="
                            color: #9a8979;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 1px;
                            text-transform: uppercase;
                            margin-bottom: 6px;
                          ">
                            Payment Method
                          </div>

                          <div style="
                            color: #2c2222;
                            font-size: 15px;
                            font-weight: 600;
                          ">
                            ${paymentMethod}
                          </div>
                        </td>

                        ${
                          !isCOD
                            ? `
                              <td style="
                                padding: 0 18px 18px;
                                vertical-align: top;
                              ">
                                <div style="
                                  color: #9a8979;
                                  font-size: 11px;
                                  font-weight: 700;
                                  letter-spacing: 1px;
                                  text-transform: uppercase;
                                  margin-bottom: 6px;
                                ">
                                  Payment ID
                                </div>

                                <div style="
                                  color: #2c2222;
                                  font-size: 12px;
                                  font-weight: 600;
                                  word-break: break-all;
                                ">
                                  ${escapeHtml(paymentId)}
                                </div>
                              </td>
                            `
                            : '<td></td>'
                        }
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items -->
                <tr>
                  <td style="
                    padding: 5px 35px 25px;
                  ">
                    <h2 style="
                      margin: 0 0 15px;
                      color: #2c2222;
                      font-size: 18px;
                    ">
                      Your Items
                    </h2>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        border-collapse: collapse;
                      "
                    >
                      <thead>
                        <tr style="
                          border-bottom: 2px solid #e8ddcd;
                        ">
                          <th
                            align="left"
                            style="
                              padding: 10px 5px;
                              color: #9a8979;
                              font-size: 11px;
                              text-transform: uppercase;
                              letter-spacing: 0.5px;
                            "
                          >
                            Product
                          </th>

                          <th
                            align="center"
                            style="
                              padding: 10px 5px;
                              color: #9a8979;
                              font-size: 11px;
                              text-transform: uppercase;
                              letter-spacing: 0.5px;
                            "
                          >
                            Qty
                          </th>

                          <th
                            align="right"
                            style="
                              padding: 10px 5px;
                              color: #9a8979;
                              font-size: 11px;
                              text-transform: uppercase;
                              letter-spacing: 0.5px;
                            "
                          >
                            Price
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        ${order.orderItems
                          .map(
                            (item) => `
                              <tr style="
                                border-bottom: 1px solid #eee6dc;
                              ">
                                <td style="
                                  padding: 15px 5px;
                                  color: #2c2222;
                                  font-size: 14px;
                                ">
                                  <div style="
                                    font-weight: 600;
                                    margin-bottom: 4px;
                                  ">
                                    ${escapeHtml(item.name)}
                                  </div>

                                  ${
                                    item.color
                                      ? `
                                        <div style="
                                          color: #8a7b6d;
                                          font-size: 12px;
                                        ">
                                          Color: ${escapeHtml(item.color)}
                                        </div>
                                      `
                                      : ''
                                  }
                                </td>

                                <td
                                  align="center"
                                  style="
                                    padding: 15px 5px;
                                    color: #6f6258;
                                    font-size: 14px;
                                  "
                                >
                                  ${item.qty}
                                </td>

                                <td
                                  align="right"
                                  style="
                                    padding: 15px 5px;
                                    color: #2c2222;
                                    font-size: 14px;
                                    font-weight: 600;
                                  "
                                >
                                  ${formatPrice(item.price * item.qty)}
                                </td>
                              </tr>
                            `,
                          )
                          .join('')}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Order Summary -->
                <tr>
                  <td style="
                    padding: 5px 35px 30px;
                  ">
                    <h2 style="
                      margin: 0 0 15px;
                      color: #2c2222;
                      font-size: 18px;
                    ">
                      Order Summary
                    </h2>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td style="
                          padding: 6px 0;
                          color: #6f6258;
                          font-size: 14px;
                        ">
                          Subtotal
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 6px 0;
                            color: #2c2222;
                            font-size: 14px;
                          "
                        >
                          ${formatPrice(subtotal)}
                        </td>
                      </tr>

                      <tr>
                        <td style="
                          padding: 6px 0;
                          color: #6f6258;
                          font-size: 14px;
                        ">
                          Shipping
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 6px 0;
                            color: #2c2222;
                            font-size: 14px;
                          "
                        >
                          ${formatPrice(shippingPrice)}
                        </td>
                      </tr>

                      <tr>
                        <td
                          colspan="2"
                          style="
                            padding-top: 15px;
                            border-top: 1px solid #e8ddcd;
                          "
                        ></td>
                      </tr>

                      <tr>
                        <td style="
                          padding: 5px 0;
                          color: #2c2222;
                          font-size: 17px;
                          font-weight: 700;
                        ">
                          Total
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 5px 0;
                            color: #b08d57;
                            font-size: 20px;
                            font-weight: 700;
                          "
                        >
                          ${formatPrice(total)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Shipping Address -->
                <tr>
                  <td style="
                    padding: 0 35px 30px;
                  ">
                    <h2 style="
                      margin: 0 0 15px;
                      color: #2c2222;
                      font-size: 18px;
                    ">
                      Shipping Address
                    </h2>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        background-color: #fdfaf5;
                        border: 1px solid #e8ddcd;
                        border-radius: 10px;
                      "
                    >
                      <tr>
                        <td style="
                          padding: 18px;
                          color: #6f6258;
                          font-size: 14px;
                          line-height: 1.7;
                        ">
                          <strong style="
                            color: #2c2222;
                          ">
                            ${escapeHtml(order.shippingAddress.fullName)}
                          </strong>

                          <br />

                          ${escapeHtml(order.shippingAddress.addressLine1)}

                          <br />

                          ${
                            order.shippingAddress.addressLine2
                              ? `${escapeHtml(order.shippingAddress.addressLine2)}<br />`
                              : ''
                          }

                          ${escapeHtml(order.shippingAddress.city)},
                          ${escapeHtml(order.shippingAddress.state)}

                          <br />

                          ${escapeHtml(order.shippingAddress.postalCode)},
                          ${escapeHtml(order.shippingAddress.country)}

                          <br />

                          <span style="
                            color: #8a7b6d;
                          ">
                            Phone: ${escapeHtml(order.shippingAddress.phone)}
                          </span>

                          <br />

                          <span style="
                            color: #8a7b6d;
                          ">
                            Email: ${escapeHtml(customerEmail)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Support -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 5px 35px 35px;
                    "
                  >
                    <div style="
                      height: 1px;
                      background-color: #e8ddcd;
                      margin-bottom: 25px;
                    "></div>

                    <p style="
                      margin: 0 0 8px;
                      color: #2c2222;
                      font-size: 14px;
                      font-weight: 600;
                    ">
                      Need help with your order?
                    </p>

                    <p style="
                      margin: 0;
                      color: #8a7b6d;
                      font-size: 13px;
                      line-height: 1.6;
                    ">
                      Contact us at
                      <a
                        href="mailto:arihantfashionsindia@gmail.com"
                        style="
                          color: #b08d57;
                          text-decoration: none;
                          font-weight: 600;
                        "
                      >
                        arihantfashionsindia@gmail.com
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    align="center"
                    style="
                      background-color: #2c2222;
                      padding: 22px;
                    "
                  >
                    <div style="
                      color: #b08d57;
                      font-size: 14px;
                      font-weight: 700;
                      letter-spacing: 0.8px;
                      margin-bottom: 6px;
                    ">
                      ARIHANT CLUTCHES
                    </div>

                    <div style="
                      color: #cfc4b8;
                      font-size: 11px;
                    ">
                      Thank you for choosing Arihant Clutches.
                    </div>
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

export default orderConfirmationEmail;
