import React, { Dispatch, SetStateAction, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { Box, Typography } from "@mui/material"
import CustomButton from "../../Button"
import CustomInput from "../../Input"
import SkeletonLoader from "../../SkeletonLoader"
import { useAppStore } from "../../../../store/useAppStore"
import { GoogleButton } from "../../GoogleButton"
import { MetamaskButton } from "../../MetamaskButton"
import { httpRegisterWithEmail } from "../../../../http"
import { toast } from "react-toastify"

interface FirstStepProps {
  setStep: Dispatch<SetStateAction<number>>
  isSmallDevice?: boolean
}

type Inputs = {
  firstName: string
  lastName: string
  email: string
}

const FirstStep: React.FC<FirstStepProps> = ({
  isSmallDevice = false,
  setStep
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const config = useAppStore(s => s.currentApp)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  if (!config) {
    return null
  }

  const onSubmit = async({email, firstName, lastName}: Inputs) => {
    console.log("onSubmit")
    httpRegisterWithEmail(email, firstName, lastName)
      .then(_ => {
        setSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          email: email
        })
        setStep((prev) => prev + 1)
      })
      .catch(error => {
        toast.error(error.data.error)
      })
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minWidth: "320px",
      }}
    >
      <SkeletonLoader loading={false}>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flexWrap: "wrap",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Box
            sx={{
              display: "flex",
              minWidth: "320px",
              gap: 3,
              flex: 1,
              flexWrap: isSmallDevice ? "wrap" : "nowrap",
            }}
          >
            <CustomInput
              placeholder="First Name"
              id="firstName"
              fullWidth
              {...register("firstName", { required: "First Name is required" })}
              error={
                Boolean(errors.firstName)
              }
              helperText={
                errors.firstName?.message
              }
            />
            <CustomInput
              placeholder="Last Name"
              id="lastName"
              fullWidth
              {...register("lastName", { required: "Last Name is required" })}
              error={Boolean(errors.lastName)}
              helperText={
                errors.lastName?.message
              }
            />
          </Box>
          <CustomInput
            fullWidth
            placeholder="Email"
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required", 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <CustomButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{
              backgroundColor: config?.primaryColor
                ? config.primaryColor
                : "#0052CD",
            }}
          >
            Sign Up
          </CustomButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "8px",
                color: "#8C8C8C",
                flexWrap: "wrap",
                maxWidth: "486px",
                fontSize: "14px",
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: "inherit",
                  color: "inherit",
                  flexWrap: "wrap",
                }}
              >
                By clicking the 'Sign Up' button, you agree to our
              </Typography>
              <Typography
                component="a"
                href="/terms"
                sx={{
                  textDecoration: "underline",
                  color: config?.primaryColor ? config.primaryColor : "#0052CD",
                  fontSize: "inherit",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Terms & Conditions
              </Typography>
            </Box>
          </Box>
          {config?.signonOptions.length > 1 && (
            <Typography
              sx={{ width: "100%", textAlign: "center", color: "#8C8C8C" }}
            >
              or
            </Typography>
          )}
          {config?.signonOptions.includes("google") && (
            <GoogleButton />
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {config?.signonOptions.includes("metamask") && (
            <MetamaskButton />
          )}
        </Box>
      </SkeletonLoader>
    </Box>
  )
}

export default FirstStep
