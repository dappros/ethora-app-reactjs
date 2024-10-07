import { toast } from "react-toastify"
import { httpCheckEmailExist, httpLoginSocial, httpRegisterSocial } from "../../http"
import { useAppStore } from "../../store/useAppStore"
import CustomButton from "./Button"
import { getUserCredsFromGoogle } from "./firebase"
import GoogleIcon from "./Icons/socials/googleIcon"
import { actionAfterLogin } from "../../actions"
import { useNavigate } from "react-router-dom"

export const GoogleButton = () => {
    const config = useAppStore.getState().currentApp
    const navigate = useNavigate()
    const onGoogleLogin = async () => {
        console.log("google login")
        const loginType = "google"
        const {user, idToken, credential} = await getUserCredsFromGoogle()

        if (!user.providerData[0].email) {  
            toast.error("Email not provided by Google")
            return
        }

        const emailExist = await httpCheckEmailExist(user.providerData[0].email)

        if (emailExist.data.success) {
          console.log("new registration")
          try {
            await httpRegisterSocial(
              idToken ?? "",
              credential?.accessToken ?? "",
              "",
              loginType
            )
          } catch (error) {
            toast.error("Social registration failed")
          }

          httpLoginSocial(idToken ?? "", credential?.accessToken ?? "", loginType).then(async ({data}) => {
            await actionAfterLogin(data)
            navigate("/app/admin/apps")
          })
        } else {
          console.log("existing user")
          httpLoginSocial(
            idToken ?? "",
              credential?.accessToken ?? "",
              loginType
            ).then(async ({data}) => {
              await actionAfterLogin(data)
              navigate("/app/admin/apps")
            })
        }
    }
    return (
        <CustomButton
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={() => onGoogleLogin()}
        style={{
          borderColor: config?.primaryColor
            ? config.primaryColor
            : "#0052CD",
    
          color: config?.primaryColor ? config.primaryColor : "#0052CD",
        }}
      >
            Continue with Google
        </CustomButton>
    )
}
