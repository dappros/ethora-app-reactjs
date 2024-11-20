import { Box, Typography } from '@mui/material';
import { ReactElement, ReactNode } from 'react';

interface BillingBoxContainerProps {
  title: string;
  titleButton?: ReactNode;
  children: ReactNode;
}

export const BillingBoxContainer = (props: BillingBoxContainerProps): ReactElement => {
  const { title, children, titleButton } = props;
  return (
    <Box className="flex flex-col justify-between p-6 border rounded-lg shadow bg-white">
      <Box className="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-4">
        <Typography variant="h6" className="text-lg font-semibold mb-2">{title}</Typography>
        {titleButton && titleButton}
      </Box>
      {children}
    </Box>
  );
};
