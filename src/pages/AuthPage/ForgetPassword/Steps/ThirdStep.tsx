import { Box, Typography } from "@mui/material"
import React, { useState } from "react"
import CustomInput from "../../Input"
import CustomButton from "../../Button"
import { useFormik } from "formik"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "../../../../store/useAppStore"

const validate = (values: { newPassword: string; repeatPassword: string }) => {
  const errors: Record<string, string> = {}

  if (!values.newPassword) {
    errors.newPassword = "Required field"
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters"
  }

  if (!values.repeatPassword) {
    errors.repeatPassword = "Required field"
  } else if (values.repeatPassword !== values.newPassword) {
    errors.repeatPassword = "Passwords don't match"
  }

  return errors
}

interface ThirdStepProps {}

const ThirdStep: React.FC<ThirdStepProps> = ({}) => {
  const navigate = useNavigate()
  const config = useAppStore(s => s.currentApp)

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      repeatPassword: "",
    },
    validate,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      setSubmitting(true)
      setSubmitting(false)
    },
  })
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <Box
        component="form"
        noValidate
        autoComplete="off"
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        onSubmit={formik.handleSubmit}
      >
        <Typography
          sx={{
            textAlign: "left",
            fontSize: "24px",
            fontWeight: 400,
            color: "#141414",
          }}
        >
          Set your new password
        </Typography>
        <Box
          sx={{
            display: "flex",
            minWidth: "328px",
            gap: 3,
            flex: 1,
            flexDirection: "column",
          }}
        >
          <CustomInput
            placeholder="Enter New Password"
            name="newPassword"
            type="password"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.newPassword && Boolean(formik.errors.newPassword)
            }
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            sx={{ flex: 1, width: "100%" }}
          />
          <CustomInput
            placeholder="Repeat New Password"
            name="repeatPassword"
            type="password"
            value={formik.values.repeatPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.repeatPassword &&
              Boolean(formik.errors.repeatPassword)
            }
            helperText={
              formik.touched.repeatPassword && formik.errors.repeatPassword
            }
            sx={{ flex: 1, width: "100%" }}
          />
        </Box>
        <CustomButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
          style={{
            backgroundColor: config?.primaryColor
              ? config.primaryColor
              : "#0052CD",
          }}
        >
          Reset password
        </CustomButton>
      </Box>
    </Box>
  )
}

export default ThirdStep
