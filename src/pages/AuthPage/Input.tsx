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

interface CustomInputProps extends Omit<TextFieldProps, 'variant'> {
  isDisabledPassword?: boolean;
}

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
    const [showPassword, setShowPassword] = useState(false);
    const [type, setType] = useState<HTMLInputTypeAttribute | undefined>(
      props.type
    );

    useEffect(() => {
      if (props.type === 'email') return;
      setType(showPassword ? 'text' : 'password');
    }, [showPassword, props.type]);

    const inputType = props.isDisabledPassword ? 'text' : type;

    return (
      <StyledTextField
        key={inputType}
        ref={ref}
        variant="outlined"
        placeholder={props.placeholder}
        type={inputType}
        value={props.value}
        // @ts-ignore
        config={{ primaryColor: config?.primaryColor }} // Pass config to StyledTextField
        {...props}
        InputProps={{
          ...props.InputProps,
          type: inputType,
          readOnly: props.isDisabledPassword,
          inputMode: props.isDisabledPassword ? 'none' : undefined,
          onCopy: (e) => props.isDisabledPassword && e.preventDefault(),
          onCut: (e) => props.isDisabledPassword && e.preventDefault(),
          onContextMenu: (e) => props.isDisabledPassword && e.preventDefault(),
          onSelect: (e) => props.isDisabledPassword && e.preventDefault(),
          style: {
            minWidth: '40px',
            userSelect: props.isDisabledPassword ? 'none' : 'auto',
            cursor: props.isDisabledPassword ? 'default' : 'text',
          },
          endAdornment:
            props.type === 'password' && !props.isDisabledPassword ? (
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

export default CustomInput;
