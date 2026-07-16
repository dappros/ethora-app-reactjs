import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Modal,
  TextField,
} from '@mui/material';
import { ReactElement } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from '../../../i18n/useTranslation';

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

export const BillingModalChangeInfo = ({
  isOpen,
  handleClose,
}: BillingInfoModalProps): ReactElement => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillingInfoFormInputs>();

  const onSubmit: SubmitHandler<BillingInfoFormInputs> = () => {
    handleClose();
  };

  const timezones = [
    t('billingModalChangeInfo.timezonePacific'),
    t('billingModalChangeInfo.timezoneMountain'),
    t('billingModalChangeInfo.timezoneCentral'),
    t('billingModalChangeInfo.timezoneEastern'),
  ];

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="billing-info-modal-title"
      aria-describedby="billing-info-modal-description"
    >
      <Box sx={style}>
        <h2 id="billing-info-modal-title" className="text-lg font-semibold p-6">
          {t('billingModalChangeInfo.title')}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6">
          <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            <TextField
              size="small"
              label={t('billingModalChangeInfo.addressLabel')}
              fullWidth
              {...register('address', {
                required: t('billingModalChangeInfo.addressRequired'),
              })}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
            <TextField
              size="small"
              label={t('billingModalChangeInfo.cityLabel')}
              fullWidth
              {...register('city', {
                required: t('billingModalChangeInfo.cityRequired'),
              })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
            <TextField
              size="small"
              label={t('billingModalChangeInfo.countryLabel')}
              fullWidth
              {...register('country', {
                required: t('billingModalChangeInfo.countryRequired'),
              })}
              error={!!errors.country}
              helperText={errors.country?.message}
            />
            <TextField
              size="small"
              label={t('billingModalChangeInfo.stateLabel')}
              fullWidth
              {...register('state', {
                required: t('billingModalChangeInfo.stateRequired'),
              })}
              error={!!errors.state}
              helperText={errors.state?.message}
            />
            <TextField
              size="small"
              label={t('billingModalChangeInfo.zipLabel')}
              fullWidth
              {...register('zipCode', {
                required: t('billingModalChangeInfo.zipRequired'),
              })}
              error={!!errors.zipCode}
              helperText={errors.zipCode?.message}
            />
          </Box>

          <FormControlLabel
            control={<Checkbox {...register('isCompany')} />}
            label={t('billingModalChangeInfo.companyCheckbox')}
          />

          <Box className="pb-2">
            <TextField
              size="small"
              label={t('billingModalChangeInfo.phoneLabel')}
              fullWidth
              {...register('phone')}
            />
          </Box>

          <Box className="md:w-1/2 pb-2">
            <TextField
              size="small"
              label={t('billingModalChangeInfo.timezoneLabel')}
              select
              fullWidth
              defaultValue={timezones[0]}
              {...register('timezone', {
                required: t('billingModalChangeInfo.timezoneRequired'),
              })}
              error={!!errors.timezone}
              helperText={errors.timezone?.message}
            >
              {timezones.map((timezone) => (
                <MenuItem key={timezone} value={timezone}>
                  {timezone}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2 py-8">
            <button
              onClick={handleClose}
              className="bg-white border border-brand-500  px-7 py-2 text-brand-500 text-sm rounded-lg"
            >
              {t('billingModalChangeInfo.cancel')}
            </button>
            <button className="bg-brand-500 px-7 py-2 text-white text-sm rounded-lg">
              {t('billingModalChangeInfo.saveChanges')}
            </button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};
