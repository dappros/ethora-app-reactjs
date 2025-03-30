import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';
import { ModelApp } from '../models';
import { IconArrowRight } from './Icons/IconArrowRight';
import { IconExternalLink } from './Icons/IconExternalLink';
import { IconInfo } from './Icons/IconInfo';
import { Tooltip } from './Tooltip';

interface Props {
  app: ModelApp;
  primaryColor: string;
}

export function ApplicationPreview({ app, primaryColor }: Props) {
  const navigate = useNavigate();
  const numberFormatter = new Intl.NumberFormat('en-US')
  const onClick = () => {
    navigate(`/app/admin/apps/${app._id}/settings`, {
      state: { from: location.pathname + location.search },
    });
  };

  const onExternalClick = () => {
    window.open(
      `https://${app.domainName}.${import.meta.env.VITE_ROOT_DOMAIN}`,
      '_blank'
    );
  };

  const renderLogo = () => {
    if (app.logoImage) {
      return (
        // logo
        <div
          onClick={onClick}
          className="w-[120px] h-[120px] rounded-xl flex justify-center bg-gray-100 items-center bg-contain bg-no-repeat bg-center cursor-pointer"
          style={{ backgroundImage: `url(${app.logoImage})` }}
        ></div>

      );
    } else {
      return (
        <div onClick={onClick} className="w-[120px] h-[120px] rounded-xl bg-gray-100 flex justify-center items-center cursor-pointer">
          <span className="text-gray-500 font-varela text-[18px]">
            {app.displayName}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="grid grid-rows-[auto,_1fr] md:grid-cols-[auto,_1fr] gap-x-4 p-4 rounded-xl border border-gray-200 mb-4">
      <div className="flex justify-center items-center">{renderLogo()}</div>
      <div className="flex flex-col gap-8">
        {/* app title */}
        <div className="flex justify-center md:justify-between items-center">
          <div className="md:ml-[40px]">
            <div onClick={onClick} className="font-varela text-[18px] text-brand-500 hover:text-brand-darker text-center md:text-left cursor-pointer">
              {app.displayName}
            </div>
            <div className="font-sans text-[12px] text-gray-500">
              Created {DateTime.fromISO(app.createdAt).toFormat('dd LLL yyyy')}
            </div>
          </div>
          <div className="hidden md:flex items-ceter justify-center">
            <button onClick={onExternalClick} className="mr-4 w-[40px] h-[40px] rounded-xl flex items-center justify-center hover:bg-brand-hover">
              <IconExternalLink color={primaryColor} />
            </button>
            <button
              onClick={onClick}
              className="flex justify-center hover:bg-brand-hover items-center p-2 rounded-xl w-[134px] h-[40px] border border-brand-500"
            >
              <span className="text-brand-500 font-varela text-sm mr-2">
                Details
              </span>
              <IconArrowRight stroke={primaryColor} />
            </button>
          </div>
        </div>
        {/* stat */}
        <div className="grid grid-cols-2 gap-x-[33px] gap-y-4 grid-rows-3 md:grid-cols-3 md:grid-rows-2 lg:grid-cols-6 lg:grid-rows-1">
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">Users</span>
              <Tooltip title="Users registered (total vs 24h)" className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">{app.stats.totalRegistered}</span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">{app.stats.recentlyRegistered}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">Sessions</span>
              <Tooltip title="User sessions (total vs 24h)" className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">{numberFormatter.format(app.stats.totalSessions)}</span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">{numberFormatter.format(app.stats.recentlySessions)}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">Chats</span>
              <Tooltip title="Chat messages (total vs 24h)" className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">-</span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">-</span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">API</span>
              <Tooltip title="API calls (total vs 24h)" className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">{numberFormatter.format(app.stats.totalApiCalls)}</span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">{numberFormatter.format(app.stats.recentlyApiCalls)}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">Files</span>
              <Tooltip title="Files (total vs 24h)" className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">{numberFormatter.format(app.stats.totalFiles)}</span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">{numberFormatter.format(app.stats.recentlyFiles)}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">Web3</span>
              <Tooltip title="Blockchain transactions (total vs 24h)" className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">{numberFormatter.format(app.stats.totalTransactions)}</span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">{numberFormatter.format(app.stats.recentlyTransactions)}</span>
            </div>
          </div>
        </div>
        <div className="flex md:hidden">
          <button onClick={onExternalClick} className="mr-4">
            <IconExternalLink color={primaryColor} />
          </button>
          <button
            onClick={onClick}
            className="flex justify-center items-center p-2 rounded-xl w-full h-[40px] border border-brand-500"
          >
            <span className="text-brand-500 font-varela text-sm mr-2">
              Details
            </span>
            <IconArrowRight stroke={primaryColor} />
          </button>
        </div>
      </div>
    </div>
  );
}
