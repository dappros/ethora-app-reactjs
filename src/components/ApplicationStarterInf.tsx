import appCreateImage from '../assets/app-craete-image.png';
import { useTranslation } from '../i18n/useTranslation';
import { IconClose } from './Icons/IconClose';

interface Props {
  onClose: () => void;
}

export function ApplicationStarterInf({ onClose }: Props) {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-[#F3F6FC] relative grid grid-rows-[3fr,_2fr] lg:grid-rows-1 lg:grid-cols-[minmax(600px,_3fr),_2fr] mb-4 rounded-xl">
      <div className="text-regular flex items-end lg:items-start font-varela">
        <div>
          <p>{t('applicationStarterInf.intro')}</p>
          <ul className="list-disc pl-6">
            <li>{t('applicationStarterInf.createBullet')}</li>
            <li>{t('applicationStarterInf.manageBullet')}</li>
          </ul>
        </div>
      </div>
      <div className="flex row-start-1 lg:row-start-auto justify-center">
        <div
          className="w-[247px] h-[152px] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${appCreateImage})` }}
        ></div>
      </div>
      <button
        className="absolute right-[10px] top-[10px]"
        onClick={() => onClose()}
      >
        <IconClose />
      </button>
    </div>
  );
}
