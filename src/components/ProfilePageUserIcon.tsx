import { MenuButton, MenuItems, Menu, MenuItem, MenuSeparator } from "@headlessui/react"
import { IconEdit } from "./Icons/IconEdit"
import "./ProfilePageUserIcon.scss"
import { IconCamera } from "./Icons/IconCamera"
import { IconMedia } from "./Icons/IconMedia"
import { IconDelete } from "./Icons/IconDelete"
import { useRef, useState } from "react"
import 'react-image-crop/dist/ReactCrop.css'
import { AvatarModalCropper } from "./modal/AvatarModalCropper"


interface Props {
    editMode?: boolean
    profileImage: string,
    firstName: string,
    lastName: string,
    setProfileImage?: (image: string) => void,
    width?: string,
    height?: string,
}

export function ProfilePageUserIcon(
    { 
        editMode = false, 
        profileImage, 
        setProfileImage = () => {},
        width = '120px',
        height = '120px'
    }: Props
) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [imageSrc, setImageSrc] = useState('')
    const [fileInputKey, setFileInputKey] = useState(0)

    const onMenuPhotoClick = () => {
        if (fileRef.current) {
            fileRef.current.click()
        }
    }

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let files = e.target.files
        if (files) {
            const file = files[0]

            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImageSrc(reader.result as string)
                }
                reader.readAsDataURL(file);
            }

            setFileInputKey((key) => key + 1)
        }
    }

    let innerStyle: any = {}

    if (profileImage) {
        innerStyle.backgroundImage = `url('${profileImage}')`
    } else {
        innerStyle.backgroundColor = 'white'
    }

    innerStyle.width = width
    innerStyle.height = height

    return (
        <div className="profile-user-icon">
            <input key={fileInputKey} ref={fileRef} onChange={onFileInputChange} accept="image/*" className="hidden" type="file" />
            <div className="inner" style={innerStyle}>
                {editMode && (
                    <div className="dimmed">
                        <Menu>
                            <MenuButton>
                                <IconEdit stroke="white" />
                            </MenuButton>
                            <MenuItems anchor="bottom start" className="profile-icon-menu-items">
                                <MenuItem>
                                    <button onClick={() => { }}>
                                        <span>Make photo</span>
                                        <IconCamera />
                                    </button>
                                </MenuItem>
                                <MenuSeparator className="separator" />
                                <MenuItem>
                                    <button onClick={onMenuPhotoClick}>
                                        <span>Choose photo</span>
                                        <IconMedia />
                                    </button>
                                </MenuItem>
                                <MenuSeparator className="separator" />
                                <MenuItem>
                                    <button onClick={() => setProfileImage('')}>
                                        <span>Delete</span>
                                        <IconDelete />
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                    </div>
                )}
            </div>
            {imageSrc && <AvatarModalCropper setProfileImage={setProfileImage} image={imageSrc} onClose={() => setImageSrc('')} />}
        </div>
    )
}
