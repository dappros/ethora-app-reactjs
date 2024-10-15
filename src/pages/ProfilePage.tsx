import { useNavigate } from "react-router-dom"
import { IconEdit } from "../components/Icons/IconEdit"
import { IconQr } from "../components/Icons/IconQr"
import "./ProfilePage.scss"
import { ProfilePageUserIcon } from "../components/ProfilePageUserIcon"
import { useAppStore } from "../store/useAppStore"
import { ModelCurrentUser } from "../models"
import { useState } from "react"
import { QrModal } from "../components/modal/QrModal"
import { actionLogout } from "../actions"

export function ProfilePage() {
    const [showQr, setShowQr] = useState(false)
    const { firstName, lastName, profileImage, description, defaultWallet: {walletAddress} } = useAppStore(s => s.currentUser as ModelCurrentUser)

    const navigate = useNavigate()

    const onLogout = () => {
        actionLogout()
        navigate("/login", {replace: true})
    }
    return (
        <>
            <div className="app-content-header">
                <div className="app-content-header-title">Profile</div>
            </div>
            <div className="app-content-body">
                <div className="profile-page">
                    <div className="profile-top">
                        <button onClick={() => setShowQr(true)}><IconQr /></button>
                        <button onClick={() => navigate("/app/profile/edit")}><IconEdit /></button>
                    </div>
                    <ProfilePageUserIcon firstName={firstName} lastName={lastName} profileImage={profileImage} />
                    <div className="profile-user-info">
                        <span className="h2">
                            {`${firstName} ${lastName}`}
                        </span>
                        {description && (
                            <div className="profile-user-about">
                                <div className="mb-8">About</div>
                                <span>{description}</span>
                            </div>
                        )}
                        <button className="gen-secondary-btn buttons" onClick={() => onLogout()}>Logout</button>
                    </div>
                </div>
            </div>
            {showQr && (
                <QrModal walletAddress={walletAddress} onClose={() => setShowQr(false)}/>
            )}
        </>
    )
}
