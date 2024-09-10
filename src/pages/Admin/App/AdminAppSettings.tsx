import { useParams } from "react-router-dom";
import { useAppStore } from "../../../store/useAppStore";

import "./AdminAppSettings.scss"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Appearance } from "./SettingsTab/Appearance";
import { SignonOptions } from "./SettingsTab/SignonOptions";
import { WebApp } from "./SettingsTab/WebApp";
import { MobileApp } from "./SettingsTab/MobileApp";
import { HomeScreen } from "./SettingsTab/HomeScreen";
import { Menu } from "./SettingsTab/Menu";
import { Chats } from "./SettingsTab/Chats";
import { Visibility } from "./SettingsTab/Visibility";

export function AdminAppSettings() {
    let { appId } = useParams()
    const apps = useAppStore(s => s.apps)
    const app = apps.find((app) => app._id === appId)

    if (!app) {
        return null
    }

    return (
        <div className="app-content-body-page">
            <div className="app-content-body-header">
                <div className="left">
                    Settings
                </div>
                <div className="right">
                    <button className="gen-secondary-btn medium">
                        Save
                    </button>
                </div>
            </div>
            <TabGroup className="admin-app-settings">
                <TabList className="tabs">
                    <Tab key="Appearance">Appearance</Tab>
                    <Tab key="Sign-on options">Sign-on options</Tab>
                    <Tab key="Web app">Web app</Tab>
                    <Tab key="Mobile app">Mobile app</Tab>
                    <Tab key="Home screen">Home screen</Tab>
                    <Tab key="Menu">Menu</Tab>
                    <Tab key="Chats">Chats</Tab>
                    <Tab key="Visibility & Privacy">Visibility & Privacy</Tab>
                </TabList>
                <TabPanels className="tabs-content">
                    <TabPanel key="Appearance"><Appearance app={app} /></TabPanel>
                    <TabPanel key="Sign-on options"><SignonOptions /></TabPanel>
                    <TabPanel key="Web app"><WebApp /></TabPanel>
                    <TabPanel key="Mobile app"><MobileApp /></TabPanel>
                    <TabPanel key="Home screen"><HomeScreen /></TabPanel>
                    <TabPanel key="Menu"><Menu /></TabPanel>
                    <TabPanel key="Chats"><Chats /></TabPanel>
                    <TabPanel key="Visibility & Privacy"><Visibility /></TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    )
}
