import { useRef } from 'react';
import { actionPostFile } from '../../actions';
import './MobileApp.scss';

interface Props {
  bundleId: string;
  setBundleId: (s: string) => void;
  setGoogleServicesJson: (s: string) => void;
  setGoogleServiceInfoPlist: (s: string) => void;
}

export function MobileApp({
  bundleId,
  setBundleId,
  setGoogleServicesJson,
  setGoogleServiceInfoPlist,
}: Props) {
  const googleJsonRef = useRef<HTMLInputElement>(null);
  const plistFileRef = useRef<HTMLInputElement>(null);

  const onGoogleJsonRefChanges = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      setGoogleServicesJson(resp.data.results[0].location);
    });
  };

  const onPlistFileChange = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      setGoogleServiceInfoPlist(resp.data.results[0].location);
    });
  };

  return (
    <div className="settings-mobile">
      <div className="subtitle1">Mobile App</div>
      <div className="caption">
        Please enter Bundle ID. Bundle ID should be unique to identify your app
        for Appstore and other purposes.
      </div>
      <div className="form-controls">
        <input
          type="text"
          className="gen-input input-medium mbc-16"
          placeholder="Bundle ID"
          value={bundleId}
          onChange={(e) => setBundleId(e.target.value)}
        />
        <button className="gen-secondary-btn mbc-32">
          Prepare React Native Build
        </button>
        <div className="subtitle1 mbc-16">Android build</div>
        <div className="subtitle2">Google Services JSON</div>
        <input
          type="file"
          ref={googleJsonRef}
          accept=".json"
          className="hidden"
          onChange={(e) =>
            onGoogleJsonRefChanges(e.target.files && e.target.files[0])
          }
        />
        <button
          className="gen-secondary-btn mbc-16"
          onClick={() => googleJsonRef.current?.click()}
        >
          Upload
        </button>
        {/* <div className="subtitle2">Firebase server key (for push notifications)</div>
                <input type="text" placeholder="Firebase Server Key" className="gen-input input-medium mbc-32"/> */}
        <div className="subtitle1 mbc-16">IOS build</div>
        <div className="subtitle2">Google Services PLIST</div>
        <input
          type="file"
          ref={plistFileRef}
          accept=".plist"
          className="hidden"
          onChange={(e) =>
            onPlistFileChange(e.target.files && e.target.files[0])
          }
        />
        <button
          onClick={() => plistFileRef.current?.click()}
          className="gen-secondary-btn mbc-16"
        >
          Upload
        </button>
        {/* <div className="subtitle2">Push Notifications Certificate (Apple)</div>
                <button className="gen-secondary-btn mbc-16">Upload</button> */}
      </div>
    </div>
  );
}
