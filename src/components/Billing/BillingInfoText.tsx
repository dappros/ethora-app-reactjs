import { BillingDetails } from '@stripe/stripe-js';
import { FC, Fragment } from 'react';

interface BillingInfoTextProps {
  billingDetails: BillingDetails;
}

export const BillingInfoText: FC<BillingInfoTextProps> = (props) => {
  const { billingDetails } = props;

  return (
    <Fragment>
      {billingDetails && (
        <span>
          Billing address: {billingDetails.address.line1 || ''}
          {billingDetails.address.city || ''}
          {billingDetails.address.country || ''}
          {billingDetails.address.postal_code || ''}
        </span>
      )}
    </Fragment>
  );
};
