import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Box } from '@mui/material';
import classNames from 'classnames';
import { ReactElement } from 'react';

const DISABLED = true;

interface HeaderAIWidgetProps {
  statusBot?: boolean;
  size: string | null;
  handleStatusChange?: () => void;
}

export const HeaderAIWidget = ({
  statusBot,
  size,
  handleStatusChange,
}: HeaderAIWidgetProps): ReactElement => {
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
        <p className="font-sans text-sm pb-4 flex items-center gap-1">
          RAG enabled {size ? `- ${size} MB` : '0 MB'}
        </p>
        <button
          disabled
          className={classNames(
            'px-8 py-2 rounded-xl hover:bg-brand-hover border border-brand-500 text-brand-500 flex items-center justify-center mb-8',
            DISABLED && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="">disabled</span>
        </button>
      </Box>

      <Box>
        <div className="font-semibold font-sans text-[16px] mb-4">Model</div>
        <p className="font-sans text-sm pb-4 flex items-center gap-1">
          Open GPT-4o-mini
        </p>
      </Box>
    </Box>
  );
};
