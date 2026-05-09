const orderConfirmationEmail = (order, paymentId) => {
  return `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    ">

      <div style="
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        border: 1px solid #e5e5e5;
      ">

        <h1 style="
          color: #222;
          margin-bottom: 10px;
        ">
          Thank You For Your Order!
        </h1>

        <p style="
          font-size: 16px;
          color: #555;
        ">
          Your order has been placed successfully.
        </p>

        <hr style="
          margin: 25px 0;
          border: none;
          border-top: 1px solid #eee;
        ">

        <h2 style="
          color: #333;
          margin-bottom: 15px;
        ">
          Order Details
        </h2>

        <p>
          <strong>Order ID:</strong>
          ${order._id}
        </p>

        <p>
          <strong>Payment ID:</strong>
          ${paymentId}
        </p>

        <p>
          <strong>Order Date:</strong>
          ${new Date().toLocaleDateString()}
        </p>

        <hr style="
          margin: 25px 0;
          border: none;
          border-top: 1px solid #eee;
        ">

        <h2 style="
          color: #333;
          margin-bottom: 15px;
        ">
          Items Ordered
        </h2>

        <table style="
          width: 100%;
          border-collapse: collapse;
        ">

          <thead>
            <tr style="
              background-color: #f1f1f1;
            ">
              <th style="
                text-align: left;
                padding: 12px;
                border: 1px solid #ddd;
              ">
                Product
              </th>

              <th style="
                text-align: center;
                padding: 12px;
                border: 1px solid #ddd;
              ">
                Qty
              </th>

              <th style="
                text-align: right;
                padding: 12px;
                border: 1px solid #ddd;
              ">
                Price
              </th>
            </tr>
          </thead>

          <tbody>

            ${order.orderItems
              .map(
                (item) => `
                  <tr>
                    <td style="
                      padding: 12px;
                      border: 1px solid #ddd;
                    ">
                      ${item.name}
                    </td>

                    <td style="
                      text-align: center;
                      padding: 12px;
                      border: 1px solid #ddd;
                    ">
                      ${item.qty}
                    </td>

                    <td style="
                      text-align: right;
                      padding: 12px;
                      border: 1px solid #ddd;
                    ">
                      ₹${item.price}
                    </td>
                  </tr>
                `,
              )
              .join('')}

          </tbody>
        </table>

        <hr style="
          margin: 25px 0;
          border: none;
          border-top: 1px solid #eee;
        ">

        <h2 style="
          color: #333;
          margin-bottom: 15px;
        ">
          Payment Summary
        </h2>

        <p>
          <strong>Items Price:</strong>
          ₹${order.itemsPrice}
        </p>

        <p>
          <strong>Shipping:</strong>
          ₹${order.shippingPrice}
        </p>

        <p>
          <strong>Tax:</strong>
          ₹${order.taxPrice}
        </p>

        <p style="
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
        ">
          Total: ₹${order.totalPrice}
        </p>

        <hr style="
          margin: 25px 0;
          border: none;
          border-top: 1px solid #eee;
        ">

        <h2 style="
          color: #333;
          margin-bottom: 15px;
        ">
          Shipping Address
        </h2>

        <p>
          ${order.shippingAddress.address}
        </p>

        <p>
          ${order.shippingAddress.city},
          ${order.shippingAddress.state},
          ${order.shippingAddress.postalCode}
        </p>

        <p>
          ${order.shippingAddress.country}
        </p>

        <hr style="
          margin: 25px 0;
          border: none;
          border-top: 1px solid #eee;
        ">

        <p style="
          color: #777;
          font-size: 14px;
          margin-top: 30px;
        ">
          If you have any questions regarding your order,
          please contact our support team.
        </p>

      </div>
    </div>
  `;
};

export default orderConfirmationEmail;
