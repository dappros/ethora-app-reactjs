import { Elements } from '@stripe/react-stripe-js';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { stripePromise } from '../../../stripeConfig';
import { useStripe } from '../../hooks/useStripe';

const BillingModule = () => {
  const stripe = useStripe();

  useEffect(() => {
    console.log('getStripeConfigStore');
    stripe.getStripeConfigStore();
  }, []);

  useEffect(() => {
    stripe.getStripeSubscriptionStore();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <Outlet />
    </Elements>
  );
};

export default BillingModule;
