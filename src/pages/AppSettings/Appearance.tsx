import { useRef } from 'react';

import hexToRgba from 'hex-to-rgba';
import { actionPostFile } from '../../actions';
import { AppearanceRightImage } from '../../components/Appearance/AppearanceRightImage';
import { PopoverColorPicker } from '../../components/PopoverColorPicker';

interface Props {
  displayName: string;
  setDisplayName: (s: string) => void;
  tagline: string;
  setTagline: (s: string) => void;
  color: string;
  setColor: (c: string) => void;
  logoImage: string;
  setLogoImage: (s: string) => void;
}

export function Appearance({
  displayName,
  setDisplayName,
  tagline,
  setTagline,
  color,
  logoImage,
  setColor,
  setLogoImage,
}: Props) {
  const logoRef = useRef<HTMLInputElement>(null);

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
        <div className="font-sans font-semibold text-base mb-4">Color</div>
        <div className="mb-4">
          <PopoverColorPicker color={color} onChange={onChangeColor} />
        </div>
        <div className="xs:flex items-center justify-between">
          <div className="font-sans font-semibold text-base mb-4">Logo</div>
          <div className="flex items-center mb-2">
            <span className="text-xs inline-block ml-auto text-gray-500">
              (Recommended size: 500px x 500px)
            </span>
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
          className="w-full hover:bg-brand-hover p-2 border border-brand-500 rounded-xl text-brand-500 mb-4 text-[16px] font-varela"
        >
          Add logo
        </button>

        <div className="border-t border-t-gray-200 hidden 2xl:block">
          <p className="text-xs text-gray-500 py-4">
            Need assistance? Create a topic in our{' '}
            <a
              href="https://forum.ethora.com/"
              target="_blank"
              className="text-brand-500 underline"
            >
              Community Forum.
            </a>
          </p>
        </div>
      </div>
      <AppearanceRightImage
        displayName={displayName}
        color={color}
        tagline={tagline}
        logoImage={logoImage}
      />
      <div className="border-t border-t-gray-200 block 2xl:hidden">
        <p className="text-xs text-gray-500 py-4">
          Need assistance? Create a topic in our{' '}
          <a
            href="https://forum.ethora.com/"
            target="_blank"
            className="text-brand-500 underline"
          >
            Community Forum.
          </a>
        </p>
      </div>
    </>
  );
}
