import { RadioGroup, Field, Label, Radio, } from "@headlessui/react"
import { useState } from "react"

import "./HomeScreen.scss"

export function HomeScreen() {
    const sreens = [
        'Profile / Wallet',
        'List of Chats',
        'Individual Chat specific for each User',
        'Specific group Chat for all Users',
    ]

    const captions = [
        'User will see their Profile and any documents or assets stored there. User will be able to share their profile or individual documents / assets.',
        'User will be see the list of chats available to them with tabs for Pinned, group and private chats.',
        'An individual Chat is created programmatically for the User for 1:1 Business-User communication. User does not see any other chats.',
        'All Users will have the same group chat automatically open for them. '
    ]

    const [selected, setSelected] = useState(sreens[1])

    return (
        <div className="settings-home-screen">
            <div className="body2 mb-32">
                Choose which screen your Users will see immediately after log in.
            </div>
            <RadioGroup value={selected} onChange={setSelected} aria-label="Server size">
                {
                    sreens.map((sreen, index) => {
                        return (
                            <>
                                <Field key={sreen} className="radio-button">
                                    <Radio
                                        value={sreen}
                                        className="radio-button-input"
                                    ></Radio>
                                    <Label className="body2 radio-button-label">{sreen}</Label>
                                </Field>
                                <p className="caption">
                                    {captions[index]}
                                </p>
                            </>

                        )
                    })
                }
            </RadioGroup>
        </div>
    )
}