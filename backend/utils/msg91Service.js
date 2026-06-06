const sendMSG91OTP = async (phone) => {
  console.log('MSG91 KEY:', process.env.MSG91_AUTH_KEY);
  console.log('TEMPLATE:', process.env.MSG91_TEMPLATE_ID);
  const params = new URLSearchParams({
    template_id: process.env.MSG91_TEMPLATE_ID,
    mobile: `91${phone}`,
    authkey: process.env.MSG91_AUTH_KEY,
  });

  const response = await fetch(
    `https://control.msg91.com/api/v5/otp?${params}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  console.log('MSG91 Send OTP:', data);

  return data;
};

const verifyMSG91OTP = async (phone, otp) => {
  const params = new URLSearchParams({
    mobile: `91${phone}`,
    otp,
    authkey: process.env.MSG91_AUTH_KEY,
  });

  const response = await fetch(
    `https://control.msg91.com/api/v5/otp/verify?${params}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  console.log('MSG91 Verify OTP:', data);

  return data;
};

export { sendMSG91OTP, verifyMSG91OTP };
