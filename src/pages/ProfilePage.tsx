import { useNavigate } from "react-router-dom"
import { IconEdit } from "../components/Icons/IconEdit"
import { IconQr } from "../components/Icons/IconQr"
import "./ProfilePage.scss"
import { ProfilePageUserIcon } from "../components/ProfilePageUserIcon"
import { useAppStore } from "../store/useAppStore"
import { ModelCurrentUser } from "../models"
import { useEffect, useState } from "react"
import { QrModal } from "../components/modal/QrModal"
import { actionLogout } from "../actions"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react"
import { getDocuments } from "../http"

export function ProfilePage() {
    const [showQr, setShowQr] = useState(false)
    const [documents, setDocuments] = useState<Array<any>>([])
    const { firstName, lastName, profileImage, description, defaultWallet: { walletAddress } } = useAppStore(s => s.currentUser as ModelCurrentUser)

    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            let {data} = await getDocuments(walletAddress)
            // @ts-ignore
            let items = data.results.filter((el) => el.locations[0])
            setDocuments(items)
            console.log({items})
        })()

    }, [])

    const onLogout = () => {
        actionLogout()
        navigate("/login", { replace: true })
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
                        <div className="profile-items">
                            <TabGroup className="profile-items-tabgroup">
                                <TabList className="tabs">
                                    <Tab key="documents" className="tab">Documents</Tab>
                                    <Tab key="collections" className="tab">Collections</Tab>
                                </TabList>
                                <TabPanels className="tabs-content">
                                    <TabPanel key="documents">
                                        documents
                                        {documents.map((el) => (<div className="document-item" key={el._id}>{el.documentName}</div>))}
                                    </TabPanel>
                                    <TabPanel key="collections">
                                        collections
                                    </TabPanel>
                                </TabPanels>
                            </TabGroup>
                        </div>
                        <button className="gen-secondary-btn buttons" onClick={() => onLogout()}>Logout</button>
                    </div>
                </div>
            </div>
            {showQr && (
                <QrModal walletAddress={walletAddress} onClose={() => setShowQr(false)} />
            )}
        </>
    )
}
