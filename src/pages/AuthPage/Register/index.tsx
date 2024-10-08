import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useMediaQuery, useTheme, Box } from "@mui/material"
import Wrapper from "../Wrapper"
import LogoContent from "../LogoContent"
import SignUpForm from "../Forms/RegisterForm"
import { FullPageSpinner } from "../FullPageSpinner"

export default function Register() {
  const theme = useTheme()
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024))
  const isSmallDevice = useMediaQuery(theme.breakpoints.down(512))

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
          isMobile={isMobileDevice}
          isSmallDevice={isSmallDevice}
        />
      </Box>
    </Wrapper>
  )
}
