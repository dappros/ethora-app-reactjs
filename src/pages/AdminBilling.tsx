import { Box, Stack, Typography } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { useState } from 'react';

import { stripePromise } from '../../stripeConfig';

import { Appearance } from '@stripe/stripe-js';
import { BillingBoxContainer } from '../components/Billing/BillingBoxContainer';
import { BillingHistoryTable } from '../components/Billing/BillingHistoryTable';
import { BillingModalChangeInfo } from '../components/Billing/Modal/BillingModalChangeInfo';
import { BillingModalChangePlan } from '../components/Billing/Modal/BillingModalChangePlan';
import { BillingModalCheckoutForm } from '../components/Billing/Modal/BillingModalCheckoutForm';

export const AdminBilling = () => {
  const [billingInfo, setBillingInfo] = useState({
    plan: 'Business Plan',
    price: '$199/month',
    card: '**** 4212',
    address: '519 S Lincoln Street, Carmichael, Texas - 20423, Japan',
    history: [
      {
        date: '21 July 2024',
        amount: '$199.00',
        status: 'Paid',
        invoice: 'Download',
      },
      {
        date: '21 June 2024',
        amount: '$199.00',
        status: 'Paid',
        invoice: 'Download',
      },
      {
        date: '21 May 2024',
        amount: '$199.00',
        status: 'Paid',
        invoice: 'Download',
      },
    ],
  });
  const [openChangePlan, setOpenChangePlan] = useState<boolean>(false);
  const [openChangeInfo, setOpenChangeInfo] = useState<boolean>(false);
  const [openCheckoutForm, setOpenCheckoutForm] = useState<boolean>(false);

  const [clientSecret, setClientSecret] = useState('');
  const [dpmCheckerLink, setDpmCheckerLink] = useState('');

  // useEffect(() => {
  //   // Create PaymentIntent as soon as the page loads
  //   fetch("/create-payment-intent", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ items: [{ id: "xl-tshirt", amount: 1000 }] }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setClientSecret(data.clientSecret);
  //       // [DEV] For demo purposes only
  //       setDpmCheckerLink(data.dpmCheckerLink);
  //     });
  // }, []);

  const appearance: Appearance = {
    theme: 'stripe',
  };
  // Enable the skeleton loader UI for optimal loading.
  const loader = 'auto';

  return (
    <Elements stripe={stripePromise}>
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
                  <p className="text-lg font-bold">Business Plan</p>
                  <p className="text-sm text-gray-500">$199 / month</p>
                </Box>
                <Typography
                  variant="caption"
                  className="text-xs text-white bg-green-500 px-4 py-1 rounded-full"
                >
                  Active
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
                <p className="text-sm text-gray-600">Ending with 4212</p>
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
            </button>}
        >
          <Box className="flex items-center justify-between">
            <Box>
              <p className="text-sm text-gray-600">
                Person/Company Name:{' '}
                <span className="font-medium">John Doe</span>
              </p>
              <p className="text-sm text-gray-600">
                Billing address: 519 S Lincoln Street, Carmichael, Texas -
                20423, Japan
              </p>
            </Box>
          </Box>
        </BillingBoxContainer>

        <Box className="mt-6 p-4 border rounded-lg shadow bg-white">
          <h2 className="text-lg font-semibold mb-4">History</h2>
          <BillingHistoryTable history={billingInfo.history} />
        </Box>
      </Stack>

      <BillingModalChangePlan
        isOpen={openChangePlan}
        handleClose={() => setOpenChangePlan(false)}
      />
      <BillingModalChangeInfo
        isOpen={openChangeInfo}
        handleClose={() => setOpenChangeInfo(false)}
      />
      <BillingModalCheckoutForm
        isOpen={openCheckoutForm}
        handleClose={() => setOpenCheckoutForm(false)}
      />
    </Elements>
  );
};
