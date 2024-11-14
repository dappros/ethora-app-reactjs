import { useRef } from 'react';
// import { AppearancePreview } from '../../../../components/AppearancePreview/AppearancePreview';
import { PopoverColorPicker } from '../../../../components/PopoverColorPicker';

import { actionPostFile } from '../../../../actions';
import SafariImage from '../../../../assets/safari.png';
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
  setLogoImage,
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
    // settings-appearance
    <div className="grid grid-rows-2 2xl:grid-cols-2 gap-[40px] p-4 ">
      <div className="">
        {/* inputs */}
        <div className="">
          {/* input-title */}
          <div className="font-sans font-medium text-base mb-4">
            Display Name
          </div>
          <input
            placeholder="Enter App's Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
            type="text"
          />
          <div className="font-sans font-medium text-base mb-4">Tagline</div>
          <input
            placeholder="Enter Tagline of Your App"
            className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
          <div className="font-sans font-medium text-base mb-4">Coin Name</div>
          <input
            placeholder="Enter Coin Name"
            className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
            type="text"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
          />
          <div className="font-sans font-medium text-base mb-4">Color</div>
          <div className="mb-4">
            <PopoverColorPicker color={color} onChange={onChangeColor} />
          </div>
          <div className="font-sans font-medium text-base mb-4">Logo</div>
          <div className="flex items-center justify-between">
            <span className="inline-block">Primary Logo</span>
            <span className="text-xs inline-block ml-auto text-gray-500">
              (Recommended size: 500px x 500px)
            </span>
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
            className="gen-secondary-btn mbc-16"
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
      <div className="border border-black flex justify-center items-center bg-safari">
        {/* className="w-[469px] h-[285px] border border-black bg-center bg-cover" */}
        <div
          className="w-[469px] h-[285px] border border-black bg-center bg-cover"
          style={{ backgroundImage: `url(${SafariImage})` }}
        ></div>
        {/* <img src={SafariImage} alt="" /> */}
        {/* <AppearancePreview
          color={color}
          logoImage={logoImage}
          sublogoImage={sublogoImage}
          tagline={tagline}
        /> */}
      </div>
    </div>
  );
}
