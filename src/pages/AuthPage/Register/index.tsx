import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useMediaQuery, useTheme, Box } from "@mui/material"
import Wrapper from "../Wrapper"
import LogoContent from "../LogoContent"
import SignUpForm from "../Forms/RegisterForm"
import { FullPageSpinner } from "../FullPageSpinner"

export default function Register() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const [loading, setLoading] = useState(false)

  const signUpPlan = new URLSearchParams(search).get("signUpPlan")

  const onGoogleClick = async () => {
  }

  const updateUserInfo = async (loginData: any) => {
  }

  const onFacebookClick = async (info: any) => {
  }

  const theme = useTheme()
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024))
  const isSmallDevice = useMediaQuery(theme.breakpoints.down(512))

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
          justifyContent: isMobileDevice ? "start" : "center",
          alignItems: "center",
        }}
      >
        <LogoContent isMobile={isMobileDevice} />
        <SignUpForm
          loading={loading}
          isMobile={isMobileDevice}
          isSmallDevice={isSmallDevice}
          signUpWithGoogle={onGoogleClick}
          signUpWithApple={function (): void {
            console.log("Function not implemented.")
          }}
          signUpWithFacebook={onFacebookClick}
          signUpWithMetamask={() => {}}
        />
      </Box>
    </Wrapper>
  )
}
