import { useCallback, useEffect, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { actionSwitchChatApp } from '../actions';
import { IconArrowLeft } from '../components/Icons/IconArrowLeft';
import { httpGetApp } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { Error404Page } from './ErrorPage/Error404Page';

export default function AdminApp() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const location = useLocation();
  const apps = useAppStore((s) => s.apps);
  const doSetApp = useAppStore((s) => s.doSetApp);
  const app = apps.find((app) => app._id === appId);
  const navigate = useNavigate();
  const [isValidApp, setIsValidApp] = useState<boolean>(true);

  const goBack = useCallback(() => {
    const backUrl = location.state?.from;
    navigate(backUrl || '/app/admin/apps');
  }, [location.state?.from, navigate]);

  useEffect(() => {
    if (!appId) return;

    const getApp = async () => {
      try {
        const response = await httpGetApp(appId);
        doSetApp(response.data.result);
      } catch (e) {
        setIsValidApp(false);
        console.error(e);
      }
    };

    getApp();
  }, [appId, doSetApp]);

  if (!isValidApp) {
    return (
      <Error404Page navigateUrl={location.state?.from || '/app/admin/apps/'} />
    );
  }

  return (
    // overflow-hidden
    <div className="h-full  grid grid-rows-[auto,_1fr]">
      <div className="mb-4 flex md:flex-row flex-col md:justify-between">
        <div className="pl-4 pt-2 flex mb-4 md:mb-0">
          <button className="ml-[5px] md:mb-0 mr-[13px]" onClick={goBack}>
            <IconArrowLeft />
          </button>

          <div className="font-varela  text-[24px] md:text-[34px]">
            {app?.displayName}
          </div>
        </div>
        {/* Per-App segmented nav. The Chats segment (Option A) opens the
            sidebar Chats page in this app's owner context, so admins can
            jump straight into testing without manually picking the app
            from the switcher. The onClick eagerly switches chatAppId so
            the destination renders the right context immediately rather
            than after a hydration round-trip on Chat.tsx mount. */}
        <div className="grid justify-center content-center grid-cols-4 w-auto md:w-full md:max-w-[520px] md:mr-[32px] px-4">
          <NavLink
            className="aria-[current=page]:bg-brand-500 hover:bg-brand-hover aria-[current=page]:text-white border border-r-0 border-brand-500 block text-center rounded-l-xl items-center py-2 px-4"
            to={`/app/admin/apps/${appId}/users`}
          >
            {t('adminApp.tabUsers')}
          </NavLink>
          <NavLink
            className="aria-[current=page]:bg-brand-500 hover:bg-brand-hover aria-[current=page]:text-white border border-r-0 border-brand-500 block text-center items-center py-2 px-4"
            to={`/app/admin/apps/${appId}/settings`}
          >
            {t('adminApp.tabSettings')}
          </NavLink>
          <NavLink
            className="aria-[current=page]:bg-brand-500 hover:bg-brand-hover aria-[current=page]:text-white border border-r-0 border-brand-500 block text-center items-center py-2 px-4"
            to={`/app/admin/apps/${appId}/statistics`}
          >
            {t('adminApp.tabStatistics')}
          </NavLink>
          <NavLink
            className="aria-[current=page]:bg-brand-500 hover:bg-brand-hover aria-[current=page]:text-white border border-brand-500 block text-center rounded-r-xl items-center py-2 px-4"
            to="/app/chat"
            onClick={() => {
              if (!appId) return;
              // Fire-and-forget: the destination page will retry on
              // mount if this fails. We intentionally don't await so
              // the navigation feels instant; any error toast surfaces
              // from Chat.tsx's hydration effect.
              actionSwitchChatApp(appId).catch(() => {});
            }}
          >
            {t('adminApp.tabChats')}
          </NavLink>
        </div>
      </div>
      {/* overflow-hidden */}
      <div className="bg-white rounded-2xl p-4">
        <Outlet />
      </div>
    </div>
  );
}
