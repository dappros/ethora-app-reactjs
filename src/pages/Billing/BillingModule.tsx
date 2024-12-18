import { Elements } from '@stripe/react-stripe-js';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { stripePromise } from '../../../stripeConfig';
import { Loading } from '../../components/Loading';
import { useStripePayment } from '../../hooks/useStripe';

const BillingModule = () => {
  const stripe = useStripePayment();

  useEffect(() => {
    stripe.getStripeConfigStore();
  }, []);

  useEffect(() => {
    stripe.getStripeSubscriptionStore();
  }, []);

  useEffect(() => {
    if (stripe.activeSubscription) {
      stripe.getStripeInvoicesStore(stripe.activeSubscription.id);
    }
  }, [stripe.activeSubscription]);

  if (stripe.loading) {
    return <Loading style="absolute" />;
  }

  return (
    <Elements stripe={stripePromise}>
      <Outlet />
    </Elements>
  );
};

export default BillingModule;
