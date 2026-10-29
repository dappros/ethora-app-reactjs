import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import hexToRgba from 'hex-to-rgba';
import { actionPostFile } from '../../actions';
import { Segmented } from '../../components/AIWidget/appearance/Fields';
import { AppearanceHelpModal } from '../../components/Appearance/AppearanceHelpModal';
import { LoginScreensPreview } from '../../components/Appearance/LoginScreensPreview';
import { PopoverColorPicker } from '../../components/PopoverColorPicker';
import { useTranslation } from '../../i18n/useTranslation';
import { ChatComponent } from './ChatComponent';

export type AppearanceSection = 'signin' | 'chat';

export const APPEARANCE_SECTION_PARAM = 'section';

interface Props {
  appId: string;
  brandColor?: string | null;
  previewUrl: string;
  displayName: string;
  setDisplayName: (s: string) => void;
  tagline: string;
  setTagline: (s: string) => void;
  color: string;
  setColor: (c: string) => void;
  logoImage: string;
  setLogoImage: (s: string) => void;
}

// Appearance has two parts behind one switch: the sign-in screen (name,
// tagline, colour and logo - saved with the page's Save button) and the chat
// (the chat component config - saved on its own, see ChatComponent).
export function Appearance({
  appId,
  brandColor,
  previewUrl,
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
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const section: AppearanceSection =
    searchParams.get(APPEARANCE_SECTION_PARAM) === 'chat' ? 'chat' : 'signin';

  const setSection = (next: AppearanceSection) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'chat') params.set(APPEARANCE_SECTION_PARAM, next);
    else params.delete(APPEARANCE_SECTION_PARAM);
    setSearchParams(params, { replace: true });
  };

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
    <div className="flex flex-col gap-4 min-w-0 pb-4">
      <div className="flex items-center gap-2 pt-4 lg:pt-0">
        <Segmented<AppearanceSection>
          ariaLabel={t('appSettingsAppearance.sectionLabel')}
          value={section}
          onChange={setSection}
          options={[
            {
              value: 'signin',
              label: t('appSettingsAppearance.sectionSignIn'),
            },
            { value: 'chat', label: t('appSettingsAppearance.sectionChat') },
          ]}
        />
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          aria-label={t('appSettingsAppearance.helpButtonLabel')}
          title={t('appSettingsAppearance.helpButtonLabel')}
          className="grid place-items-center w-[36px] h-[36px] rounded-xl text-gray-500 hover:text-brand-500 hover:bg-brand-hover shrink-0"
        >
          <HelpOutlineIcon sx={{ fontSize: 22 }} />
        </button>
      </div>
      {showHelp && <AppearanceHelpModal onClose={() => setShowHelp(false)} />}

      {section === 'signin' && (
        <div className="grid grid-cols-1 gap-y-6 2xl:grid-cols-[416px,_1fr] 2xl:gap-x-[40px] items-start">
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
          <LoginScreensPreview
            displayName={displayName}
            tagline={tagline}
            color={color}
            logoImage={logoImage}
            url={previewUrl}
          />
        </div>
      )}

      {section === 'chat' && (
        <ChatComponent
          appId={appId}
          brandColor={brandColor}
          previewUrl={previewUrl}
          inline
        />
      )}
    </div>
  );
}
