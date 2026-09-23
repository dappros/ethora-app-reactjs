import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

type CustomInputProps = Omit<TextFieldProps, 'variant'>;

// @ts-expect-error: the styled() callback receives a custom `config` prop that TextFieldProps does not declare
const StyledTextField = styled(TextField)(({ theme, config }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 16,
    fontSize: 16,
    border: 'none',
    backgroundColor: 'rgb(var(--c-gray-100))',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
    padding: '8px 16px',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: `1px solid ${config.primaryColor || '#0052CD'}`,
  },
  '& .MuiInputBase-input': {
    padding: '8px 16px',
    minHeight: '32px',
  },
  '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
    border: `1px solid #F44336`,
  },
  '& .MuiFormHelperText-root': {
    position: 'absolute',
    bottom: -20,
    right: 0,
    fontSize: 12,
    color: 'rgb(var(--c-gray-500))',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  '& .MuiFormHelperText-root.Mui-error': {
    color: theme.palette.error.main,
  },
  position: 'relative',
}));

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (props, ref) => {
    const config = useAppStore((s) => s.currentApp);
    return (
      <StyledTextField
        ref={ref}
        variant="outlined"
        placeholder={props.placeholder}
        inputProps={{ style: { minWidth: '40px' } }}
        // @ts-expect-error: `config` is consumed by StyledTextField above, not by MUI TextField
        config={{ primaryColor: config?.primaryColor }}
        {...props}
      />
    );
  }
);

export default CustomInput;
