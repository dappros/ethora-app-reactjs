import { useState } from "react"
import { PopoverColorPicker } from "../../../../components/PopoverColorPicker"
import { ModelApp } from "../../../../models"
import { AppearancePreview } from "../../../../components/AppearancePreview/AppearancePreview"

import "./Appearance.scss"

interface Props {
    app: ModelApp
}

export function Appearance({ app }: Props) {
    const [color, setColor] = useState("#0052CD")

    const [displayName, setDisplayName] = useState(app.displayName)

    return (
        <div className="settings-appearance">
            <div className="left">
                <div className="inputs">
                    <div className="input-title">
                        Display Name
                    </div>
                    <input placeholder="Enter App's Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="gen-input input-medium mb-32" type="text" />
                    <div className="input-title">
                        Tagline
                    </div>
                    <input placeholder="Enter Tagline of Your App" className="gen-input input-medium mb-32" type="text" />
                    <div className="input-title">
                        Coin Name
                    </div>
                    <input placeholder="Enter Coin Name" className="gen-input input-medium mb-32" type="text" />
                    <div className="input-title">
                        Color
                    </div>
                    <div className="mb-32">
                        <PopoverColorPicker color={color} onChange={(color: string) => setColor(color)} />
                    </div>
                    <div className="input-title mb-16">
                        Logo
                    </div>
                    <div className="flex">
                        <p className="subtitle2">Primary Logo</p>
                        <div className="caption ml-8">(Recommended size: 500px x 500px)</div>
                    </div>
                    <button className="gen-secondary-btn mb-16">Add logo</button>
                    <div className="flex">
                        <p className="subtitle2">Submark logo</p>
                        <div className="caption ml-8">(optional)</div>
                    </div>
                    <button className="gen-secondary-btn">Add logo</button>
                </div>

            </div>
            <div className="right">
                <AppearancePreview />
            </div>
        </div>
    )
}
