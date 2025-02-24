import { useRef } from 'react';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip } from '@mui/material';
import hexToRgba from 'hex-to-rgba';
import { actionPostFile } from '../../actions';
import { AppearanceRightImage } from '../../components/Appearance/AppearanceRightImage';
import { PopoverColorPicker } from '../../components/PopoverColorPicker';

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
  logoImage,
  setColor,
  setLogoImage,
  sublogoImage,
  setSublogoImage,
}: Props) {
  const logoRef = useRef<HTMLInputElement>(null);
  const sublogoRef = useRef<HTMLInputElement>(null);

  const onChangeColor = (color: string) => {
    console.log('color ', color);
    document.documentElement.style.setProperty(
      '--bg-brand-preview-auth',
      hexToRgba(color, '0.05')
    );
    setColor(color);
  };

  const postLogo = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      console.log('resp', resp.data.results[0].location);
      setLogoImage(resp.data.results[0].location);
    });
  };

  const postSublogo = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      console.log('resp', resp.data.results[0].location);
      setSublogoImage(resp.data.results[0].location);
    });
  };

  return (
    // settings-appearance
    // grid-rows-2 md:grid-cols-[1fr_minmax(500px,_1fr)] gap-[40px] p-4
    <>
      <div className="appearance-left">
        <div className="font-sans font-semibold text-base mb-4">
          Display Name
        </div>
        <input
          placeholder="Enter App's Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
        />
        <div className="font-sans font-semibold text-base mb-4">Tagline</div>
        <input
          placeholder="Enter Tagline of Your App"
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <div className="flex items-center mb-4">
          <div className="font-sans font-semibold text-base">Coin Name</div>
          <Tooltip
            title="The name of the in-app currency or token used for transactions and rewards."
            arrow
            placement="top"
          >
            <HelpOutlineIcon
              sx={{ width: '20px', height: '20px' }}
              className=" ml-2 text-gray-500 cursor-pointer"
            />
          </Tooltip>
        </div>
        <input
          placeholder="Enter Coin Name"
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
        />
        <div className="font-sans font-semibold text-base mb-4">Color</div>
        <div className="mb-4">
          <PopoverColorPicker color={color} onChange={onChangeColor} />
        </div>
        <div className="font-sans font-semibold text-base mb-4">Logo</div>
        <div className="flex items-center mb-2">
          <span className="font-sans font-semibold text-base">
            Primary Logo
          </span>
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
          className="w-full hover:bg-brand-hover p-2 border border-brand-500 rounded-xl text-brand-500 mb-4 text-[16px] font-varela"
        >
          Add logo
        </button>

        <div className="flex items-center mb-2">
          <p className="mr-2 font-sans font-semibold text-base">Submark logo</p>
          <div className="text-xs inline-block text-gray-500">(optional)</div>
          <Tooltip
            title="An additional logo used for icons and small branding spaces"
            placement="top"
            arrow
          >
            <HelpOutlineIcon
              sx={{ width: '20px', height: '20px' }}
              className=" ml-2 text-gray-500 cursor-pointer"
            />
          </Tooltip>
        </div>
        {sublogoImage && (
          <div className="w-fit bg-gray-100 p-2 rounded-xl flex mb-2">
            <img
              src={sublogoImage}
              alt="Primary Logo"
              className="max-w-[40px] max-h-[40px] object-contain"
            />
          </div>
        )}
        <input
          type="file"
          ref={sublogoRef}
          className="hidden"
          onChange={(e) => postSublogo(e.target.files && e.target.files[0])}
        />
        <button
          onClick={() => sublogoRef.current?.click()}
          className="w-full p-2 hover:bg-brand-hover border border-brand-500 rounded-xl text-brand-500 mb-4 text-[16px] font-varela"
        >
          Add logo
        </button>
      </div>
      <AppearanceRightImage
        color={color}
        tagline={tagline}
        logoImage={logoImage}
      />
    </>
  );
}
