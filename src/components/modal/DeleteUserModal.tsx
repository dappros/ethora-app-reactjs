import cn from "classnames"
import { Dialog, DialogPanel } from "@headlessui/react"
import { IconClose } from "../Icons/IconClose"

import "./DeleteUserModal.scss"
import { ReactNode } from "react"

interface Props {
    onClose: () => void,
    children: ReactNode
}

export function DeleteUserModal({ onClose, children }: Props) {
    return (
        <Dialog className="delete-user-modal" open={true} onClose={onClose}>
            <DialogPanel className="inner">
                {children}
                <button className="close" onClick={() => onClose()}><IconClose /></button>
            </DialogPanel>
        </Dialog>
    )
}
