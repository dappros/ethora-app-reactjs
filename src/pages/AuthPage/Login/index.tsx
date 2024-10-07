import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useMediaQuery, useTheme, Box } from "@mui/material"
import Wrapper from "../Wrapper"
import LogoContent from "../LogoContent"
import { FullPageSpinner } from "../FullPageSpinner"
import SignInForm from "../Forms/LoginForm"
import { useAppStore } from "../../../store/useAppStore"

export default function LoginComponent() {
  const config = useAppStore(s => s.currentApp)

  if (!config) {
    return null
  }

  const navigate = useNavigate()
  const { search } = useLocation()
  const [loading, setLoading] = useState(false)

  const signUpPlan = new URLSearchParams(search).get("signUpPlan")

  const onMetamaskLogin = () => {

  }

  const onGoogleClick = async () => {
  }

  const updateUserInfo = async (loginData: any) => {
  }

  const onFacebookClick = async (info: any) => {
  }

  const theme = useTheme()
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024))

  if (loading) {
    return <FullPageSpinner />
  }

  return (
    <Wrapper>
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          flex: 1,
          flexDirection: isMobileDevice ? "column" : "row",
          gap: isMobileDevice ? "20px" : "16px",
          alignItems: "center",
        }}
      >
        <LogoContent isMobile={isMobileDevice} />
        <SignInForm
          isMobile={isMobileDevice}
        />
      </Box>
    </Wrapper>
  )
}
