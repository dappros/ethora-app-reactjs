import { Elements } from '@stripe/react-stripe-js';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { stripePromise } from '../../../stripeConfig';
import { Loading } from '../../components/Loading';
import { useStripePayment } from '../../hooks/useStripe';
import { getStripeAllCards } from '../../http';

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

  useEffect(() => {
    const getCards = async () => {
      const response = await getStripeAllCards();

      console.log('response>>>>>-', response);
    };

    getCards();
  }, []);

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
