import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Box, Button, Stack, Typography } from "@mui/material";

import { stripePromise } from "../../stripeConfig";

import { BillingBoxContainer } from "../components/Billing/BillingBoxContainer";
import { BillingHistoryTable } from "../components/Billing/BillingHistoryTable";
import { BillingModalChangePlan } from "../components/Billing/BillingModalChangePlan";


export const AdminBilling = () => {
  const [billingInfo, setBillingInfo] = useState({
    plan: "Business Plan",
    price: "$199/month",
    card: "**** 4212",
    address: "519 S Lincoln Street, Carmichael, Texas - 20423, Japan",
    history: [
      { date: "21 July 2024", amount: "$199.00", status: "Paid", invoice: "Download" },
      { date: "21 June 2024", amount: "$199.00", status: "Paid", invoice: "Download" },
      { date: "21 May 2024", amount: "$199.00", status: "Paid", invoice: "Download" },
    ],
  });
  const [openChangePlan, setOpenChangePlan] = useState<boolean>(false);

  const handlePlanChange = () => {
    alert("Redirect to plan change page");
  };

  const handleCardUpdate = () => {
    alert("Redirect to card update page");
  };

  const handleEditInfo = () => {
    alert("Edit billing info");
  };

  return (
    <Elements stripe={stripePromise}>
      <Stack spacing={2} className="container mx-auto p-6">
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
                </Typography >
              </Box>
              <Button
                size="small"
                variant="contained"
                className="bg-brand-500 w-32"
                onClick={() => setOpenChangePlan(true)}
              >
                Change plan
              </Button>
            </Box>
          </BillingBoxContainer>

          <BillingBoxContainer title="Payment Method">
            <Box className="sm:flex items-end justify-between">
              <Box className="flex items-center pb-4 sm:pb-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                  alt="Visa"
                  className="h-6 mr-3"
                />
                <p className="text-sm text-gray-600">Ending with 4212</p>
              </Box>
              <Button
                size="small"
                variant="contained"
                className="bg-brand-500 w-52"
                onClick={handleCardUpdate}
              >
                Update card details
              </Button>
            </Box>
          </BillingBoxContainer>
        </Box>

        <BillingBoxContainer
          title="Billing Info"
          titleButton={<Button
            size="small"
            variant="contained"
            className="bg-brand-500 w-16"
           >
             Edit
           </Button>}
        >
        <Box className="flex items-center justify-between">
            <Box>
              <p className="text-sm text-gray-600">
                Person/Company Name: <span className="font-medium">John Doe</span>
              </p>
              <p className="text-sm text-gray-600">
                Billing address: 519 S Lincoln Street, Carmichael, Texas - 20423,
                Japan
              </p>
            </Box>
          </Box>
        </BillingBoxContainer>


        <Box className="mt-6 p-6 border rounded-lg shadow bg-white">
          <h2 className="text-lg font-semibold mb-4">History</h2>
          <BillingHistoryTable history={billingInfo.history}/> 
        </Box>
      </Stack>

      <BillingModalChangePlan isOpen={openChangePlan} handleClose={() => setOpenChangePlan(false)}/>
    </Elements>
  );
}
