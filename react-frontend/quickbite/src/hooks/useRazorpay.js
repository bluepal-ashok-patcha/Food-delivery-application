import { useEffect } from 'react';

const useRazorpay = ({
  onSuccess,
  onFailure,
}) => {
  const openPaymentModal = (options) => {
    const {
      amount,
      currency = 'INR',
      orderId,
      userDetails,
    } = options;

    const razorpayOptions = {
      key: "rzp_test_your_key_here", // Replace with your actual key
      amount: amount * 100, // Amount in paise
      currency,
      name: 'QuickBite',
      description: 'Food Order Payment',
      order_id: orderId, // This should be generated from your backend
      handler: (response) => {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone,
      },
      notes: {
        address: 'QuickBite Corporate Office',
      },
      theme: {
        color: '#ff6b35',
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.on('payment.failed', (response) => {
      onFailure({
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        metadata: response.error.metadata,
      });
    });

    rzp.open();
  };

  return { openPaymentModal };
};

export default useRazorpay;