import { useMediaQuery, useTheme, Box } from "@mui/material"
import Wrapper from "../Wrapper"
import LogoContent from "../LogoContent"
import ForgetPasswordForm from "../Forms/ForgetPasswordForm"
import { useParams } from "react-router-dom"

export default function ForgetPassword() {
  let { token } = useParams()

  console.log("token is ", token)
  
  const theme = useTheme()
  const isMobileDevice = useMediaQuery(theme.breakpoints.down(1024))

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
        <ForgetPasswordForm isMobile={isMobileDevice} />
      </Box>
    </Wrapper>
  )
}
