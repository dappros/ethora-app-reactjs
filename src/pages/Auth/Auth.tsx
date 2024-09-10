import { Outlet } from "react-router-dom";
import "./Auth.scss"

export function Auth() {
    return (
        <div className="auth-page">
            <div className="auth-page-container">
                <div className="left">
                    <div className="logo">

                    </div>
                    <h4 className="slogan">
                        Empower your community
                    </h4>
                </div>
                <div className="right">
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    )
}
