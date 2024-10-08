import React, { useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"

import { useLocation, useNavigate } from "react-router-dom"
import BackButton from "../BackButton"
import CustomStepper from "../Stepper"
import FirstStep from "../Register/Steps/FirstStep"
import SecondStep from "../Register/Steps/SecondStep"
import ThirdStep from "../Register/Steps/ThirdStep"
import { useAppStore } from "../../../store/useAppStore"

interface SignUpFormProps {
  isMobile?: boolean
  isSmallDevice?: boolean
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  isMobile = false,
  isSmallDevice = false,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const config = useAppStore(s => s.currentApp)

  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (location.pathname.includes("tempPassword")) {
      setActiveStep(2)
    }
  }, [])

  const steps = [
    <FirstStep
      setStep={setActiveStep}
      isSmallDevice={isSmallDevice}
    />,
    <SecondStep />,
    <ThirdStep />,
  ]

  // @ts-ignore
  const StepComponent = ({ step }) => {
    return steps[step] || <div>Step not found</div>
  }

  return (
    <Box
      sx={{
        padding: "16px",
        borderRadius: "24px",
        backgroundColor: "white",
        boxShadow: isMobile ? "none" : "0px 4px 35px 0px #00000014",
        p: isMobile ? "0px 16px" : "24px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minWidth: "300px",
        width: "100%",
        maxWidth: isMobile ? "486px" : "600px",
        maxHeight: isMobile ? "732px" : "588px",
        minHeight: isMobile ? "inherit" : "588px",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
          }}
        >
          {activeStep > 0 && (
            <BackButton onPress={() => setActiveStep((prev) => prev - 1)} />
          )}
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontFamily: "Varela Round",
              fontWeight: 400,
              fontSize: "24px",
              height: "32px",
              color: "#141414",
              m: 0,
            }}
          >
            Sign Up
          </Typography>
        </Box>
        <CustomStepper
          step={activeStep}
          color={config?.primaryColor ? config.primaryColor : "#0052CD"}
        />
        <StepComponent step={activeStep} />
      </Box>
      <Typography
        align="center"
        component="span"
        sx={{
          fontSize: "14px",
        }}
      >
        Already have an account?{" "}
        <Typography
          style={{
            textDecoration: "underline",
            color: config?.primaryColor ? config.primaryColor : "#0052CD",
            display: "inline",
            fontSize: "14px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/login")}
        >
          Sign In
        </Typography>
      </Typography>
    </Box>
  )
}

export default SignUpForm
