import { useRef } from 'react';
import { AppearancePreview } from '../../../../components/AppearancePreview/AppearancePreview';
import { PopoverColorPicker } from '../../../../components/PopoverColorPicker';

import { actionPostFile } from '../../../../actions';
import './Appearance.scss';

interface Props {
  displayName: string;
  setDisplayName: (s: string) => void;
  tagline: string;
  setTagline: (s: string) => void;
  coinName: string;
  setCoinName: (s: string) => void;
  color: string;
  setColor: (c: string) => void;
  logoImage: string;
  setLogoImage: (s: string) => void;
  sublogoImage: string;
  setSublogoImage: (s: string) => void;
}

export function Appearance({
  displayName,
  setDisplayName,
  tagline,
  setTagline,
  coinName,
  setCoinName,
  color,
  setColor,
  logoImage,
  setLogoImage,
  sublogoImage,
  setSublogoImage,
}: Props) {
  const logoRef = useRef<HTMLInputElement>(null);
  const sublogoRef = useRef<HTMLInputElement>(null);

  const onChangeColor = (color: string) => {
    console.log('color ', color);
    // document.documentElement.style.setProperty('--bg-brand-primary', color);
    setColor(color);
  };

  const postLogo = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) =>
      setLogoImage(resp.data.results[0].location)
    );
  };

  const postSublogo = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) =>
      setSublogoImage(resp.data.results[0].location)
    );
  };

  return (
    <div className="settings-appearance">
      <div className="left">
        <div className="inputs">
          <div className="input-title">Display Name</div>
          <input
            placeholder="Enter App's Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="gen-input input-medium mb-32"
            type="text"
          />
          <div className="input-title">Tagline</div>
          <input
            placeholder="Enter Tagline of Your App"
            className="gen-input input-medium mb-32"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
          <div className="input-title">Coin Name</div>
          <input
            placeholder="Enter Coin Name"
            className="gen-input input-medium mb-32"
            type="text"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
          />
          <div className="input-title">Color</div>
          <div className="mb-32">
            <PopoverColorPicker color={color} onChange={onChangeColor} />
          </div>
          <div className="input-title mb-16">Logo</div>
          <div className="flex">
            <p className="subtitle2">Primary Logo</p>
            <div className="caption ml-8">
              (Recommended size: 500px x 500px)
            </div>
          </div>
          <input
            type="file"
            onChange={(e) => postLogo(e.target.files && e.target.files[0])}
            ref={logoRef}
            className="hidden"
            id="logo-file"
          />
          <button
            onClick={() => logoRef.current?.click()}
            className="gen-secondary-btn mb-16"
          >
            Add logo
          </button>

          <div className="flex">
            <p className="subtitle2">Submark logo</p>
            <div className="caption ml-8">(optional)</div>
          </div>
          <input
            type="file"
            ref={sublogoRef}
            className="hidden"
            onChange={(e) => postSublogo(e.target.files && e.target.files[0])}
          />
          <button
            onClick={() => sublogoRef.current?.click()}
            className="gen-secondary-btn"
          >
            Add logo
          </button>
        </div>
      </div>
      <div className="right">
        <AppearancePreview
          color={color}
          logoImage={logoImage}
          sublogoImage={sublogoImage}
          tagline={tagline}
        />
      </div>
    </div>
  );
}
