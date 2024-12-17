import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from '@mui/material';
import { BillingDetails } from '@stripe/stripe-js';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { ReactElement, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Flag from 'react-world-flags';
import { useStripePayment } from '../../../hooks/useStripe';

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
        // isCompany: false,
        // timezone: timezones[0],
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

  const onSubmit: SubmitHandler<BillingDetails> = (data) => {
    console.log('Form Data:', data);
    updateDetails(data);
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
            {/* <TextField
              size="small"
              label="Country"
              fullWidth
              {...register('address.country')}
              error={!!errors.address?.country}
              helperText={errors.address?.country?.message}
            /> */}
            <FormControl fullWidth size="small">
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select
                size="small"
                label="Country"
                labelId="country-select-label"
                id="country-select"
                value={getValues('address.country') || ''}
                onChange={(e) => {
                  setValue('address.country', e.target.value, {
                    shouldValidate: true,
                  });
                }}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      maxWidth: 'inherit',
                      borderRadius: 10,
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {countryList.map((country) => (
                  <MenuItem
                    key={country.code}
                    value={country.code}
                    sx={{
                      display: 'flex',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Flag
                        code={country.code}
                        style={{ width: 24, height: 16, marginRight: 8 }}
                      />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {country.name}
                      </span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

          {/* <Box className="md:w-1/2 pb-2">
            <TextField
              size="small"
              label="Timezone"
              select
              fullWidth
              defaultValue={timezones[0]}
              {...register('timezone')}
              error={!!errors.timezone}
              helperText={errors.timezone?.message}
            >
              {timezones.map((timezone) => (
                <MenuItem key={timezone} value={timezone}>
                  {timezone}
                </MenuItem>
              ))}
            </TextField>
          </Box> */}

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
