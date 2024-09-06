import "./MobileApp.scss"

export function MobileApp() {
    return (
        <div className="settings-mobile">
            <div className="subtitle1">
                Mobile App
            </div>
            <div className="caption">
                Please enter Bundle ID. Bundle ID should be unique to identify your app for Appstore and other purposes.
            </div>
            <div className="form-controls">
                <input type="text" className="gen-input input-medium mb-16" placeholder="Bundle ID" />
                <button className="gen-secondary-btn mb-32">Prepare React Native Build</button>
                <div className="subtitle1 mb-16">Android build</div>
                <div className="subtitle2">Google Services JSON</div>
                <button className="gen-secondary-btn mb-16">Upload</button>
                <div className="subtitle2">Firebase server key (for push notifications)</div>
                <input type="text" placeholder="Firebase Server Key" className="gen-input input-medium mb-32"/>
                <div className="subtitle1 mb-16">IOS build</div>
                <div className="subtitle2">Google Services PLIST</div>
                <button className="gen-secondary-btn mb-16">Upload</button>
                <div className="subtitle2">Push Notifications Certificate (Apple)</div>
                <button className="gen-secondary-btn mb-16">Upload</button>
            </div>
        </div>
    )
}