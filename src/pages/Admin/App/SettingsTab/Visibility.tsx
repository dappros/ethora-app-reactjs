import { RadioGroup, Field, Label, Radio, } from "@headlessui/react"
import "./Visibility.scss"
import { useState } from "react"

interface Props {
    defaultAccessAssetsOpen: boolean
    setDefaultAccessAssetsOpen: (on: boolean) => void
    defaultAccessProfileOpen: boolean
    setDefaultAccessProfileOpen: (on: boolean) => void,
    usersCanFree: boolean,
    setUsersCanFree: (on: boolean) => void
}

export function Visibility(
    {
        defaultAccessAssetsOpen, 
        setDefaultAccessAssetsOpen,
        defaultAccessProfileOpen,
        setDefaultAccessProfileOpen,
        usersCanFree,
        setUsersCanFree
    }: Props
) {
    return (
        <div className="settings-visibility">
            <div className="body2">These are the default permissions to be applied to all Users created in your App. </div>
            <div className="body2 mb-32">Keep the recommended settings if you are not sure and you can come back to this later.</div>
            <div className="subtitle1">Profiles Visibility</div>
            <div className="caption mb-0">By default, User profiles can be viewed by any other Users and bots after they follow a correct link, a QR code or tap on it in the Chat. </div>
            <div className="caption">For tighter security and business logic driven sharing, you can disable this. Your Users will still be able to share their profiles with others, but they will have to do it explicitly via a special sharing link. </div>
            <RadioGroup value={defaultAccessProfileOpen} onChange={setDefaultAccessProfileOpen} aria-label="Server size" className="mb-32">
                <Field className="radio-button">
                    <Radio
                        value={true}
                        className="radio-button-input"
                    ></Radio>
                    <Label className="body2 radio-button-label">User Profiles can be viewed by others</Label>
                </Field>
                <Field className="radio-button">
                    <Radio
                        value={false}
                        className="radio-button-input"
                    ></Radio>
                    <Label className="body2 radio-button-label">User Profiles need to be explicitly shared by the User for others to see</Label>
                </Field>
            </RadioGroup>
            <div className="subtitle1">Assets Visibility</div>
            <div className="caption mb-0">Assets are Documents, Files, Media, Tokens (depending on what your App supports), stored within Users wallets.</div>
            <div className="caption mb-0">Depending on your App settings, Users either upload/create Assets themselves or these are managed by your own business logic via API.</div>
            <div className="caption mb-0">By default, other Users can see one’s Assets in one’s Profile. </div>
            <div className="caption mb-16">Alternative, more restricted setting, is where Assets are hidden. Profile will only display items such as name, photo, description, but no Assets. Users will still be able to share their Assets with others, but they will have to do it explicitly via a special sharing link, individually for each Asset.</div>
            <RadioGroup className="mb-32" value={defaultAccessAssetsOpen} onChange={setDefaultAccessAssetsOpen} aria-label="Server size">
                <Field className="radio-button">
                    <Radio
                        value={true}
                        className="radio-button-input"
                    ></Radio>
                    <Label className="body2 radio-button-label">All User’s Assets can be viewed by all who can view User’s Profile</Label>
                </Field>
                <Field className="radio-button">
                    <Radio
                        value={false}
                        className="radio-button-input"
                    ></Radio>
                    <Label className="body2 radio-button-label">User’s Assets are hidden. User has to explicitly share each Asset individually via a sharing link for others to see.</Label>
                </Field>
            </RadioGroup>
            <div className="subtitle1">App-locked accounts</div>
            <div className="caption mb-0">By default, your User accounts are App locked. This means that your Users can NOT sign on into other Apps within your Organization or any other Apps within the Server.</div>
            <div className="caption">You may switch this setting to Unlocked if you want your Users to have self-sovereign accounts which makes them free to login into other Apps in the Server, discover their content and fully control their own account.</div>
            <RadioGroup className="mb-32" value={usersCanFree} onChange={setUsersCanFree} aria-label="Server size">
                <Field className="radio-button">
                    <Radio
                        value={false}
                        className="radio-button-input"
                    ></Radio>
                    <Label className="body2 radio-button-label">All User accounts are tied to your App</Label>
                </Field>
                <Field className="radio-button">
                    <Radio
                        value={true}
                        className="radio-button-input"
                    ></Radio>
                    <Label className="body2 radio-button-label">User accounts are unlocked (self-sovereign)</Label>
                </Field>
            </RadioGroup>
        </div>
    )
}