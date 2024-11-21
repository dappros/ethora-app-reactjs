import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Modal,
  TextField,
} from '@mui/material';
import { ReactElement } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  borderRadius: '15px',
  boxShadow: 24,
  pb: 0,
};

interface BillingInfoFormInputs {
  address: string;
  city: string;
  country: string;
  state: string;
  zipCode: string;
  isCompany: boolean;
  phone?: string;
  timezone: string;
}

interface BillingInfoModalProps {
  isOpen: boolean;
  handleClose: () => void;
}

const timezones = [
  'Pacific Time (PT)',
  'Mountain Time (MT)',
  'Central Time (CT)',
  'Eastern Time (ET)',
];

export const BillingModalChangeInfo = ({
  isOpen,
  handleClose,
}: BillingInfoModalProps): ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillingInfoFormInputs>();

  const onSubmit: SubmitHandler<BillingInfoFormInputs> = (data) => {
    console.log('Form Data:', data);
    handleClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="billing-info-modal-title"
      aria-describedby="billing-info-modal-description"
    >
      <Box sx={style}>
        <h2 id="billing-info-modal-title" className="text-lg font-semibold p-6">
          Billing Address
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6">
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            <TextField
              size="small"
              label="Address"
              fullWidth
              {...register('address', { required: 'Address is required' })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <TextField
              size="small"
              label="City"
              fullWidth
              {...register('city', { required: 'City is required' })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
            <TextField
              size="small"
              label="Country"
              fullWidth
              {...register('country', { required: 'Country is required' })}
              error={!!errors.country}
              helperText={errors.country?.message}
            />
            <TextField
              size="small"
              label="State / Province / Region"
              fullWidth
              {...register('state', {
                required: 'State/Province/Region is required',
              })}
              error={!!errors.state}
              helperText={errors.state?.message}
            />
            <TextField
              size="small"
              label="Postal / Zip Code"
              fullWidth
              {...register('zipCode', {
                required: 'Postal/Zip Code is required',
              })}
              error={!!errors.zipCode}
              helperText={errors.zipCode?.message}
            />
          </Box>

          <FormControlLabel
            control={<Checkbox {...register('isCompany')} />}
            label="I'm purchasing for a company"
          />

          <Box className="pb-2">
            <TextField
              size="small"
              label="Phone (optional)"
              fullWidth
              {...register('phone')}
            />
          </Box>

          <Box className="md:w-1/2 pb-2">
            <TextField
              size="small"
              label="Timezone"
              select
              fullWidth
              defaultValue={timezones[0]}
              {...register('timezone', { required: 'Timezone is required' })}
              error={!!errors.timezone}
              helperText={errors.timezone?.message}
              className="focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500"
            >
              {timezones.map((timezone) => (
                <MenuItem key={timezone} value={timezone}>
                  {timezone}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 py-8">
            <button
              onClick={handleClose}
              className="bg-white border border-brand-500  px-7 py-2 text-brand-500 text-sm rounded-lg"
            >
              Cancel
            </button>
            <button className="bg-brand-500 px-7 py-2 text-white text-sm rounded-lg">
              Save changes
            </button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};
