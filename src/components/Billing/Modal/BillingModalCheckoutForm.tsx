import { Button, Modal } from '@mui/material';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripeCardNumberElementOptions } from '@stripe/stripe-js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '../../Icons/IconArrowLeft';

interface BillingModalProps {
  isOpen: boolean;
  handleClose: () => void;
  clientSecret: string;
}

export const BillingModalCheckoutForm = ({
  isOpen,
  handleClose,
  clientSecret,
}: BillingModalProps): React.ReactElement => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const CARD_ELEMENT_OPTIONS: StripeCardNumberElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage('Stripe.js has not loaded yet.');
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement!,
        billing_details: {
          name,
        },
      },
    });

    if (error) {
      setMessage(error.message!);
      return;
    }

    setMessage('Payment successful!');
    navigate('/app/admin/billing');
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="relative"
    >
      <div className="bg-white flex flex-col justify-center items-center w-full h-full px-4">
        <div className="absolute top-2 left-2">
          <Button
            variant="text"
            startIcon={<IconArrowLeft stroke="black" />}
            className="px-12 py-1 text-black"
            sx={{ color: 'black' }}
            onClick={handleClose}
          >
            Go Back
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center max-w-lg w-full p-4 border rounded-lg shadow-lg">
          <h2 className="text-center pb-4 font-bold text-xl">Payment</h2>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <label className="block">
              Full name
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>

            <div>
              <label className="block">Card Number</label>
              <div className="border border-gray-300 rounded-lg p-2 mt-2">
                <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block">Expiration Date</label>
                <div className="border border-gray-300 rounded-lg p-2 mt-2">
                  <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>

              <div className="flex-1">
                <label className="block">CVC</label>
                <div className="border border-gray-300 rounded-lg p-2 mt-2">
                  <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition duration-200"
            >
              Submit Payment
            </button>

            {message && (
              <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 text-sm whitespace-pre-wrap">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </Modal>
  );
};
