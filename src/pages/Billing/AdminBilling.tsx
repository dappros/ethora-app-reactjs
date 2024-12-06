import { Box, Stack, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { BillingBoxContainer } from '../../components/Billing/BillingBoxContainer';
import { BillingHistoryTable } from '../../components/Billing/BillingHistoryTable';
import { BillingInfoText } from '../../components/Billing/BillingInfoText';
import { BillingModalChangeInfo } from '../../components/Billing/Modal/BillingModalChangeInfo';
import { BillingModalChangePlan } from '../../components/Billing/Modal/BillingModalChangePlan';
import { BillingModalCheckoutForm } from '../../components/Billing/Modal/BillingModalCheckoutForm';
import { BillingPlanList } from '../../components/Billing/Modal/BillingPlanList';
import { getCurrencySymbol } from '../../constants/currency';
import { useStripe } from '../../hooks/useStripe';
import { postStripeCreateCustomer, postStripeSubscription } from '../../http';
import { useAppStore } from '../../store/useAppStore';

export function AdminBilling() {
  const stripe = useStripe();
  const user = useAppStore((s) => s.currentUser);
  const [openChangePlan, setOpenChangePlan] = useState<boolean>(false);
  const [openChangeInfo, setOpenChangeInfo] = useState<boolean>(false);
  const [openCheckoutForm, setOpenCheckoutForm] = useState<boolean>(false);
  const [secretKey, setSecretKey] = useState<Record<string, string>>({});

  const handleChoosePlan = async (id: string) => {
    if (id === 'business' && stripe.prices) {
      try {
        await postStripeCreateCustomer();
        const response = await postStripeSubscription(stripe.prices[1].id);

        setSecretKey(response.data);
        setOpenCheckoutForm(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const activeSubscription = useMemo(() => {
    return (
      stripe.subscription &&
      stripe.subscription.data &&
      stripe.subscription.data.filter((sub) => sub.status === 'active')[0]
    );
  }, [stripe.subscription]);

  const activePrice = useMemo(() => {
    return (
      stripe.subscription &&
      stripe.subscription.data &&
      stripe.prices &&
      activeSubscription &&
      stripe.prices.filter(
        (price) => price.id === activeSubscription.plan.id
      )[0]
    );
  }, [stripe.subscription, stripe.prices, activeSubscription]);

  console.log('activeSubscription', activeSubscription);
  console.log('activePrice', activePrice);
  console.log('subscription', stripe.subscription);
  console.log('prices', stripe.prices);
  console.log('secretKey', secretKey);

  useEffect(() => {
    const getSecretKey = async () => {
      if (stripe.prices) {
        try {
          await postStripeCreateCustomer();
          const response = await postStripeSubscription(stripe.prices[1].id);

          setSecretKey(response.data);
        } catch (error) {
          console.error(error);
        }
      }
    };

    getSecretKey();
  }, [stripe.prices]);

  return (
    <>
      {user && !activeSubscription ? (
        <Box className="flex items-center justify-center h-full">
          <BillingPlanList
            defaultValue={user.signupPlan}
            handleChoosePlan={handleChoosePlan}
          />
        </Box>
      ) : (
        <>
          <Stack
            spacing={2}
            className="container mx-auto p-6 w-full overflow-hidden"
          >
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BillingBoxContainer title="Plan Details">
                <Box className="sm:flex items-end justify-between">
                  <Box className="flex items-center gap-2 pb-4 sm:pb-0">
                    <Box>
                      <p className="text-sm text-gray-800">Current Plan</p>
                      <p className="text-lg font-bold">
                        {activePrice.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getCurrencySymbol(activePrice.currency)}
                        {activePrice.unit_amount / 100} /{' '}
                        {activePrice.recurring.interval}
                      </p>
                    </Box>
                    <Typography
                      variant="caption"
                      className={classNames(
                        'text-xs text-white px-4 py-1 rounded-full',
                        activeSubscription.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      )}
                    >
                      {activeSubscription.status}
                    </Typography>
                  </Box>
                  <button
                    className="bg-brand-500 px-7 py-2 text-white text-xs rounded-lg"
                    onClick={() => setOpenChangePlan(true)}
                  >
                    Change plan
                  </button>
                </Box>
              </BillingBoxContainer>

              <BillingBoxContainer title="Payment Method">
                <Box className="sm:flex items-center justify-between">
                  <Box className="flex items-center pb-4 sm:pb-0">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                      alt="Visa"
                      className="h-6 mr-3"
                    />
                    <p className="text-sm text-gray-600">
                      Ending with{' '}
                      {activeSubscription.default_payment_method.card.last4}
                    </p>
                  </Box>
                  <button
                    className="bg-brand-500 px-6 py-2 text-white text-xs rounded-lg"
                    onClick={() => setOpenCheckoutForm(true)}
                  >
                    Update card details
                  </button>
                </Box>
              </BillingBoxContainer>
            </Box>

            <BillingBoxContainer
              title="Billing Info"
              titleButton={
                <button
                  onClick={() => setOpenChangeInfo(true)}
                  className="bg-brand-500 px-4 py-1 text-white text-xs rounded-lg"
                >
                  Edit
                </button>
              }
            >
              <Box className="flex items-center justify-between">
                <Box>
                  <p className="text-sm text-gray-600">
                    Person/Company Name:{' '}
                    <span className="font-medium">
                      {
                        activeSubscription.default_payment_method
                          .billing_details.name
                      }
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <BillingInfoText
                      billingDetails={
                        activeSubscription.default_payment_method
                          .billing_details
                      }
                    />
                  </p>
                </Box>
              </Box>
            </BillingBoxContainer>

            <Box className="mt-6 p-4 border rounded-lg shadow bg-white">
              <h2 className="text-lg font-semibold mb-4">History</h2>
              <BillingHistoryTable
                history={stripe.subscription.data || null}
                secretKey={secretKey.clientSecret}
              />
            </Box>
          </Stack>
        </>
      )}

      <BillingModalChangePlan
        defaultValue={user && user.signupPlan}
        handleChoosePlan={handleChoosePlan}
        isOpen={openChangePlan}
        handleClose={() => setOpenChangePlan(false)}
      />
      <BillingModalChangeInfo
        details={
          activeSubscription &&
          activeSubscription.default_payment_method.billing_details
        }
        isOpen={openChangeInfo}
        handleClose={() => setOpenChangeInfo(false)}
      />
      <BillingModalCheckoutForm
        clientSecret={secretKey.clientSecret}
        isOpen={openCheckoutForm}
        handleClose={() => setOpenCheckoutForm(false)}
      />
    </>
  );
}
