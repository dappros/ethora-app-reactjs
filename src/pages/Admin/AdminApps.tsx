import { useState } from "react";
import { ApplicationPreview } from "../../components/ApplicationPreview/ApplicationPreview";
import { ApplicationStarterInf } from "../../components/ApplicationStarterInf/ApplicationStarterInf";
// import { ReadyToCreateFirstAppModal } from "../../components/modal/ReadyToCreateFirstAppModal";
import { NewAppModal } from "../../components/modal/NewAppModal";
import { useAppStore } from "../../store/useAppStore";

export function AdminApps() {
    const [showStarterInf, setShowStarterInf] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const apps = useAppStore(s => s.apps)

    const renderAppCreationModal = () => {
        return (
            <NewAppModal onClose={() => setShowModal(false)} />
        )
        // if app.length === 0
        // return (
        //     <ReadyToCreateFirstAppModal onClose={() => setShowModal(false)} />
        // )
    }

    return (
        <>
            <div className="app-content-body-header">
                <div className="left">
                    Apps
                </div>
                <div className="right">
                    <button className="primary-btn" onClick={() => setShowModal(true)}>
                        <span className="content">
                            Create App
                        </span>
                    </button>
                </div>
            </div>
            <div>
                { showStarterInf && <ApplicationStarterInf onClose={() => setShowStarterInf(false)} /> }
                {
                    apps.map((app) => {
                        return (
                            <ApplicationPreview app={app} key={app._id} />
                        )
                    })
                }
                
            </div>
            { showModal && renderAppCreationModal() }
        </>
    )
}
