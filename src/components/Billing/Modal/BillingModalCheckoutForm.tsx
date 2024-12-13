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
import poweredStripe from '../../../assets/icons/PoweredStripe.svg';
import { useStripePayment } from '../../../hooks/useStripe';
import { IconArrowLeft } from '../../Icons/IconArrowLeft';

interface BillingModalProps {
  isOpen: boolean;
  handleClose: () => void;
}

export const BillingModalCheckoutForm = ({
  isOpen,
  handleClose,
}: BillingModalProps): React.ReactElement => {
  const stripe = useStripe();
  const elements = useElements();
  const { choosePlan, secretKey } = useStripePayment();

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
    showIcon: true,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage('Stripe.js has not loaded yet.');
      return;
    }

    await choosePlan();

    const cardElement = elements.getElement(CardNumberElement);

    if (secretKey && !secretKey.clientSecret) {
      setMessage('Warring.');
      return;
    }

    const { error } = await stripe.confirmCardPayment(secretKey.clientSecret, {
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
    window.location.reload();
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
            <div>
              <label className="block">Card Number</label>
              <div className="border border-gray-300 rounded-lg p-2 mt-2">
                <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <label className="block">
              Cardholder name
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              />
            </label>

            <div className="sm:flex gap-4">
              <div className="flex-1">
                <label className="block">Card expiry Date</label>
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

            <div className="terms-container">
              <label className="block text-sm">
                <input type="checkbox" className="mr-2" required />I have read &
                accept the{' '}
                <a
                  href="https://stripe.com/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-500 underline hover:text-brand-800"
                >
                  Terms of Service
                </a>
                .
              </label>
              <div className="flex items-center justify-between py-2">
                <p className="text-xs text-gray-600">
                  Payment transactions are secure and encrypted, and we don’t
                  store credit card details. All payments are processed by
                  Stripe. See Stripe’s{' '}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    privacy policy
                  </a>
                  .
                </p>
                <img
                  className="max-w-40 max-h-40"
                  src={poweredStripe}
                  alt="Stripe"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition duration-200"
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
