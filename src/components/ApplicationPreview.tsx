import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import { ModelApp } from '../models';
import { AppActionsMenu } from './AppActionsMenu';
import { IconArrowRight } from './Icons/IconArrowRight';
import { IconExternalLink } from './Icons/IconExternalLink';
import { IconInfo } from './Icons/IconInfo';
import { Tooltip } from './Tooltip';

interface Props {
  app: ModelApp;
  primaryColor: string;
  onChanged?: () => void;
}

function initialsFromName(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return '?';
  // Split on whitespace AND simple separators ("My-App", "My_App") so e.g.
  // "My-Cool-Thing" still resolves to "MT", not "M".
  const words = trimmed.split(/[\s_-]+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function ApplicationPreview({ app, primaryColor, onChanged }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const numberFormatter = new Intl.NumberFormat('en-US');
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
        <div
          onClick={onClick}
          className="w-[120px] h-[120px] rounded-xl flex justify-center bg-gray-100 items-center bg-contain bg-no-repeat bg-center cursor-pointer p-3"
        >
          <img src={app.logoImage} alt={t('applicationPreview.logoAlt')} className="w-full h-full object-contain rounded-md" />
        </div>
      );
    }
    // No logo uploaded: render a branded placeholder using the app's
    // primaryColor as the background, big white initials of the displayName,
    // and a subtle generic glyph in the corner. Way more recognisable than
    // the old truncated grey-on-grey displayName.
    const bg = app.primaryColor || '#0052CD';
    return (
      <div
        onClick={onClick}
        className="relative w-[120px] h-[120px] rounded-xl flex justify-center items-center cursor-pointer overflow-hidden"
        style={{ backgroundColor: bg }}
        title={app.displayName}
        aria-label={app.displayName}
      >
        <span className="text-white font-varela text-[44px] leading-none">
          {initialsFromName(app.displayName)}
        </span>
        {/* Subtle window/screen glyph in the corner so the placeholder
            still reads as an "app" tile even when initials are ambiguous. */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="absolute bottom-2 right-2 opacity-50"
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M3 9H21" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      </div>
    );
  };

  const isArchived = app.status === 'archived';
  // Tile is visually muted (greyed background, slightly desaturated logo) when
  // archived so a glance at the list distinguishes lifecycle state from a
  // healthy app, and the operator never confuses an archived app for one
  // they could still onboard users into.
  const containerClass = isArchived
    ? 'grid grid-rows-[auto,_1fr] md:grid-cols-[auto,_1fr] gap-x-4 p-4 rounded-xl border border-gray-200 mb-4 bg-gray-50 grayscale-[40%]'
    : 'grid grid-rows-[auto,_1fr] md:grid-cols-[auto,_1fr] gap-x-4 p-4 rounded-xl border border-gray-200 mb-4';

  return (
    <div className={containerClass}>
      {isArchived && (
        <div className="md:col-span-2 -mt-2 mb-2 text-xs text-gray-500 font-varela uppercase tracking-wide">
          {t('applicationPreview.archivedBadge')}
        </div>
      )}
      <div className="flex justify-center items-center">{renderLogo()}</div>
      <div className="flex flex-col gap-8">
        {/* app title */}
        <div className="flex justify-center md:justify-between items-center">
          <div className="md:ml-[40px]">
            <div
              onClick={onClick}
              className="font-varela text-[18px] text-brand-500 hover:text-brand-darker text-center md:text-left cursor-pointer"
            >
              {app.displayName}
            </div>
            <div className="font-sans text-[12px] text-gray-500">
              {t('applicationPreview.createdPrefix')} {DateTime.fromISO(app.createdAt).toFormat('dd LLL yyyy')}
            </div>
          </div>
          <div className="hidden md:flex items-ceter justify-center">
            <button
              onClick={onExternalClick}
              className="mr-2 w-[40px] h-[40px] rounded-xl flex items-center justify-center hover:bg-brand-hover"
            >
              <IconExternalLink color={primaryColor} />
            </button>
            <AppActionsMenu app={app} onChanged={onChanged} />
            <button
              onClick={onClick}
              className="ml-2 flex justify-center hover:bg-brand-hover items-center p-2 rounded-xl w-[134px] h-[40px] border border-brand-500"
            >
              <span className="text-brand-500 font-varela text-sm mr-2">
                {app.status === 'archived' ? t('applicationPreview.archived') : t('applicationPreview.details')}
              </span>
              <IconArrowRight stroke={primaryColor} />
            </button>
          </div>
        </div>
        {/* stat */}
        <div className="grid grid-cols-2 gap-x-[33px] gap-y-4 grid-rows-3 md:grid-cols-3 md:grid-rows-2 lg:grid-cols-7 lg:grid-rows-1">
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">{t('applicationPreview.stats.users')}</span>
              <Tooltip
                title={t('applicationPreview.stats.usersTooltip')}
                className="relative"
              >
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">
                {numberFormatter.format(app.stats.totalRegistered)}
              </span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">
                {app.stats.recentlyRegistered}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">{t('applicationPreview.stats.sessions')}</span>
              <Tooltip
                title={t('applicationPreview.stats.sessionsTooltip')}
                className="relative"
              >
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">
                {numberFormatter.format(app.stats.totalSessions)}
              </span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">
                {numberFormatter.format(app.stats.recentlySessions)}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">{t('applicationPreview.stats.chats')}</span>
              <Tooltip
                title={t('applicationPreview.stats.chatsTooltip')}
                className="relative"
              >
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">
                {numberFormatter.format(app.stats.totalChats)}
              </span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">
                {numberFormatter.format(app.stats.recentlyChats)}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">{t('applicationPreview.stats.api')}</span>
              <Tooltip title={t('applicationPreview.stats.apiTooltip')} className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">
                {numberFormatter.format(app.stats.totalApiCalls)}
              </span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">
                {numberFormatter.format(app.stats.recentlyApiCalls)}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">{t('applicationPreview.stats.ai')}</span>
              <Tooltip title={t('applicationPreview.stats.apiTooltip')} className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">
                {numberFormatter.format(app.stats.totalTokens)}
              </span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">
                {numberFormatter.format(app.stats.recentlyTokens)}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">{t('applicationPreview.stats.files')}</span>
              <Tooltip title={t('applicationPreview.stats.filesTooltip')} className="relative">
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">
                {numberFormatter.format(app.stats.totalFiles)}
              </span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">
                {numberFormatter.format(app.stats.recentlyFiles)}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-gray-500 font-sans text-xs flex items-center">
              <span className="mr-2">{t('applicationPreview.stats.web3')}</span>
              <Tooltip
                title={t('applicationPreview.stats.web3Tooltip')}
                className="relative"
              >
                <IconInfo />
              </Tooltip>
            </div>
            <div>
              <span className="font-sans text-sm">
                {numberFormatter.format(app.stats.totalTransactions)}
              </span>{' '}
              <span className="text-gray-500"> / </span>{' '}
              <span className="text-green-600 font-sans text-sm">
                {numberFormatter.format(app.stats.recentlyTransactions)}
              </span>
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
              {t('applicationPreview.details')}
            </span>
            <IconArrowRight stroke={primaryColor} />
          </button>
        </div>
      </div>
    </div>
  );
}
