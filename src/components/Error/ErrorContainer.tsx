import { ReactElement } from "react";
import { Box, Container, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CustomButton from "../../pages/AuthPage/Button";

interface ErrorContainerProps {
  status: string;
  title: string;
  description: string;
  image: string;
}

export const ErrorContainer = (props: ErrorContainerProps): ReactElement => {
  const {
    status,
    title,
    description,
    image,
  } = props;

  return (
    <Container className="w-full h-screen flex flex-col md:flex-row items-center justify-center md:justify-around md:gap-10">
      <Box className="flex flex-col items-center text-center">
        <span className="text-brand-850 font-bold text-base">{status}</span>
        <span className="py-8 text-4xl md:text-5xl font-medium">{title}</span>
        <Typography className="pb-8">{description}</Typography>
        <CustomButton
          variant="contained"
          startIcon={<ArrowBackIcon />}
          style={{padding: "2px 48px"}}
        >
          Go Back
        </CustomButton>
      </Box>
      <Box>
        <img src={image} alt="Error"/>
      </Box>
    </Container>
  );
};
