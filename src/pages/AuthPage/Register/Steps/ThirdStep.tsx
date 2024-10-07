import { Box, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import CustomInput from "../../Input"
import CustomButton from "../../Button"
import { useFormik } from "formik"
import SkeletonLoader from "../../SkeletonLoader"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "../../../../store/useAppStore"

interface ThirdStepProps {
  loading: boolean
}

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
    errors.repeatPassword = "Passwords must match"
  }

  return errors
}

const ThirdStep: React.FC<ThirdStepProps> = ({ loading }) => {
  const [userData, setUserData] = useState({
    email: "",
    tempPassword: "",
  })

  const navigate = useNavigate()
  const config = useAppStore((state) => state.currentApp)

  if (!config) {
    return null
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const email = queryParams.get("email") || ""
    const tempPassword = queryParams.get("tempPassword") || ""

    if (!tempPassword || tempPassword === "") {
      navigate("/register", {replace: true})
    }

    setUserData({ email, tempPassword })
  }, [])

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      repeatPassword: "",
    },
    validate,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
    },
  })

  return (
    <SkeletonLoader loading={loading}>
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
          onSubmit={formik.handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Typography
            sx={{
              textAlign: "left",
              fontSize: "24px",
              fontWeight: 400,
              color: "#141414",
            }}
          >
            Set your own password
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
              placeholder={"Enter temporary password"}
              sx={{ flex: 1, width: "100%" }}
              helperText={
                "You can find the temporary password in the verification email."
              }
              value={userData.tempPassword}
              disabled
            />
            <CustomInput
              placeholder={"Enter Your Password"}
              sx={{ flex: 1, width: "100%" }}
              name="newPassword"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              error={!!formik.errors.newPassword}
              helperText={formik.errors.newPassword}
            />
            <CustomInput
              placeholder={"Repeat Your Password"}
              sx={{ flex: 1, width: "100%" }}
              name="repeatPassword"
              value={formik.values.repeatPassword}
              onChange={formik.handleChange}
              error={!!formik.errors.repeatPassword}
              helperText={formik.errors.repeatPassword}
            />
          </Box>
          <CustomButton
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid}
            loading={formik.isSubmitting}
            style={{
              backgroundColor: config?.primaryColor
                ? config.primaryColor
                : "#0052CD",
            }}
          >
            Set Password
          </CustomButton>
        </Box>
      </Box>
    </SkeletonLoader>
  )
}

export default ThirdStep
