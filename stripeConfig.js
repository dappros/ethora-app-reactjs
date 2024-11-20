  import { loadStripe } from "@stripe/stripe-js";

  /** @type {Promise<import('@stripe/stripe-js').Stripe | null>} */
  export const stripePromise = loadStripe("pk_test_iTgKAZ1WZinSX7NI1UTveLVu");
