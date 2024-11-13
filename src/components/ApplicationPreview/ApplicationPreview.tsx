import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';
import { IconExternalLink } from '../Icons/IconExternalLink';
import { IconInfo } from '../Icons/IconInfo';

import { ModelApp } from '../../models';
import './ApplicationPreview.scss';

interface Props {
  app: ModelApp;
  primaryColor: string;
}

export function ApplicationPreview({ app, primaryColor }: Props) {
  const navigate = useNavigate();
  const onClick = () => {
    navigate(`/app/admin/application/${app._id}/settings`);
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
        <div className="logo">
          <div
            className="logo-content"
            style={{ backgroundImage: `url(${app.logoImage})` }}
          ></div>
        </div>
      );
    } else {
      return (
        <div className="logo">
          <div className="logo-content no-content">
            <span>{app.displayName}</span>
          </div>
        </div>
      );
    }
  };
  return (
    <div className="application-preview">
      {renderLogo()}
      <div className="inf-title">
        <span className="app-name">{app.displayName}</span>
        <span className="app-created">
          Created {DateTime.fromISO(app.createdAt).toFormat('dd LLL yyyy')}
        </span>
      </div>
      <div className="inf-actions">
        <button onClick={onExternalClick} className="mr-[24px]">
          <IconExternalLink color={primaryColor} />
        </button>
        <button onClick={onClick} className="secondary-btn">
          Details
        </button>
      </div>
      <div className="app-stat">
        <div className="stat-block">
          <div className="stat-title">
            <span>Users</span>
            <IconInfo />
          </div>
          <div className="stat-data">
            <span className="stat-all">{app.stats?.totalRegistered}</span>
            <span className="stat-sep">/</span>
            <span className="stat-today">{app.stats?.recentlyRegistered}</span>
          </div>
        </div>
        <div className="stat-block">
          <div className="stat-title">
            <span>Sessions</span>
            <IconInfo />
          </div>
          <div className="stat-data">
            <span className="stat-all">{app.stats?.totalSessions}</span>
            <span className="stat-sep">/</span>
            <span className="stat-today">{app.stats?.recentlySessions}</span>
          </div>
        </div>
        <div className="stat-block">
          <div className="stat-title">
            <span>Chats</span>
            <IconInfo />
          </div>
          <div className="stat-data">
            <span className="stat-all">-</span>
            <span className="stat-sep">/</span>
            <span className="stat-today">-</span>
          </div>
        </div>
        <div className="stat-block">
          <div className="stat-title">
            <span>API</span>
            <IconInfo />
          </div>
          <div className="stat-data">
            <span className="stat-all">{app.stats?.totalApiCalls}</span>
            <span className="stat-sep">/</span>
            <span className="stat-today">{app.stats?.recentlyApiCalls}</span>
          </div>
        </div>
        <div className="stat-block">
          <div className="stat-title">
            <span>Files</span>
            <IconInfo />
          </div>
          <div className="stat-data">
            <span className="stat-all">{app.stats?.totalFiles}</span>
            <span className="stat-sep">/</span>
            <span className="stat-today">{app.stats?.recentlyFiles}</span>
          </div>
        </div>
        <div className="stat-block">
          <div className="stat-title">
            <span>Web3</span>
            <IconInfo />
          </div>
          <div className="stat-data">
            <span className="stat-all">{app.stats?.totalTransactions}</span>
            <span className="stat-sep">/</span>
            <span className="stat-today">
              {app.stats?.recentlyTransactions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
