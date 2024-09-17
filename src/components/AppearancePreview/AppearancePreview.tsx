import { Safari } from "./Safari"
import { IPhone } from "./IPhone"

import "./AppearancePreview.scss"
import { useEffect } from "react"
import hexToRgba from "hex-to-rgba"

interface Props {
    color: string,
    logoImage: string,
    sublogoImage: string,
    tagline: string
}

export function AppearancePreview({
    color,
    tagline,
    logoImage,
    sublogoImage
}: Props) {
    useEffect(() => {
        document.documentElement.style.setProperty('--bg-brand-primary-preview', hexToRgba(color, '0.08'))
    }, [color])
    
    return (
        <div className="appearance-preview">
            <Safari tagline={tagline} appLogo={logoImage} sublogo={sublogoImage} />
            <IPhone />
        </div>
    )
}
