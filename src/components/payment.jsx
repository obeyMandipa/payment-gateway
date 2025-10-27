import React, { useState } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePRomise = loadStripe('your publishable key here');

function CheckoutForm() {
    // functional components that handle a basic payment form
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);

    //handles form submission and calls the back end 
    const handleSubmit = async (e) => {
        try{
            setError(null);
            
            //send post request to backend with payment details
            const response = await axios.post('http://localhost:5000/api/payment', {
                amount,
                reference,
                email
            });
            // set the payment url returned from the backend
            setPaymentUrl(response.data.paymentUrl);

            //if payment url is returned redirect user to it 
            if (response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            }
        }catch (err) {
            //set error message if api request fails
            setError('Payment initiation failed. Please try again.');
        }
    }

    return (
            <div className="p-4">
                <h2>PayNow Payment</h2>
                <input
                    placeholder="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <input
                    placeholder="Reference (Order ID)"
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                />
                <input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handlePayment}>Pay Now</button>
                {error && <p style={{color: 'red'}}>{error}</p>}            
            </div>
        );
}
export default Payment;
