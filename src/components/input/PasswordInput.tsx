import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { HTMLInputTypeAttribute, useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface PasswordInputProps extends Omit<TextFieldProps, 'variant'> {
  isDisabledPassword?: boolean;
}

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

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const { isDisabledPassword, placeholder, value } = props;
    const config = useAppStore((s) => s.currentApp);
    const [showPassword, setShowPassword] = useState(false);
    const [type, setType] = useState<HTMLInputTypeAttribute | undefined>(
      'password'
    );

    useEffect(() => {
      if (type === 'email') return;
      setType(showPassword ? 'text' : 'password');
    }, [showPassword, type]);

    const inputType = isDisabledPassword ? 'text' : type;

    return (
      <StyledTextField
        key={inputType}
        ref={ref}
        variant="outlined"
        placeholder={placeholder}
        type={inputType}
        value={value}
        // @ts-expect-error: `config` is consumed by StyledTextField above, not by MUI TextField
        config={{ primaryColor: config?.primaryColor }}
        {...props}
        InputProps={{
          ...props.InputProps,
          type: inputType,
          readOnly: isDisabledPassword,
          inputMode: isDisabledPassword ? 'none' : undefined,
          onCopy: (e) => isDisabledPassword && e.preventDefault(),
          onCut: (e) => isDisabledPassword && e.preventDefault(),
          onContextMenu: (e) => isDisabledPassword && e.preventDefault(),
          onSelect: (e) => isDisabledPassword && e.preventDefault(),
          style: {
            minWidth: '40px',
            userSelect: isDisabledPassword ? 'none' : 'auto',
            cursor: isDisabledPassword ? 'default' : 'text',
          },
          endAdornment: !isDisabledPassword ? (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
    );
  }
);

export default PasswordInput;
