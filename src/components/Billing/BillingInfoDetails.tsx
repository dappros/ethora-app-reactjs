import { Box } from '@mui/material';
import { BillingDetails } from '@stripe/stripe-js';
import { FC } from 'react';
import { BillingBoxContainer } from './BillingBoxContainer';
import { BillingInfoText } from './BillingInfoText';

interface BillingInfoDetailsProps {
  setOpenChangeInfo: () => void;
  name: string;
  billingDetails: BillingDetails;
}

export const BillingInfoDetails: FC<BillingInfoDetailsProps> = ({
  name,
  billingDetails,
  setOpenChangeInfo,
}) => {
  return (
    <BillingBoxContainer
      title="Billing Info"
      titleButton={
        <button
          onClick={setOpenChangeInfo}
          className="bg-brand-500 px-4 py-1 text-white text-xs rounded-lg"
        >
          Edit
        </button>
      }
    >
      <Box className="flex items-center justify-between">
        <Box>
          <p className="text-sm text-gray-600">
            Person/Company Name: <span className="font-medium">{name}</span>
          </p>
          <p className="text-sm text-gray-600">
            <BillingInfoText billingDetails={billingDetails} />
          </p>
        </Box>
      </Box>
    </BillingBoxContainer>
  );
};
