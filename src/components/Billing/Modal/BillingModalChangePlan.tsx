import AddIcon from '@mui/icons-material/Add';
import { Box, Modal, Typography } from '@mui/material';
import classNames from 'classnames';
import { ReactElement, useState } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '85%',
  height: '67%',
  borderRadius: '25px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  px: 8,
  py: 0,
};

const styleBgColor = {
  position: 'absolute',
  top: '0',
  left: '50%',
  transform: 'translate(-50%)',
  width: '90%',
};

interface Plan {
  id: string;
  title: string;
  price: string;
  required: string;
  description?: string;
  icon?: boolean;
  features: string[];
}

interface BillingModalChangePlanProps {
  isOpen: boolean;
  handleClose: () => void;
}

export const BillingModalChangePlan = (
  props: BillingModalChangePlanProps
): ReactElement => {
  const { isOpen, handleClose } = props;

  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const plans: Plan[] = [
    {
      id: 'free',
      title: t('billingModalChangePlan.free.title'),
      required: t('billingModalChangePlan.free.required'),
      price: '0$',
      features: [
        t('billingModalChangePlan.free.feature1'),
        t('billingModalChangePlan.free.feature2'),
        t('billingModalChangePlan.free.feature3'),
        t('billingModalChangePlan.free.feature4'),
        t('billingModalChangePlan.free.feature5'),
      ],
    },
    {
      id: 'business',
      title: t('billingModalChangePlan.business.title'),
      required: t('billingModalChangePlan.business.required'),
      price: t('billingModalChangePlan.business.price'),
      description: t('billingModalChangePlan.everythingInFree'),
      icon: true,
      features: [
        t('billingModalChangePlan.everythingInFree'),
        t('billingModalChangePlan.business.feature2'),
        t('billingModalChangePlan.business.feature3'),
        t('billingModalChangePlan.business.feature4'),
        t('billingModalChangePlan.business.feature5'),
      ],
    },
    {
      id: 'enterprise',
      title: t('billingModalChangePlan.enterprise.title'),
      required: t('billingModalChangePlan.enterprise.required'),
      price: t('billingModalChangePlan.enterprise.price'),
      description: t('billingModalChangePlan.everythingInBusiness'),
      icon: true,
      features: [
        t('billingModalChangePlan.everythingInBusiness'),
        t('billingModalChangePlan.enterprise.feature2'),
        t('billingModalChangePlan.enterprise.feature3'),
        t('billingModalChangePlan.enterprise.feature4'),
        t('billingModalChangePlan.enterprise.feature5'),
      ],
    },
  ];

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box sx={styleBgColor} className="bg-brand-500  h-1/2 w-full" />
        <Box className="flex justify-center items-center gap-5 space-x-4 h-full">
          {plans.map((plan) => (
            <Box
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={classNames(
                'relative flex flex-col justify-between border rounded-xl',
                'w-1/3 h-5/6 cursor-pointer transition-all duration-300 bg-white',
                selectedPlan === plan.id ? 'scale-110' : ''
              )}
            >
              <Box className="px-4 pt-4">
                <span className="text-[8px]">{plan.required}</span>
                <Typography
                  variant="h4"
                  className={`font-bold ${
                    selectedPlan === plan.id
                      ? 'text-yellow-500'
                      : 'text-gray-800'
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
                    className={
                      'text-center mt-8 px-4 py-2 bg-white shadow-2xl text-brand-500 rounded-full font-semibold transition'
                    }
                  >
                    {t('billingModalChangePlan.choosePlan')}
                  </button>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};
