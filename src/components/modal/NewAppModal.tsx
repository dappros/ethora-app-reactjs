import { useState } from "react"
import cn from "classnames"
import { Dialog, DialogPanel } from "@headlessui/react"
import { IconClose } from "../Icons/IconClose"

import "./NewAppModal.scss"
import { actionCreateApp } from "../../actions"
import { TextInput } from "../ui/TextInput"
import { toast } from "react-toastify"

interface Props {
    onClose: () => void
}

export function NewAppModal({ onClose }: Props) {
    const [appName, setAppName] = useState("")

    const onCreate = () => {
        actionCreateApp(appName)
            .then(() => {
                onClose()
                toast("Application created successfully!")
            })
    }

    return (
        <Dialog className="new-app-modal" open={true} onClose={onClose}>
            <DialogPanel className="inner">
                <div className="title">
                    Get Started with Your New App
                </div>
                <TextInput 
                    placeholder="App Name" 
                    value={appName} 
                    onChange={(e) => setAppName(e.target.value)}
                    className="gen-input gen-input-large mb-16"
                />
                <div className="buttons">
                    <button className="gen-secondary-btn mb-16" onClick={onClose}>Cancel</button>
                    <button onClick={onCreate} className={cn("gen-primary-btn mb-16", {disabled: !appName})}>Continue</button>
                </div>
                <button className="close" onClick={() => onClose()}><IconClose /></button>
            </DialogPanel>
        </Dialog>
    )
}
