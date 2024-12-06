import { Box, Modal } from '@mui/material';
import { ReactElement } from 'react';
import { BillingPlanList } from './BillingPlanList';

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

interface BillingModalChangePlanProps {
  isOpen: boolean;
  defaultValue: string | null;
  handleClose: () => void;
  handleChoosePlan: (id: string) => void;
}

export const BillingModalChangePlan = (
  props: BillingModalChangePlanProps
): ReactElement => {
  const { isOpen, defaultValue, handleClose, handleChoosePlan } = props;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box sx={styleBgColor} className="bg-brand-500  h-1/2 w-full" />
        <BillingPlanList
          defaultValue={defaultValue}
          handleChoosePlan={(id) => handleChoosePlan(id)}
        />
      </Box>
    </Modal>
  );
};
