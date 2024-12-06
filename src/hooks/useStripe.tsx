import { useCallback } from 'react';
import { stripePromise } from '../../stripeConfig';
import {
  getStripeConfig,
  getStripeSubscription,
  postStripeCreateCustomer,
  postStripeSubscription,
} from '../http';
import { useAppStore } from '../store/useAppStore';

const getState = useAppStore.getState;

export const useStripe = () => {
  const state = getState();

  const publishableKey = useAppStore(
    (state) => state.stripe.config?.publishableKey || stripePromise
  );
  const prices = useAppStore((state) => state.stripe.config?.prices || []);
  const subscription = useAppStore((state) => state.stripe.subscription);

  const getStripeConfigStore = useCallback(async () => {
    try {
      const response = await getStripeConfig();

      return state.doSetStripeConfig(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [state]);

  const getStripeSubscriptionStore = useCallback(async () => {
    try {
      const responseSubscription = await getStripeSubscription();

      return state.doSetStripeSubscription(
        responseSubscription.data.subscriptions
      );
    } catch (error) {
      console.error(error);
    }
  }, [state]);

  const choosePlan = async (id: string) => {
    if (id === 'business' && prices) {
      try {
        await postStripeCreateCustomer();
        const response = await postStripeSubscription(prices[1].id);

        state.doSetStripeSecretKey(response.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return {
    prices,
    subscription,
    publishableKey,
    getStripeConfigStore,
    getStripeSubscriptionStore,
    choosePlan,
  };
};
