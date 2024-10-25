import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAppStore } from '../../store/useAppStore';

interface CustomInputProps extends Omit<TextFieldProps, 'variant'> {}

// @ts-ignore
const StyledTextField = styled(TextField)(({ theme, config }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 16,
    fontSize: 16,
    border: 'none',
    backgroundColor: '#F5F7F9',
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
    color: '#8C8C8C',
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
        // @ts-ignore
        config={{ primaryColor: config?.primaryColor }} // Pass config to StyledTextField
        {...props}
      />
    );
  }
);

export default CustomInput;
