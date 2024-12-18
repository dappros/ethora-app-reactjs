import { Box, Modal, TextField } from '@mui/material';
import { BillingDetails } from '@stripe/stripe-js';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { ReactElement, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useStripePayment } from '../../../hooks/useStripe';
import { CountrySelect } from '../CountrySelect';

countries.registerLocale(enLocale);

const style = {
  position: 'absolute' as const,
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

interface BillingInfoModalProps {
  details?: BillingDetails;
  isOpen: boolean;
  handleClose: () => void;
}

export const BillingModalChangeInfo = ({
  details,
  isOpen,
  handleClose,
}: BillingInfoModalProps): ReactElement => {
  const { updateDetails } = useStripePayment();

  const defaultValues = useMemo(
    () => ({
      address: {
        city: details?.address.city || '',
        country: details?.address.country || '',
        line1: details?.address.line1 || '',
        state: details?.address.state || '',
        postal_code: details?.address.postal_code || '',
      },
      phone: details?.phone || '',
    }),
    [details]
  );

  const countryList = useMemo(() => {
    return Object.entries(countries.getNames('en')).map(([code, name]) => ({
      code,
      name,
    }));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<BillingDetails>({ defaultValues });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeEmptyFields = <T extends Record<string, any>>(obj: T): T => {
    return Object.entries(obj)
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== '' && value !== null && value !== undefined
      )
      .reduce((acc, [key, value]) => {
        acc[key as keyof T] =
          typeof value === 'object' && !Array.isArray(value)
            ? removeEmptyFields(value)
            : value;
        return acc;
      }, {} as T);
  };

  const onSubmit: SubmitHandler<BillingDetails> = (data) => {
    console.log('Form Data:', removeEmptyFields(data));
    updateDetails(removeEmptyFields(data));
    handleClose();
  };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

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
              {...register('address.line1')}
              error={!!errors.address?.line1}
              helperText={errors.address?.line1?.message}
            />
            <TextField
              size="small"
              label="City"
              fullWidth
              {...register('address.city')}
              error={!!errors.address?.city}
              helperText={errors.address?.city?.message}
            />
          </Box>

          <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
            <CountrySelect
              getValues={getValues}
              setValue={setValue}
              countryList={countryList}
            />

            <TextField
              size="small"
              label="State / Province / Region"
              fullWidth
              {...register('address.state')}
              error={!!errors.address?.state}
              helperText={errors.address?.state?.message}
            />
            <TextField
              size="small"
              label="Postal / Zip Code"
              fullWidth
              {...register('address.postal_code')}
              error={!!errors.address?.postal_code}
              helperText={errors.address?.postal_code?.message}
            />
          </Box>

          {/* <FormControlLabel
            control={<Checkbox {...register('isCompany')} />}
            label="I'm purchasing for a company"
          /> */}

          <Box className="pb-2">
            <TextField
              size="small"
              label="Phone (optional)"
              fullWidth
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Box>

          <Box className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2 py-8">
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
