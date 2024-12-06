import AddIcon from '@mui/icons-material/Add';
import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import { FC, useState } from 'react';

interface Plan {
  id: string;
  title: string;
  price: string;
  required: string;
  description?: string;
  icon?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'free',
    title: 'Free',
    required: '* Enough for you MVP',
    price: '0$',
    features: [
      'Custom level 2 domain (web3)',
      'Web3, Chat and Push Notifications',
      'Full API and IPFS (fair use policy)',
    ],
  },
  {
    id: 'business',
    title: 'Business',
    required: '* Powering SMEs',
    price: '199$ / month',
    description: 'Everything in Free',
    icon: true,
    features: [
      'Everything in Free',
      'Custom primary domain (web3)',
      'Advanced L1, L2, IPFS options',
      'High API and RPC performance',
      'Business Cloud SLA',
    ],
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    required: '* Custom and larger needs',
    price: 'Custom',
    description: 'Everything in Business',
    icon: true,
    features: [
      'Everything in Business',
      'Dedicated / On-prem hosting',
      'Enterprise custom configuration',
      '24/7 phone support',
      'Enterprise-grade SLA',
    ],
  },
];

interface BillingPlanListProps {
  defaultValue: string | null;
  handleChoosePlan: (id: string) => void;
}

export const BillingPlanList: FC<BillingPlanListProps> = (props) => {
  const { defaultValue, handleChoosePlan } = props;
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultValue || '');

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <>
      <Box className="flex flex-col p-5 md:flex-row justify-center items-center gap-5 md:space-x-4 h-full w-full">
        {plans.map((plan) => (
          <Box
            key={plan.id}
            onClick={() => handleSelectPlan(plan.id)}
            className={classNames(
              'relative flex flex-col justify-between border rounded-xl',
              'w-full md:w-1/3 h-5/6 cursor-pointer transition-all duration-300 bg-white',
              selectedPlan === plan.id ? 'scale-105 md:scale-110' : ''
            )}
          >
            <Box className="px-4 pt-4">
              <span className="text-[8px]">{plan.required}</span>
              <Typography
                variant="h4"
                className={`font-bold ${
                  selectedPlan === plan.id ? 'text-yellow-500' : 'text-gray-800'
                }`}
              >
                {plan.title}
              </Typography>
              <p className="text-xl font-semibold mt-2">{plan.price}</p>
            </Box>

            <Box
              className={classNames(
                'pb-4 px-4 rounded-b-xl rounded-t-3xl pt-4',
                selectedPlan === plan.id ? 'bg-yellow-800' : 'bg-brand-250'
              )}
            >
              <Box className="pl-4">
                {plan.description && (
                  <Typography>{plan.description}</Typography>
                )}
                {plan.icon && <AddIcon fontSize="small" />}
              </Box>
              <ul className=" space-y-1 list-disc pl-4">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className=" text-sm text-gray-900 font-bold py-1"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
              <Box className=" flex justify-center items-center">
                <button
                  onClick={() => handleChoosePlan(plan.id)}
                  className={
                    'text-center mt-8 px-4 py-2 bg-white shadow-2xl text-brand-500 rounded-full font-semibold transition'
                  }
                >
                  Choose plan
                </button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};
