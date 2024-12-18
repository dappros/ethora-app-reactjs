import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { BillingDetails } from '@stripe/stripe-js';
import { FC } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import Flag from 'react-world-flags';

interface CountrySelectType {
  countryList: {
    code: string;
    name: string;
  }[];
  getValues: UseFormGetValues<BillingDetails>;
  setValue: UseFormSetValue<BillingDetails>;
}

export const CountrySelect: FC<CountrySelectType> = ({
  countryList,
  getValues,
  setValue,
}) => {
  return (
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
          <Box>None</Box>
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
  );
};
