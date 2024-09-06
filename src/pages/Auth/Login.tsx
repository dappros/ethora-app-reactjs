import { useRef } from "react"
import { actionLoginWithEmail } from "../../actions"
import { useNavigate } from "react-router-dom"

export function Login() {
    const emailRef = useRef<HTMLInputElement>(null)
    const passRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    const onSubmit = () => {
        let emailEl = emailRef.current
        let passEl = passRef.current

        if (emailEl && passEl) {
            actionLoginWithEmail(emailEl.value, passEl.value).then(() => navigate('/app/admin/apps'))
        }
    }

    return (
        <div>
            <div >
                <input ref={emailRef} type="text" name="email" placeholder="email" />
                <input ref={passRef} type="text" name="password" placeholder="password" />
                <button onClick={onSubmit}>submit</button>
            </div>
        </div>
    )
}
