import { NavLink, useNavigate } from "react-router-dom"
import "./Login.scss"
import { TextInput } from "../../components/ui/TextInput"
import { SubmitHandler, useForm } from "react-hook-form"
import { actionLoginWithEmail } from "../../actions"

type Inputs = {
    email: string
    password: string
}

export function Login() {
    const {register, handleSubmit, formState: {errors}} = useForm<Inputs>()
    const navigate = useNavigate()
    const onSubmit: SubmitHandler<Inputs> = ({email, password}) => {
        actionLoginWithEmail(email, password)
            .then(() => {
                navigate('/app/admin/apps')
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form login-form">
            <div className="title">Login</div>
            <TextInput
                errorText={errors.email && errors.email.message}
                placeholder="email"
                type="email"
                className="gen-input gen-input-large mb-24"
                {...register("email", {required: true})}
            />
            <TextInput 
                errorText={errors.password && errors.password.message}
                type="password"
                placeholder="password"
                className="gen-input gen-input-large mb-24"
                {...register("password", {required: true})}
            />
            <NavLink className="body-link mb-24" to="/auth/forgot">Forgot password?</NavLink>
            <button type="submit" className="gen-primary-btn mb-24">Sign In</button>
            <div className="text-center mb-24">or</div>
            <button className="gen-secondary-btn mb-24">Continue with Google</button>
            <div className="text-center">
                <span>Don't have an account?</span>
                <NavLink to="/auth/register" className="body-link ml-8">Sign Up</NavLink>
            </div>
        </form>
    )
}
