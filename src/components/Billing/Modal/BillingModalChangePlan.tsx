import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Modal, Typography } from '@mui/material';
import classNames from 'classnames';
import { ReactElement, useEffect, useMemo, useState } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '92%', md: '88%', lg: '80%' },
  maxWidth: '1100px',
  maxHeight: '92vh',
  borderRadius: '20px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  px: { xs: 2, sm: 3, md: 4 },
  py: { xs: 2, sm: 2.5, md: 3 },
  overflowY: 'auto',
};

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  monthlyPrice?: number;
  customPriceLabel?: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'free',
    title: 'Free Plan',
    subtitle: 'Enough for your MVP',
    monthlyPrice: 0,
    features: [
      'Users and SSO',
      'Wallets (profile + assets)',
      'Messaging (fair use)',
      'Storage (10 GB)',
      'Community support',
    ],
  },
  {
    id: 'business',
    title: 'Business Plan',
    subtitle: 'Powering SMEs',
    monthlyPrice: 199,
    features: [
      'Everything in Free',
      'Integrations',
      'Compliance basics',
      'High load allowance',
      'Business Cloud SLA',
      'Storage (1 TB)',
      'Technical support',
    ],
  },
  {
    id: 'enterprise',
    title: 'Enterprise Plan',
    subtitle: 'Custom and larger needs',
    customPriceLabel: 'Custom',
    features: [
      'Everything in Business',
      'Dedicated / On-prem hosting',
      'Compliance advanced',
      'Custom configuration',
      'Priority SLA',
      'Storage (Unlimited)',
      '24/7 technical support',
    ],
  },
];

interface BillingModalChangePlanProps {
  isOpen: boolean;
  handleClose: () => void;
  currentPlanId?: string;
}

export const BillingModalChangePlan = (
  props: BillingModalChangePlanProps
): ReactElement => {
  const { isOpen, handleClose, currentPlanId } = props;

  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const DISCOUNT_PERCENT = 15;

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const normalizedCurrentPlan = useMemo(() => {
    const value = String(currentPlanId || '').toLowerCase();
    if (value.includes('enterprise')) return 'enterprise';
    if (value.includes('business') || value.includes('pro')) return 'business';
    return 'free';
  }, [currentPlanId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(normalizedCurrentPlan);
    }
  }, [isOpen, normalizedCurrentPlan]);

  const getPlanPrice = (plan: Plan): string => {
    if (typeof plan.monthlyPrice !== 'number') {
      return plan.customPriceLabel || '';
    }

    if (!isYearly) {
      return `$${plan.monthlyPrice}`;
    }

    const discounted = Math.round(plan.monthlyPrice * (1 - DISCOUNT_PERCENT / 100));
    return `$${discounted}`;
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Typography className="font-varela text-[20px] sm:text-[24px] text-[#141414]">
              Choose a plan that suits for your business
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[13px]">
              <span
                className={classNames(
                  'font-semibold transition-colors',
                  !isYearly ? 'text-[#141414]' : 'text-[#9aa5b1]'
                )}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setIsYearly((prev) => !prev)}
                className={classNames(
                  'relative h-5 w-9 rounded-full p-[2px] transition-colors',
                  isYearly ? 'bg-[#0367f5]' : 'bg-[#c7d6ef]'
                )}
                aria-label="Billing cycle"
              >
                <span
                  className={classNames(
                    'absolute top-[2px] h-4 w-4 rounded-full bg-white transition-all',
                    isYearly ? 'right-[2px]' : 'left-[2px]'
                  )}
                />
              </button>
              <span
                className={classNames(
                  'font-semibold transition-colors',
                  isYearly ? 'text-[#141414]' : 'text-[#9aa5b1]'
                )}
              >
                Yearly
              </span>
              <span className="rounded-full bg-[#fff2d8] px-2 py-[2px] text-[10px] font-semibold text-[#f59e0b]">
                {DISCOUNT_PERCENT}% OFF
              </span>
            </div>
            <IconButton onClick={handleClose} size="small" aria-label="Close">
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        <Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === normalizedCurrentPlan;
            const buttonLabel = isCurrentPlan
              ? 'Current Plan'
              : plan.id === 'enterprise'
                ? 'Contact Us'
                : 'Change Plan';
            const isNumericPrice = typeof plan.monthlyPrice === 'number';

            return (
            <Box
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={classNames(
                'relative flex flex-col border rounded-xl p-4',
                'cursor-pointer transition-all duration-200 bg-white min-h-[350px]',
                selectedPlan === plan.id
                  ? 'border-[#0367f5] shadow-[0_0_0_1px_#0367f5]'
                  : 'border-[#e9eef5]'
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Typography className="font-varela text-[20px] leading-none text-[#141414]">
                    {plan.title}
                  </Typography>
                  <Typography className="mt-1 text-[11px] text-[#7b8794]">
                    {plan.subtitle}
                  </Typography>
                </div>
                {isCurrentPlan && (
                  <span className="shrink-0 rounded-full bg-[#e8f8ef] px-2 py-[2px] text-[10px] font-semibold text-[#18a957]">
                    Active
                  </span>
                )}
              </div>

              <button
                type="button"
                className={classNames(
                  'mt-1 h-8 rounded-md text-[13px] font-semibold transition',
                  isCurrentPlan
                    ? 'border border-[#a9c9f6] text-[#235aa5] bg-white'
                    : 'bg-[#0367f5] text-white hover:bg-[#0258d4]'
                )}
              >
                {buttonLabel}
              </button>

              <div className="mt-4 mb-3 flex items-end gap-2">
                <Typography
                  sx={{ fontSize: '32px', lineHeight: 1 }}
                  className="font-varela text-[#141414]"
                >
                  {getPlanPrice(plan)}
                </Typography>
                {isNumericPrice && (
                  <Typography
                    sx={{ fontSize: '18px', lineHeight: 1 }}
                    className="text-[#7b8794] mb-[8px]"
                  >
                    {isYearly ? 'per month (yearly billing)' : 'per month'}
                  </Typography>
                )}
              </div>

              <ul className="mt-2 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircleIcon
                      className="mt-[2px] text-[#0367f5]"
                      sx={{ fontSize: 14 }}
                    />
                    <span className="text-[12px] text-[#2f3a46]">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto" />

              {selectedPlan === plan.id && (
                <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#0367f5]" />
              )}
            </Box>
            );
          })}
        </Box>
      </Box>
    </Modal>
  );
};
