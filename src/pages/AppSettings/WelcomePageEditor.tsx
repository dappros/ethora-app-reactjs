import { useRef, useState } from 'react';
import { actionPostFile } from '../../actions';
import type { WelcomeOptions } from './welcomeOptions';
import { Segmented } from '../../components/AIWidget/appearance/Fields';
import { WelcomeArtwork } from '../../components/Appearance/WelcomeArtwork';
import { useTranslation } from '../../i18n/useTranslation';
import { isWebImageUrl } from '../../utils/welcomeImage';

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const inputClass = 'mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-950';
const actionClass = 'rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50';

export function WelcomePageEditor({ value, onChange }: {
  value: WelcomeOptions;
  onChange: (patch: Partial<WelcomeOptions>) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function uploadArtwork(file: File) {
    setError('');
    if (!imageTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError(t('welcomeScreen.invalidFile'));
      return;
    }
    setUploading(true);
    try {
      const { data } = await actionPostFile(file);
      const location = data.results?.[0]?.location;
      if (!isWebImageUrl(location)) throw new Error('Missing image URL');
      onChange({ welcomeImage: location });
    } catch {
      setError(t('welcomeScreen.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }

  return <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
    <header>
      <h3 className="text-base font-semibold">{t('welcomeScreen.title')}</h3>
      <p className="mt-1 text-sm text-gray-600">{t('welcomeScreen.intro')}</p>
    </header>
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{t('welcomeScreen.imageHeading')}</h4>
        <p className="mt-1 text-xs text-gray-600">{t('welcomeScreen.imageHint')}</p>
      </div>
      {value.welcomeImage && <WelcomeArtwork key={value.welcomeImage} src={value.welcomeImage} fit={value.welcomeImageFit} className="max-h-32" />}
      <input ref={fileInput} type="file" accept={imageTypes.join(',')} aria-label={t('welcomeScreen.imageInputLabel')} className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void uploadArtwork(file);
        }} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={actionClass} disabled={uploading} onClick={() => fileInput.current?.click()}>
          {uploading ? t('welcomeScreen.uploading') : value.welcomeImage ? t('welcomeScreen.replaceImage') : t('welcomeScreen.uploadImage')}
        </button>
        {value.welcomeImage && <button type="button" className={actionClass} disabled={uploading} onClick={() => {
          setError('');
          onChange({ welcomeImage: '' });
        }}>{t('welcomeScreen.removeImage')}</button>}
      </div>
      {value.welcomeImage && <div className="space-y-2">
        <p className="text-sm font-medium">{t('welcomeScreen.imageFit')}</p>
        <Segmented
          ariaLabel={t('welcomeScreen.imageFit')}
          size="sm"
          value={value.welcomeImageFit}
          onChange={(welcomeImageFit) => onChange({ welcomeImageFit })}
          options={[
            { value: 'cover', label: t('welcomeScreen.fitCover') },
            { value: 'contain', label: t('welcomeScreen.fitContain') },
          ]}
        />
      </div>}
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    </div>
    <label className="block text-sm font-medium">{t('welcomeScreen.headingLabel')}
      <input className={inputClass} maxLength={100} value={value.welcomeTitle} placeholder={t('welcomeScreen.headingPlaceholder')}
        onChange={(event) => onChange({ welcomeTitle: event.target.value })} />
    </label>
    <label className="block text-sm font-medium">{t('welcomeScreen.messageLabel')}
      <textarea className={inputClass} maxLength={320} rows={3} value={value.welcomeDescription}
        placeholder={t('welcomeScreen.messagePlaceholder')}
        onChange={(event) => onChange({ welcomeDescription: event.target.value })} />
    </label>
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{t('welcomeScreen.layoutLabel')}</legend>
      <div className="grid grid-cols-2 gap-2">
        {([{ key: 'split', label: t('welcomeScreen.layoutSplit') }, { key: 'centered', label: t('welcomeScreen.layoutCentered') }] as const).map(({ key, label }) => (
          <label key={key} className="cursor-pointer">
            <input type="radio" name="welcome-layout" value={key} checked={value.welcomeLayout === key} className="peer sr-only"
              onChange={() => onChange({ welcomeLayout: key })} />
            <span className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-2 py-2 text-center text-xs font-semibold peer-checked:border-brand-500 peer-checked:text-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500">
              <span aria-hidden="true" className={`flex items-center gap-1 rounded-md border border-gray-300 p-1 ${key === 'centered' ? 'flex-col' : 'flex-row'}`}>
                <span className="h-2.5 w-4 rounded-sm bg-brand-500 opacity-75" />
                <span className="h-2.5 w-4 rounded-sm bg-gray-400" />
              </span>
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  </section>;
}
