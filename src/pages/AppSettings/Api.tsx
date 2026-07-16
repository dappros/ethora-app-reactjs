import cn from 'classnames';
import { CopyButton } from '../../components/CopyButton';
import { Secret } from '../../components/Secret';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';
import './Api.scss';

interface Props {
  app: ModelApp;
}

export const Api = ({ app }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden">
      <div className="font-semibold font-sans text-normal mb-4">
        {t('appSettingsApi.heading')}
      </div>
      <p className="text-gray-500 text-sm font-sans">
        {t('appSettingsApi.description')}
      </p>
      <p className="text-gray-500 text-sm font-sans mb-4">
        {t('appSettingsApi.rotateNote')}
      </p>

      <div className="p-4 border border-gray-200 rounded-xl">
        <div className="mx-2 hidden-scroll overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="w-1/2 r-delimiter px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-l-lg">
                  {t('appSettingsApi.keyColumn')}
                </th>
                <th className="w-1/2 px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-r-lg">
                  {t('appSettingsApi.secretColumn')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={cn('hover:!bg-[#F5F7F9]')}>
                <td className="r-delimiter px-4 py-[20px] font-sans font-normal text-sm rounded-l-lg">
                  <div className="flex justify-items-center">
                    <span className="mr-2">{app._id}</span>
                    <CopyButton value={app._id} />
                  </div>
                </td>
                <td className=" px-4 font-sans font-normal text-sm text-center rounded-r-lg whitespace-nowrap">
                  <div className="flex justify-items-center">
                    <Secret className="mr-2" value={app.appSecret} />
                    <CopyButton value={app.appSecret} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
