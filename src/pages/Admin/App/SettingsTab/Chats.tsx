import { Checkbox, Field, Label } from "@headlessui/react"
import { useState } from "react"
import "./Chats.scss"

export function Chats() {
    const [enableCreateChats, setEnableCreateChats] = useState(false)

    return (
        <div className="settings-chats">
            <p className="subtitle1 mb-16">
                New Chats
            </p>
            <Field className="checkbox mb-6">
                <Checkbox
                    className="checkbox-input"
                    checked={enableCreateChats}
                    onChange={setEnableCreateChats}
                >
                </Checkbox>
                <Label className="label">
                    Allow Users to create new Chats
                </Label>
            </Field>
            <p className="caption mb-32">When enabled, your Users can create new Chats and invite other Users there. When disabled, only pre-existing Chats or Chats created by your business can be used.</p>
            <p className="subtitle1">Pinned Chats</p>
            <p className="caption">Pinned or “starred” Chats are permanent chat rooms that your Users will automatically see and join. </p>

        </div>
    )
}
