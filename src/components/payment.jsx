import React, { useState, useEffect } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51SMnEdJagUQYuDBz78lNIAgXDj2bLCfoyWYQKMYFyubkqAnbqY55EMjuzf9hu4pwQvoHbmBcxxuBZLOr4yFAgSBV00vA5zowun');

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!stripe || !elements) return;

    setLoading(true);

    // Confirm payment using Payment Element and clientSecret
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.origin + '/payment-success', // or your success URL
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
    // Payment confirmed; user will be redirected on success or failure
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
      {message && <div>{message}</div>}
    </form>
  );
}

export default function Payment() {
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  // Function to create a PaymentIntent with backend based on the amount
  const createPaymentIntent = async (amountValue) => {
    try {
      setError(null);
      const { data } = await axios.post('http://localhost:5000/api/payment', {
        amount: Math.round(amountValue * 100), // amount in cents
      });
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError('Failed to create payment session.');
      setClientSecret('');
    }
  };

  // Handle amount input change and create PaymentIntent accordingly
  useEffect(() => {
    if (amount && !isNaN(amount) && Number(amount) > 0) {
      createPaymentIntent(amount);
    } else {
      setClientSecret('');
    }
  }, [amount]);

  return (
    <div>
      <label>
        Amount (USD):
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>
      {error && <div>{error}</div>}
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      ) : (
        <div>Please enter a valid amount above to proceed.</div>
      )}
    </div>
  );
}
