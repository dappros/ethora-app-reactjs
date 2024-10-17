import { useRef, useState } from "react"
import cn from "classnames"
import { Dialog, DialogPanel } from "@headlessui/react"
import { IconClose } from "../Icons/IconClose"

import { actionCreateApp } from "../../actions"
import { TextInput } from "../ui/TextInput"
import { toast } from "react-toastify"

import "./CreateDocumentModal.scss"
import { IconPaperclip } from "../Icons/IconPaperclip"
import { postDocument } from "../../http"
import { Loading } from "../Loading"

interface Props {
    onClose: () => void
    componentGetDocs: () => void
}

export function CreateDocumentModal({ onClose, componentGetDocs }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File>()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')

    const onCreate = () => {
        if (file && name) {
            setLoading(true)
            postDocument(name, file)
                .then(() => {
                    toast.success("Document created successfully")
                    componentGetDocs()
                    onClose()
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }

    const onFileUpload = () => {
        const fileEl = inputRef.current

        if (fileEl) {
            fileEl.click()
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            let file = e.target.files[0]

            if (file) {
                setFile(file)
            }
        }
    }

    return (
        <Dialog className="create-document-modal" open={true} onClose={() => {}}>
            <DialogPanel className="inner">
                <div className="title">
                    New Document
                </div>
                <TextInput
                    placeholder="Document Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="gen-input gen-input-large mb-16"
                />
                <button className="gen-secondary-btn" onClick={onFileUpload}>
                    <IconPaperclip />
                </button>
                {!file && (
                    <div className="mt-16 mb-16 text-center">
                        No file chosen
                    </div>
                )}
                {file && (
                    < div className="mt-16 mb-16 text-center">
                        {file.name}
                    </div>
                )}
                <input onChange={onChange} type="file" ref={inputRef} className="hidden"></input>
                <div className="buttons">
                    <button className="gen-secondary-btn mb-16" onClick={onClose}>Cancel</button>
                    <button onClick={onCreate} className={cn("gen-primary-btn mb-16")}>Create</button>
                </div>
                <button className="close" onClick={() => onClose()}><IconClose /></button>
            </DialogPanel>
            {loading && (
                <Loading></Loading>
            )}
        </Dialog >
    )
}
