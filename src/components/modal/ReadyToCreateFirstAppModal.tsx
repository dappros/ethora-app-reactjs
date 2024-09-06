import { Dialog, DialogPanel } from "@headlessui/react"
import "./ReadyToCreateFirstAppModal.scss"
import { IconClose } from "../Icons/IconClose"

interface Props {
    onClose: () => void
}

export function ReadyToCreateFirstAppModal({ onClose }: Props) {
    return (
        <Dialog className="ready-to-create-first-app-modal" open={true} onClose={onClose}>
            <DialogPanel className="inner">
                <div className="img-div"></div>
                <div className="title">
                    Ready to Create Your First App?
                </div>
                <p>
                    Welcome to our platform!
                    In just a few steps, you can launch your first app. Start building it now and take advantage of web3 technologies and integrated tools to grow your business or community.
                </p>
                <div className="buttons">
                    <button className="gen-secondary-btn">View Demo</button>
                    <button className="gen-primary-btn">Create App</button>
                </div>
                <button className="close" onClick={() => onClose()}><IconClose /></button>
            </DialogPanel>
        </Dialog>
    )
}
