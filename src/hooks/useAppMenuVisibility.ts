import { useEffect, useState } from 'react';
import { httpGetMyAppAcl } from '../http';
import { useAppStore } from '../store/useAppStore';
import { isBaseAppHost } from '../utils/appHost';

const managementAreas = ['appSettings', 'appUsers', 'appTokens', 'appPush', 'appStats'] as const;

export function useAppMenuVisibility() {
  const app = useAppStore((state) => state.currentApp);
  const user = useAppStore((state) => state.currentUser);
  const items = app?.availableMenuItems;
  const baseApp = isBaseAppHost();
  const managementAvailable = baseApp && !!app?.isAllowedNewAppCreate;
  const ownerOrSuperAdmin = !!user && (
    (!!user._id && app?.creatorId === user._id) || !!(user.isSuperAdmin?.read || user.isSuperAdmin?.write)
  );
  const hasHiddenItems = [items?.projects, items?.assistants, items?.license, items?.help].includes(false);
  const session = baseApp && app?._id && user?._id && hasHiddenItems && !ownerOrSuperAdmin
    ? `${app._id}:${user._id}`
    : null;
  const [aclAdminSession, setAclAdminSession] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    httpGetMyAppAcl().then(({ data }) => {
      // Creating a project is open to members on some servers. Only management
      // grants (including a collaborator's grants on a project) count here.
      const canManage = data.result?.some(({ application }) =>
        managementAreas.some((area) => Object.values(application?.[area] || {}).some((flag) => flag === true))
      );
      if (!cancelled) setAclAdminSession(canManage ? session : null);
    }).catch(() => {
      if (!cancelled) setAclAdminSession(null);
    });
    return () => { cancelled = true; };
  }, [session]);

  const admin = ownerOrSuperAdmin || (session !== null && aclAdminSession === session);
  return {
    projects: managementAvailable && (admin || items?.projects !== false),
    assistants: managementAvailable && (admin || items?.assistants !== false),
    license: managementAvailable && (admin || items?.license !== false),
    help: baseApp && (admin || items?.help !== false),
  };
}
