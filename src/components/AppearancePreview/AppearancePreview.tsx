import { Safari } from "./Safari"
import { IPhone } from "./IPhone"

import "./AppearancePreview.scss"

export function AppearancePreview() {
    return (
        <div className="appearance-preview">
            <Safari />
            <IPhone />
        </div>
    )
}