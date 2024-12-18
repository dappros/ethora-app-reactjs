import { BillingDetails } from '@stripe/stripe-js';
import { useCallback, useMemo } from 'react';
import { stripePromise } from '../../stripeConfig';
import {
  deleteStripePayment,
  getStripeConfig,
  getStripeInvoices,
  getStripeSubscription,
  postStripeCreateCustomer,
  postStripeSubscription,
  postStripeUpdateDetails,
} from '../http';
import { useAppStore } from '../store/useAppStore';

const getState = useAppStore.getState;

export const useStripePayment = () => {
  const state = getState();

  const publishableKey = useAppStore(
    (state) => state.stripe.config?.publishableKey || stripePromise
  );
  const prices = useAppStore((state) => state.stripe.config?.prices || []);
  const subscription = useAppStore((state) => state.stripe.subscription);
  const secretKey = useAppStore((state) => state.stripe.secretKey);
  const invoices = useAppStore((state) => state.stripe.invoices);
  const loading = useAppStore((state) => state.stripe.loading);

  const activeSubscription = useMemo(() => {
    return (
      subscription &&
      subscription.data.filter((sub) => sub.status === 'active')[0]
    );
  }, [subscription]);

  const getStripeConfigStore = useCallback(async () => {
    state.doSetStripeLoading(true);
    try {
      const response = await getStripeConfig();

      state.doSetStripeConfig(response.data);
      return state.doSetStripeLoading(false);
    } catch (error) {
      state.doSetStripeLoading(false);
      console.error(error);
    }
  }, [state]);

  const getStripeSubscriptionStore = useCallback(async () => {
    state.doSetStripeLoading(true);
    try {
      const responseSubscription = await getStripeSubscription();

      state.doSetStripeSubscription(responseSubscription.data.subscriptions);
      return state.doSetStripeLoading(false);
    } catch (error) {
      state.doSetStripeLoading(false);
      console.error(error);
    }
  }, [state]);

  const getStripeInvoicesStore = useCallback(
    async (subscriptionId?: string) => {
      try {
        const response = await getStripeInvoices(subscriptionId);

        state.doSetStripeInvoices(response.data.results);
      } catch (error) {
        console.error(error);
      }
    },
    [state]
  );

  const choosePlan = async () => {
    if (prices) {
      try {
        // await postStripeCreateCustomer('clock_1QU7WtCGz8uPG7vAW54Cb8Qg');
        await postStripeCreateCustomer();
        const response = await postStripeSubscription(prices[1].id);

        state.doSetStripeSecretKey(response.data.clientSecret);
        return response.data.clientSecret;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const updateDetails = useCallback(
    async (data: BillingDetails) => {
      if (!activeSubscription) {
        return;
      }

      try {
        const response = await postStripeUpdateDetails(
          activeSubscription.default_payment_method.id,
          data
        );

        console.log('postStripeUpdateDetails', response.data.results);
        return;
      } catch (error) {
        console.error(error);
      }
    },
    [activeSubscription]
  );

  const deleteSubscription = useCallback(async () => {
    if (activeSubscription.default_payment_method.id) {
      await deleteStripePayment(activeSubscription.default_payment_method.id);
    }
  }, [activeSubscription]);

  return {
    prices,
    loading,
    invoices,
    secretKey,
    choosePlan,
    subscription,
    updateDetails,
    publishableKey,
    activeSubscription,
    deleteSubscription,
    getStripeConfigStore,
    getStripeInvoicesStore,
    getStripeSubscriptionStore,
  };
};
