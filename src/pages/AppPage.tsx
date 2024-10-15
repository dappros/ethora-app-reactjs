import { Outlet, NavLink } from "react-router-dom";
import "./AppPage.scss"
import { IconChat } from "../components/Icons/IconChat";
import { IconAdmin } from "../components/Icons/IconAdmin";
import { IconSettings } from "../components/Icons/IconSettings";
import profileImage from "../assets/profile-image.png"
import { IconMenuBurger } from "../components/Icons/IconMenuBurger";
import { useState } from "react";
import { MobileMenuModal } from "../components/modal/MobileMenuModal";
import { ProfilePageUserIcon } from "../components/ProfilePageUserIcon";
import { useAppStore } from "../store/useAppStore";
import { ModelCurrentUser } from "../models";

export function AppPage() {
    const [isMobileMenuVisible, setMobileMenuVisible] = useState(false)
    const {firstName, lastName, profileImage} = useAppStore(s => s.currentUser as ModelCurrentUser)
    const toggleMobileMenu = () => {
        setMobileMenuVisible(!isMobileMenuVisible)
    }

    return (
        <div className="app-page-outer">
            <div className="app-page">
                <div className="app-menu">
                    <div className="app-menu-desktop">
                        <div className="menu-desktop-top">
                            <NavLink to="/app/chat" className="app-menu-btn">
                                <IconChat />
                                Chats
                            </NavLink >
                            <NavLink to="/app/admin/apps" className="app-menu-btn">
                                <IconAdmin />
                                Admin
                            </NavLink >
                        </div>
                        <div className="menu-desktop-bottom">
                            <NavLink to="/app/profile" className="app-menu-btn">
                                <div className="menu-profile">
                                    <ProfilePageUserIcon width="40px" height="40px" firstName={firstName} lastName={lastName} profileImage={profileImage} />
                                </div>
                                <span>Profile</span>
                            </NavLink >
                            <NavLink to="/app/settings" className="app-menu-btn">
                                <IconSettings />
                                <span>Settings</span>
                            </NavLink >
                        </div>
                    </div>

                    <div className="app-menu-mobile">
                        <button className="app-menu-mobile-btn" onClick={toggleMobileMenu}>
                            <IconMenuBurger />
                        </button>
                        <div>
                            <div className="menu-profile">
                                <NavLink to="/app/profile" className="app-menu-btn">
                                    <ProfilePageUserIcon profileImage={profileImage} width="40px" height="40px" firstName={firstName} lastName={lastName} />
                                </NavLink >

                            </div>
                        </div>
                        {isMobileMenuVisible && <MobileMenuModal onClose={() => setMobileMenuVisible(false)} />}
                    </div>
                </div>
                <div className="app-content">
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    )
}
