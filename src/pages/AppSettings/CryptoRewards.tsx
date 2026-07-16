import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip } from '@mui/material';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  coinName: string;
  setCoinName: (s: string) => void;
}

export function CryptoRewards({ coinName, setCoinName }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <div className="appearance-left">
        <div className="flex items-center mb-4">
          <div className="font-sans font-semibold text-base">
            {t('appSettingsCryptoRewards.coinNameLabel')}
          </div>
          <Tooltip
            title={t('appSettingsCryptoRewards.coinNameTooltip')}
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
          placeholder={t('appSettingsCryptoRewards.coinNamePlaceholder')}
          className="bg-gray-100 py-2 px-4 rounded-xl w-full mb-4"
          type="text"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
        />
      </div>
    </>
  );
}
