import { useRef } from 'react';

import hexToRgba from 'hex-to-rgba';
import { actionPostFile } from '../../actions';
import { AppearanceRightImage } from '../../components/Appearance/AppearanceRightImage';
import { PopoverColorPicker } from '../../components/PopoverColorPicker';
import { useTranslation } from '../../i18n/useTranslation';

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
  const { t } = useTranslation();

  const onChangeColor = (color: string) => {
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
      setLogoImage(resp.data.results[0].location);
    });
  };

  return (
    // settings-appearance
    // grid-rows-2 md:grid-cols-[1fr_minmax(500px,_1fr)] gap-[40px] p-4
    <>
      <div className="appearance-left">
        <div className="font-sans font-semibold text-base mb-4">
          {t('appSettingsAppearance.displayNameLabel')}
        </div>
        <input
          placeholder={t('appSettingsAppearance.displayNamePlaceholder')}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
        />
        <div className="font-sans font-semibold text-base mb-4">
          {t('appSettingsAppearance.taglineLabel')}
        </div>
        <input
          placeholder={t('appSettingsAppearance.taglinePlaceholder')}
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <div className="font-sans font-semibold text-base mb-4">
          {t('appSettingsAppearance.colorLabel')}
        </div>
        <div className="mb-4">
          <PopoverColorPicker color={color} onChange={onChangeColor} />
        </div>
        <div className="xs:flex items-center justify-between">
          <div className="font-sans font-semibold text-base mb-4">
            {t('appSettingsAppearance.logoLabel')}
          </div>
          <div className="flex items-center mb-2">
            <span className="text-xs inline-block ml-auto text-gray-500">
              {t('appSettingsAppearance.logoRecommendedSize')}
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
          {t('appSettingsAppearance.addLogoButton')}
        </button>
      </div>
      <AppearanceRightImage
        displayName={displayName}
        color={color}
        tagline={tagline}
        logoImage={logoImage}
      />
    </>
  );
}
