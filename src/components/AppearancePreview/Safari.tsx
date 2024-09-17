import "./Safari.scss"

interface Props {
    tagline: string,
    appLogo: string,
    sublogo: string
}

export function Safari({tagline, appLogo, sublogo}: Props) {
    return (
        <div className="safari-preview">
            <div className="wrap">
                <div className="wrapwrap">
                    <div className="left">
                        <div className="logo" style={{backgroundImage: `url('${appLogo}')`}}></div>
                        <div className="slogan">
                            {tagline}
                        </div>
                    </div>
                    <div className="right">
                        <div className="form">

                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
