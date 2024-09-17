import { Checkbox, Field, Label } from "@headlessui/react"
import "./Menu.scss"

interface MenuItems {
    chats: boolean,
    profile: boolean,
    settings: boolean
}

interface Props {
    availableMenuItems: MenuItems,
    setAvailableMenuItems: (items: MenuItems) => void
}

export function Menu({availableMenuItems, setAvailableMenuItems}: Props) {
    const onChange = (isOn: boolean, name: 'profile' | 'chats' | 'settings') => {
        setAvailableMenuItems({...availableMenuItems, [name]: isOn})
    }
    return (
        <div className="settings-menu">
            <p className="body2 mb-32">Manage items that are displayed in your App menu.</p>
            <Field className="checkbox  mb-6">
                <Checkbox
                    className="checkbox-input"
                    checked={availableMenuItems.profile}
                    onChange={(isOn) => onChange(isOn, 'profile')}
                >
                    
                </Checkbox>
                <Label className="label">
                    Profile / Wallet
                </Label>
            </Field>
            <p className="caption mb-32">Each of your Users is equipped with a personal digital wallet. User will see their Assets (wallet contents) in their Profile screen. Depending on configuration, the Profile and Assets can also be visible to other Users.</p>
            <Field className="checkbox  mb-6">
                <Checkbox
                    className="checkbox-input"
                    checked={availableMenuItems.chats}
                    onChange={(isOn) => onChange(isOn, 'chats')}
                >
                    
                </Checkbox>
                <Label className="label">
                    Chats
                </Label>
            </Field>
            <p className="caption mb-32">Shows a list of Chats including your default Pinned Chats and also group and private conversations that your User is a part of.</p>
            <Field className="checkbox  mb-6">
                <Checkbox
                    className="checkbox-input"
                    checked={availableMenuItems.settings}
                    onChange={(isOn) => onChange(isOn, 'settings')}
                >
                    
                </Checkbox>
                <Label className="label">
                    Settings
                </Label>
            </Field>
            <p className="caption mb-32">This is where your User can manage their visibility and privacy settings, as well as download their data or delete their account (GDPR and CCPA compliance requirement). </p>
        </div>
    )
}