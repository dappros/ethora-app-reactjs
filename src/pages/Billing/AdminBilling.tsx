import { Box, Stack, Typography } from '@mui/material';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { BillingBoxContainer } from '../../components/Billing/BillingBoxContainer';
import { BillingHistoryTable } from '../../components/Billing/BillingHistoryTable';
import { BillingInfoText } from '../../components/Billing/BillingInfoText';
import { BillingModalChangeInfo } from '../../components/Billing/Modal/BillingModalChangeInfo';
import { BillingModalChangePlan } from '../../components/Billing/Modal/BillingModalChangePlan';
import { BillingModalCheckoutForm } from '../../components/Billing/Modal/BillingModalCheckoutForm';
import { BillingPlanList } from '../../components/Billing/Modal/BillingPlanList';
import { getCurrencySymbol } from '../../constants/currency';
import { useStripePayment } from '../../hooks/useStripe';
import { useAppStore } from '../../store/useAppStore';

export function AdminBilling() {
  const stripe = useStripePayment();
  const user = useAppStore((s) => s.currentUser);
  const [openChangePlan, setOpenChangePlan] = useState<boolean>(false);
  const [openChangeInfo, setOpenChangeInfo] = useState<boolean>(false);
  const [openCheckoutForm, setOpenCheckoutForm] = useState<boolean>(false);

  const handleChoosePlan = (id: string) => {
    if (id === 'business_monthly' || id === 'business_annual') {
      setOpenCheckoutForm(true);
    }

    if (id === 'free') {
      stripe.deleteSubscription();
    }
  };

  const activePrice = useMemo(() => {
    return (
      stripe.subscription &&
      stripe.subscription.data &&
      stripe.prices &&
      stripe.activeSubscription &&
      stripe.prices.filter(
        (price) => price.id === stripe.activeSubscription.plan.id
      )[0]
    );
  }, [stripe.subscription, stripe.prices, stripe.activeSubscription]);

  // console.log('subscription----<>----', stripe.subscription);
  console.log('activeSubscription', stripe.activeSubscription);
  // console.log('prices________', stripe.prices);
  // console.log('invoices!!!!', stripe.invoices);
  // console.log('user', user);
  // console.log('STRIPE>>>>>>>---', stripe.secretKey);

  return (
    <>
      {user && !stripe.activeSubscription ? (
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
            {/* <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
            <BillingBoxContainer title="Plan Details">
              <Box className="sm:flex items-end justify-between">
                <Box className="flex items-center gap-2 pb-4 sm:pb-0">
                  {activePrice && (
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
                  )}
                  <Typography
                    variant="caption"
                    className={classNames(
                      'text-xs text-white px-4 py-1 rounded-full',
                      stripe.activeSubscription.status === 'active'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    )}
                  >
                    {stripe.activeSubscription.status}
                  </Typography>
                </Box>
                <button
                  className="bg-brand-500 px-5 xl:px-7 py-2 text-white text-xs rounded-lg"
                  onClick={() => setOpenChangePlan(true)}
                >
                  Change plan
                </button>
              </Box>
            </BillingBoxContainer>

            {/* <BillingBoxContainer title="Payment Method">
                <Box className="sm:flex items-center justify-between">
                  <Box className="flex items-center pb-4 sm:pb-0">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                      alt="Visa"
                      className="h-6 mr-3"
                    />
                    {stripe.activeSubscription.default_payment_method?.card && (
                      <p className="text-sm text-gray-600">
                        Ending with{' '}
                        {
                          stripe.activeSubscription.default_payment_method.card
                            .last4
                        }
                      </p>
                    )}
                  </Box>
                  <button
                    className="bg-brand-500 px-6 py-2 text-white text-xs rounded-lg"
                    onClick={() => setOpenCheckoutForm(true)}
                  >
                    Update card details
                  </button>
                </Box>
              </BillingBoxContainer> */}
            {/* </Box> */}

            {stripe.activeSubscription.default_payment_method && (
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
                          stripe.activeSubscription.default_payment_method
                            ?.billing_details.name
                        }
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <BillingInfoText
                        billingDetails={
                          stripe.activeSubscription.default_payment_method
                            ?.billing_details
                        }
                      />
                    </p>
                  </Box>
                </Box>
              </BillingBoxContainer>
            )}

            <Box className="mt-6 p-4 border rounded-lg shadow bg-white">
              <h2 className="text-lg font-semibold mb-4">History</h2>
              <BillingHistoryTable history={stripe.invoices || null} />
            </Box>
          </Stack>
        </>
      )}

      <BillingModalChangePlan
        defaultValue={activePrice && activePrice.lookup_key}
        handleChoosePlan={handleChoosePlan}
        isOpen={openChangePlan}
        handleClose={() => setOpenChangePlan(false)}
      />
      <BillingModalChangeInfo
        details={
          stripe.activeSubscription &&
          stripe.activeSubscription.default_payment_method?.billing_details
        }
        isOpen={openChangeInfo}
        handleClose={() => setOpenChangeInfo(false)}
      />
      <BillingModalCheckoutForm
        isOpen={openCheckoutForm}
        handleClose={() => setOpenCheckoutForm(false)}
      />
    </>
  );
}
