import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Box } from '@mui/material';
import classNames from 'classnames';
import { ReactElement, useMemo } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

interface HeaderAIWidgetProps {
  isRag: boolean;
  statusBot?: boolean;
  size: string | null;
  handleStatusChange?: () => void;
  handleRagChange?: () => void;
}

export const HeaderAIWidget = ({
  isRag,
  statusBot,
  size,
  handleStatusChange,
  handleRagChange,
}: HeaderAIWidgetProps): ReactElement => {
  const { t } = useTranslation();
  const memoTextStatusRag = useMemo(() => {
    return isRag
      ? size
        ? t('aiWidgetHeader.ragEnabled').replace('{size}', String(size))
        : t('aiWidgetHeader.ragEmpty')
      : t('aiWidgetHeader.ragDisabled');
  }, [isRag, size, t]);

  return (
    <Box className="block sm:flex items-start sm:gap-16 md:gap-20">
      <Box>
        <div className="font-semibold font-sans text-[16px] mb-4">{t('aiWidgetHeader.statusTitle')}</div>
        <p className="font-sans text-sm pb-4 flex items-center gap-1">
          {t('aiWidgetHeader.aiBotIsLabel')}{' '}
          <PowerSettingsNewIcon
            color={statusBot ? 'success' : 'error'}
            fontSize="small"
          />{' '}
          {statusBot ? t('aiWidgetHeader.online') : t('aiWidgetHeader.offline')}
        </p>
        <button
          className="px-12 py-2 rounded-xl hover:bg-brand-hover border border-brand-500 text-brand-500 flex items-center justify-center mb-8"
          onClick={handleStatusChange}
        >
          <span className="">{statusBot ? t('aiWidgetHeader.stop') : t('aiWidgetHeader.start')}</span>
        </button>
      </Box>

      <Box>
        <div className="font-semibold font-sans text-[16px] mb-4">
          {t('aiWidgetHeader.localContextTitle')}
        </div>
        <p
          className={classNames(
            'font-sans text-sm pb-4 flex items-center gap-1',
            !isRag && 'text-red-500'
          )}
        >
          {memoTextStatusRag}
        </p>
        <button
          onClick={handleRagChange}
          className={classNames(
            'px-8 py-2 rounded-xl hover:bg-brand-hover border border-brand-500 text-brand-500 flex items-center justify-center mb-8'
          )}
        >
          <span className="">{isRag ? t('aiWidgetHeader.disableButton') : t('aiWidgetHeader.enableButton')}</span>
        </button>
      </Box>

      <Box>
        <div className="font-semibold font-sans text-[16px] mb-4">{t('aiWidgetHeader.modelTitle')}</div>
        <p className="font-sans text-sm pb-4 flex items-center gap-1">
          GPT-4o-mini
        </p>
      </Box>
    </Box>
  );
};
