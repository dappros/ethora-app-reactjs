import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Box } from '@mui/material';
import classNames from 'classnames';
import { ReactElement, useMemo } from 'react';

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
  const memoTextStatusRag = useMemo(() => {
    return isRag
      ? size
        ? `RAG enabled ${size} MB`
        : 'RAG empty'
      : 'RAG disabled';
  }, [isRag, size]);

  return (
    <Box className="block sm:flex items-start sm:gap-16 md:gap-20">
      <Box>
        <div className="font-semibold font-sans text-[16px] mb-4">Status</div>
        <p className="font-sans text-sm pb-4 flex items-center gap-1">
          AI bot is:{' '}
          <PowerSettingsNewIcon
            color={statusBot ? 'success' : 'error'}
            fontSize="small"
          />{' '}
          {statusBot ? 'online' : 'offline'}
        </p>
        <button
          className="px-12 py-2 rounded-xl hover:bg-brand-hover border border-brand-500 text-brand-500 flex items-center justify-center mb-8"
          onClick={handleStatusChange}
        >
          <span className="">{statusBot ? 'stop' : 'start'}</span>
        </button>
      </Box>

      <Box>
        <div className="font-semibold font-sans text-[16px] mb-4">
          Local context
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
          <span className="">{isRag ? 'disabled' : 'enable'}</span>
        </button>
      </Box>

      <Box>
        <div className="font-semibold font-sans text-[16px] mb-4">Model</div>
        <p className="font-sans text-sm pb-4 flex items-center gap-1">
          GPT-4o-mini
        </p>
      </Box>
    </Box>
  );
};
