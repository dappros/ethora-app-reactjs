import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import CustomInput from "../../Input"
import CustomButton from "../../Button"
import SkeletonLoader from "../../SkeletonLoader"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "../../../../store/useAppStore"
import { useForm } from "react-hook-form"

interface Inputs {
  newPassword: string
  repeatPassword: string
}

const ThirdStep = () => {
  const [userData, setUserData] = useState({
    email: "",
    tempPassword: "",
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

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

  const onSubmit = async({newPassword, repeatPassword}: Inputs) => {
    console.log(newPassword, repeatPassword)
  }

  return (
    <SkeletonLoader loading={false}>
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
          onSubmit={handleSubmit(onSubmit)}
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
              {...register("newPassword", {required: "Required field"})}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <CustomInput
              placeholder={"Repeat Your Password"}
              sx={{ flex: 1, width: "100%" }}
              {...register("repeatPassword", {required: "Required field"})}
              error={!!errors.repeatPassword}
              helperText={errors.repeatPassword?.message}
            />
          </Box>
          <CustomButton
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
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