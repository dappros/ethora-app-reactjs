import {
  Checkbox,
  Field,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import cn from 'classnames';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  actionGetUsers,
  actionResetPasswords,
} from '../actions';
import { IconAdd } from '../components/Icons/IconAdd';
import { IconCheckbox } from '../components/Icons/IconCheckbox';
import { IconDelete } from '../components/Icons/IconDelete';
import { IconEdit } from '../components/Icons/IconEdit';
import { IconKey } from '../components/Icons/IconKey';
import {
  getExportCsv,
  httpArchiveUsers,
  httpCraeteUser,
  httpGetAppUserTags,
  httpGetUsers,
  httpHardDeleteUsers,
  httpResetUserMfa,
  httpRestoreUser,
  httpRevokeUserAccess,
  httpTagsAdd,
  httpTagsDelete,
  httpUpdateAcl,
  httpUpdateAppUser,
} from '../http';
import { ConfirmModal } from '../components/modal/ConfirmModal';
import { ModelAppUser, ModelUserACL, OrderByType } from '../models';

import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';
import { IconArrowDown } from '../components/Icons/IconArrowDown';
import { AclModal } from '../components/modal/AclModal';
import { NewUserModal } from '../components/modal/NewUserModal';
import { apiError } from '../utils/apiError';
import { downloadCsv } from '../utils/csv';
import { SubmitModal } from '../components/modal/SubmitModal';
import { Sorting } from '../components/Sorting';
import CsvButton from '../components/UI/Buttons/CSVButton.tsx';
import { Pagination } from '../components/UI/Pagination/Pagination.tsx';
import { useTranslation } from '../i18n/useTranslation';
import './AppUsers.scss';
import AppleIcon from './AuthPage/Icons/socials/appleIcon';
import EmailIcon from './AuthPage/Icons/socials/emailIcon';
import FacebookIcon from './AuthPage/Icons/socials/facebookIcon';
import MetamaskIcon from './AuthPage/Icons/socials/metamaskIcon';
import GoogleIcon from './AuthPage/Icons/socials/googleIcon';
import { EditUserModal } from '../components/modal/EditUserModal';
import { TagsInput } from '../components/TagsInput';

export default function AppUsers() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { appId } = useParams();
  const [allRowsSelected, setAllRowsSelected] = useState(false);
  const [items, setItems] = useState<Array<ModelAppUser>>([]);
  const [rowsSelected, setRowsSelected] = useState(items.map(() => false));
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [itemsPerTable, setItemsPerTable] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [showManageTags, setShowManageTags] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetMfa, setShowResetMfa] = useState(false);
  const [resetMfaBusy, setResetMfaBusy] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showHardDelete, setShowHardDelete] = useState(false);
  // Manage Tags (bulk): tags to add to / remove from the selected users.
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
  // Tags in use on this app (suggestions + counts), refreshed after edits.
  const [appTags, setAppTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [editUser, setEditUser] = useState<ModelAppUser | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  // Active vs Archived view. ?lifecycle=archived persists across refresh so the
  // operator can land directly on the restore screen.
  const lifecycleTab = (searchParams.get('lifecycle') as 'active' | 'archived') || 'active';
  // All users vs only those with admin-panel access (?access=admin).
  const accessTab = (searchParams.get('access') as 'all' | 'admin') || 'all';
  const accessParam = accessTab === 'admin' ? ('admin' as const) : undefined;
  // Tag filter (?tag=): set by clicking a tag chip in the table.
  const tagFilter = searchParams.get('tag') || undefined;
  const [showRevokeAccess, setShowRevokeAccess] = useState(false);
  const [revokeBusy, setRevokeBusy] = useState(false);

  // const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  // const [orderBy, setOrderBy] = useState<OrderByType>('createdAt');

  const [editAcl, setEditAcl] = useState<ModelUserACL | null>(null);

  const limit = useMemo(
    () => Number(searchParams.get('limit')) || 10,
    [searchParams]
  );
  const page = useMemo(
    () => Number(searchParams.get('page')) || 0,
    [searchParams]
  );
  const order = useMemo(
    () => (searchParams.get('order') as 'asc' | 'desc') || 'asc',
    [searchParams]
  );
  const orderBy = useMemo(
    () => (searchParams.get('orderBy') as OrderByType) || 'createdAt',
    [searchParams]
  );

  const updateSearchParams = useCallback(
    (newParams: Record<string, string | number>) => {
      setSearchParams((prev) => {
        const updatedParams = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          updatedParams.set(key, String(value));
        });
        return updatedParams;
      });
    },
    [setSearchParams]
  );

  const setOrder = useCallback(
    (newOrder: 'asc' | 'desc') => {
      updateSearchParams({ order: newOrder, page: 0 });
    },
    [updateSearchParams]
  );

  const setOrderBy = useCallback(
    (newOrderBy: OrderByType) => {
      updateSearchParams({ orderBy: newOrderBy, page: 0 });
    },
    [updateSearchParams]
  );

  const changeItemsPerTable = useCallback(
    (count: number) => {
      setItemsPerTable(count);
      updateSearchParams({ limit: count, page: 0 });
    },
    [updateSearchParams]
  );

  const getCsvFile = async () => {
    if (!appId) {
      return;
    }

    try {
      const response = await getExportCsv(appId);
      const binaryData = response.data;

      const blob = new Blob([binaryData], { type: 'text/plain' });

      const date = new Date();
      const formattedDate = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      const fileName = `users_${formattedDate}.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }

      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const updateAcl = () => {
    if (editAcl && appId) {
      httpUpdateAcl(appId, editAcl?.userId, editAcl).then(() => {
        actionGetUsers(
          appId,
          itemsPerTable,
          page * itemsPerTable,
          orderBy,
          order,
          lifecycleTab === 'archived' ? { status: 'archived' } : undefined
        ).then((response) => {
          const { total, items } = response.data;
          setItems(items);
          setTotal(total);
          setPageCount(Math.ceil(total / itemsPerTable));
          setEditAcl(null);
        });
      });
    }
  };

  const setSelect = (select: boolean, index: number) => {
    const newRowsSelected = rowsSelected.concat([]);
    newRowsSelected[index] = select;

    if (newRowsSelected.every((el) => el === true)) {
      setAllRowsSelected(true);
    } else {
      setAllRowsSelected(false);
    }

    setRowsSelected(newRowsSelected);
  };

  const onSelectAllRows = (selected: boolean) => {
    setAllRowsSelected(selected);

    setRowsSelected(items.map(() => selected));
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setRowsSelected(() => items.map((_el) => false));
  }, [items]);

  const onPageChange = useCallback(
    (selectedItem: { selected: number }) => {
      updateSearchParams({ page: selectedItem.selected });
    },
    [updateSearchParams]
  );

  const fetchUsers = useCallback(() => {
    if (!appId) return;

    const lifecycle = lifecycleTab === 'archived' ? { status: 'archived' as const } : undefined;
    httpGetUsers(appId, limit, page * limit, orderBy, order, lifecycle, accessParam, tagFilter).then(
      (response) => {
        const { total, items } = response.data;
        setItems(items);
        setTotal(total);
        setPageCount(Math.ceil(total / limit));
      }
    );
  }, [appId, limit, page, orderBy, order, lifecycleTab, accessParam, tagFilter]);

  const loadAppTags = useCallback(() => {
    if (!appId) return;
    httpGetAppUserTags(appId)
      .then((r) => setAppTags(r.data?.items || []))
      .catch(() => setAppTags([]));
  }, [appId]);

  useEffect(() => {
    loadAppTags();
  }, [loadAppTags]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // The list is fetched by fetchUsers above (re-run on every filter, sort,
  // page or limit change); the [items] effect below clears the selection.
  // A second fetch here raced the first and could overwrite a filtered
  // result with an unfiltered one.

  const renderTo = () => {
    return itemsPerTable * (page + 1);
  };

  const renderFrom = () => {
    if (page === 0) {
      return <span>1</span>;
    } else {
      return 1;
    }
  };

  const getSelectedIndexes = () => {
    const indexes: Array<number> = [];

    rowsSelected.forEach((el, index) => {
      if (el) {
        indexes.push(index);
      }
    });

    return indexes;
  };

  const getSelectedUserIds = () => {
    const indexes = getSelectedIndexes();
    return indexes.map((el) => items[el]._id);
  };

  // Manage Tags applies a diff: tags typed under "Add" are added to every
  // selected user, tags under "Remove" are taken away; nothing else changes.
  // (The old replace-all form silently wiped tags a user already had.)
  const onManageTagsSubmit = async () => {
    if (!appId) return;
    const ids = getSelectedUserIds();
    setLoading(true);
    try {
      if (tagsToAdd.length) await httpTagsAdd(appId, ids, tagsToAdd);
      if (tagsToRemove.length) await httpTagsDelete(appId, ids, tagsToRemove);
      setShowManageTags(false);
      setTagsToAdd([]);
      setTagsToRemove([]);
      toast(t('appUsers.tagsAppliedToast'));
      refreshAndClearSelection();
      loadAppTags();
    } catch (e: unknown) {
      toast.error(`${t('appUsers.tagsFailedPrefix')} ${apiError(e).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Tags carried by the selected users (offered under "Remove").
  const selectedUsersTags = (): string[] => {
    const out = new Set<string>();
    rowsSelected.forEach((sel, i) => {
      if (sel) (items[i]?.tags || []).forEach((tg) => out.add(tg));
    });
    return Array.from(out).sort();
  };

  const onEditUserSubmit = async (values: { firstName: string; lastName: string; description: string; tags: string[] }) => {
    if (!appId || !editUser) return;
    setEditBusy(true);
    try {
      const body: { firstName?: string; lastName?: string; description?: string } = {};
      if (values.firstName !== editUser.firstName) body.firstName = values.firstName;
      if (values.lastName !== editUser.lastName) body.lastName = values.lastName;
      if ((values.description || '') !== (editUser.description || '')) body.description = values.description || '';
      if (Object.keys(body).length) await httpUpdateAppUser(appId, editUser._id, body);
      const before = new Set(editUser.tags || []);
      const after = new Set(values.tags);
      const add = values.tags.filter((tg) => !before.has(tg));
      const remove = (editUser.tags || []).filter((tg) => !after.has(tg));
      if (add.length) await httpTagsAdd(appId, [editUser._id], add);
      if (remove.length) await httpTagsDelete(appId, [editUser._id], remove);
      setEditUser(null);
      toast(t('appUsers.userUpdatedToast'));
      refreshAndClearSelection();
      loadAppTags();
    } catch (e: unknown) {
      toast.error(`${t('appUsers.userUpdateFailedPrefix')} ${apiError(e).message}`);
    } finally {
      setEditBusy(false);
    }
  };

  const onNewUser = ({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    if (!appId) {
      return;
    }

    setLoading(true);
    httpCraeteUser(appId, { firstName, lastName, email, password })
      .then(() => {
        // Hand the credentials over the moment the account exists. The server
        // stores the password hashed and no endpoint reads it back, so this
        // download is the only copy the operator will ever get — emit it
        // before the list refresh so a failure there cannot cost them the
        // password.
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const slug = email.replace(/[^a-zA-Z0-9._-]+/g, '-');
        downloadCsv(`new-user-${slug}-${stamp}.csv`, [
          ['First Name', 'Last Name', 'Email', 'Password'],
          [firstName, lastName, email, password],
        ]);

        return actionGetUsers(
          appId,
          itemsPerTable,
          page * itemsPerTable,
          orderBy,
          order,
          lifecycleTab === 'archived' ? { status: 'archived' } : undefined
        ).then((response) => {
          const { total, items } = response.data;
          setItems(items);
          setTotal(total);
          setPageCount(Math.ceil(total / itemsPerTable));
          setShowNewUserModal(false);
          toast(t('appUsers.userCreatedToast'));
        });
      })
      .finally(() => setLoading(false));
  };

  const onResetPassword = () => {
    if (!appId) {
      return;
    }

    const selectedUserIds = getSelectedUserIds();

    actionResetPasswords(appId, selectedUserIds).then(() => {
      setShowResetPassword(false);
      toast(t('appUsers.passwordResetToast'));
    });
  };

  // Owner recovery for a locked-out user (lost authenticator, no backup
  // codes): clears MFA and ends their sessions; they log in with the password.
  const onResetMfa = async () => {
    if (!appId) return;
    const ids = selectedIds();
    setResetMfaBusy(true);
    try {
      let cleared = 0;
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        const res = await httpResetUserMfa(appId, id);
        if (res.data?.wasEnabled) cleared += 1;
      }
      setShowResetMfa(false);
      toast(t('appUsers.mfaResetToast').replace('{count}', String(cleared)));
      refreshAndClearSelection();
    } catch (e: unknown) {
      toast.error(`${t('appUsers.mfaResetFailedPrefix')} ${apiError(e).message}`);
    } finally {
      setResetMfaBusy(false);
    }
  };

  // "Remove admin access": all ACL grants off, account and login kept.
  const onRevokeAccess = async () => {
    if (!appId) return;
    const ids = selectedIds();
    setRevokeBusy(true);
    let revoked = 0;
    const skipped: string[] = [];
    for (const id of ids) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const res = await httpRevokeUserAccess(appId, id);
        if (res.data?.hadAccess) revoked += 1;
      } catch (e: unknown) {
        const { code } = apiError(e);
        skipped.push(code || 'ERROR');
      }
    }
    setRevokeBusy(false);
    setShowRevokeAccess(false);
    toast(t('appUsers.accessRevokedToast').replace('{count}', String(revoked)));
    if (skipped.includes('CANNOT_REVOKE_SELF')) toast.error(t('appUsers.accessRevokeSelf'));
    if (skipped.includes('OWNER_CANNOT_BE_REVOKED')) toast.error(t('appUsers.accessRevokeOwner'));
    if (skipped.includes('SUPERADMIN_DEMOTE_FORBIDDEN')) toast.error(t('appUsers.accessRevokeSuperadmin'));
    refreshAndClearSelection();
  };

  const selectedIds = (): string[] => {
    const out: string[] = [];
    rowsSelected.forEach((el, index) => {
      if (el) out.push(items[index]._id);
    });
    return out;
  };

  const refreshAndClearSelection = () => {
    if (!appId) return;
    const lifecycle = lifecycleTab === 'archived' ? { status: 'archived' as const } : undefined;
    httpGetUsers(
      appId,
      itemsPerTable,
      page * itemsPerTable,
      orderBy,
      order,
      lifecycle,
      accessParam,
      tagFilter
    ).then((response) => {
      const { total, items } = response.data;
      setItems(items);
      setTotal(total);
      setPageCount(Math.ceil(total / itemsPerTable));
      setRowsSelected((selected) => selected.map(() => false));
    });
  };

  // Soft archive (the new default). Renamed from the old hard "Delete" - on
  // ethora-backend 2607+ this calls POST /v1/users/delete-many-with-app-id
  // which now archives by default (login refused, all data retained). Admin
  // can restore from the Archived tab.
  const onArchive = () => {
    if (!appId) return;
    const ids = selectedIds();
    httpArchiveUsers(appId, ids).then(() => {
      setShowArchive(false);
      refreshAndClearSelection();
      toast(`${ids.length > 1 ? t('appUsers.usersCapWord') : t('appUsers.userCapWord')} ${t('appUsers.archivedSuccessSuffix')}`);
    }).catch((e: any) => {
      toast.error(`${t('appUsers.archiveFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    });
  };

  // Hard delete (cascade purge). Drops the user(s) + wallets + files + XMPP
  // + any rooms they own (room-owner cascade). Irreversible.
  const onHardDelete = () => {
    if (!appId) return;
    const ids = selectedIds();
    httpHardDeleteUsers(appId, ids).then(() => {
      setShowHardDelete(false);
      refreshAndClearSelection();
      toast(`${ids.length > 1 ? t('appUsers.usersCapWord') : t('appUsers.userCapWord')} ${t('appUsers.deletedPermanentlySuffix')}`);
    }).catch((e: any) => {
      toast.error(`${t('appUsers.hardDeleteFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    });
  };

  // Restore one user (used from the per-row button in the Archived tab).
  const onRestoreOne = async (userId: string) => {
    if (!appId) return;
    try {
      await httpRestoreUser(appId, userId);
      toast.success(t('appUsers.userRestoredToast'));
      refreshAndClearSelection();
    } catch (e: any) {
      toast.error(`${t('appUsers.restoreFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    }
  };

  // The provider recorded at the user's last sign-in. Legacy users have none;
  // show that honestly rather than defaulting to email.
  const renderAuthMethodIcon = (name?: string) => {
    const method = (name || '').toLowerCase();
    const label = method ? t(`appUsers.authMethod_${method}`) : t('appUsers.authMethod_unknown');
    const title = label.startsWith('appUsers.') ? method : label;
    let icon: React.ReactNode;
    switch (method) {
      case 'google':
      case 'gmail':
        icon = <GoogleIcon />;
        break;
      case 'facebook':
        icon = <FacebookIcon />;
        break;
      case 'apple':
        icon = <AppleIcon />;
        break;
      case 'metamask':
      case 'signature':
        icon = <MetamaskIcon />;
        break;
      case 'email':
        icon = <EmailIcon />;
        break;
      default:
        icon = <span className="text-gray-400 text-xs">?</span>;
    }
    return (
      <span title={title} aria-label={title} className="inline-flex items-center justify-center">
        {icon}
      </span>
    );
  };

  // Column header that sorts on click (arrow shows the active column and
  // direction). Fields the API cannot sort on render as plain labels.
  const SORTABLE: Partial<Record<string, OrderByType>> = {
    name: 'firstName',
    email: 'email',
    tags: 'tags',
    created: 'createdAt',
    role: 'role',
    mfa: 'mfaEnabled',
    auth: 'authMethod',
  };
  // For these the useful first view is the "desc" side: tagged users first,
  // admins first. Alphabetic / date columns start ascending as before.
  const DESC_FIRST: OrderByType[] = ['tags', 'role', 'mfaEnabled'];
  const SORT_HINT: Partial<Record<OrderByType, [string, string]>> = {
    tags: [t('appUsers.sortHintTagsAsc'), t('appUsers.sortHintTagsDesc')],
    role: [t('appUsers.sortHintRoleAsc'), t('appUsers.sortHintRoleDesc')],
  };
  const th = (key: string, label: string, align: 'left' | 'center' = 'center', extra = '') => {
    const field = SORTABLE[key];
    const active = field && orderBy === field;
    const base = `px-3 py-2 text-gray-500 font-normal font-inter text-xs whitespace-nowrap text-${align} ${extra}`;
    if (!field) return <th className={base}>{label}</th>;
    const firstDir = DESC_FIRST.includes(field) ? 'desc' : 'asc';
    const nextDir = active ? (order === 'asc' ? 'desc' : 'asc') : firstDir;
    const hint = SORT_HINT[field];
    const title = hint
      ? nextDir === 'asc' ? hint[0] : hint[1]
      : t('appUsers.sortByTitle').replace('{column}', label);
    return (
      <th className={`${base} cursor-pointer select-none hover:text-gray-800`}>
        <button
          type="button"
          className="inline-flex items-center gap-1"
          title={title}
          onClick={() => updateSearchParams({ orderBy: field, order: nextDir, page: 0 })}
        >
          {label}
          <span className={classNames('text-[10px]', active ? 'text-brand-500' : 'text-gray-300')}>
            {active ? (order === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </button>
      </th>
    );
  };

  const renderActionsForSelected = () => {
    const selectedIndexes = [];

    rowsSelected.forEach((el, index) => {
      if (el) {
        selectedIndexes.push(index);
      }
    });

    const length = selectedIndexes.length;

    if (!appId) {
      return;
    }

    if (length > 0) {
      //
      return (
        <div
          className={classNames(
            'gap-0 md:gap-[16px] items-center z-50 transform -translate-x-1/2 rounded-xl fixed left-[50%]',
            'bottom-[205px] 2xl:bottom-[30px] flex flex-col-reverse md:flex-row',
            'shadow-none md:shadow-lg px-0 md:px-[16px] py-0 md:py-[12px] bg-none md:bg-white'
          )}
        >
          <div
            className={classNames(
              'whitespace-nowrap text-sm mt-2 md:mt-0 bg-white',
              'p-[22px] md:p-0 shadow-lg md:shadow-none rounded-xl md:rounded-none'
            )}
          >
            {t('appUsers.selectedPrefix')} {length} {t('appUsers.paginationOf')} {itemsPerTable} {t('appUsers.usersWord')}
          </div>
          <div
            className={classNames(
              'flex flex-col md:flex-row gap-[16px] bg-white',
              'py-[8px] md:py-0 px-[16px] md:px-0 shadow-lg md:shadow-none rounded-xl md:rounded-none'
            )}
          >
            <button
              className="text-brand-500 font-varela text-base py-[12px] md:py-0 px-[16px] md:px-0"
              onClick={() => setShowManageTags(true)}
            >
              {t('appUsers.manageTags')}
            </button>
            <button
              className="text-brand-500 font-varela text-base py-[12px] md:py-0 px-[16px] md:px-0"
              onClick={() => setShowResetPassword(true)}
            >
              {t('appUsers.resetPassword')}
            </button>
            <button
              className="text-brand-500 font-varela text-base py-[12px] md:py-0 px-[16px] md:px-0"
              onClick={() => setShowResetMfa(true)}
              title={t('appUsers.resetMfaTitle')}
            >
              {t('appUsers.resetMfa')}
            </button>
            <button
              className="text-brand-500 font-varela text-base py-[12px] md:py-0 px-[16px] md:px-0"
              onClick={() => setShowRevokeAccess(true)}
              title={t('appUsers.revokeAccessTitle')}
            >
              {t('appUsers.revokeAccess')}
            </button>
            {lifecycleTab === 'active' ? (
              <button
                className="text-brand-500 flex font-varela text-base items-center justify-center py-[12px] md:py-0 px-[16px] md:px-0"
                onClick={() => setShowArchive(true)}
                title={t('appUsers.archiveTitle')}
              >
                <div className="mr-2">
                  <IconDelete />
                </div>
                {t('appUsers.archive')}
              </button>
            ) : (
              <button
                className="text-green-600 font-varela text-base py-[12px] md:py-0 px-[16px] md:px-0"
                onClick={async () => {
                  const ids = selectedIds();
                  try {
                    for (const id of ids) {
                      // eslint-disable-next-line no-await-in-loop
                      await httpRestoreUser(appId, id);
                    }
                    toast(`${ids.length > 1 ? t('appUsers.usersCapWord') : t('appUsers.userCapWord')} ${t('appUsers.restoredSuccessSuffix')}`);
                    refreshAndClearSelection();
                  } catch (e: any) {
                    toast.error(`${t('appUsers.restoreFailedPrefix')} ${e?.response?.data?.error || e.message}`);
                  }
                }}
              >
                {t('appUsers.restore')}
              </button>
            )}
            <button
              className="text-red-600 font-varela text-base py-[12px] md:py-0 px-[16px] md:px-0"
              onClick={() => setShowHardDelete(true)}
              title={t('appUsers.hardDeleteTitle')}
            >
              {t('appUsers.hardDelete')}
            </button>
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    // overflow-hidden
    <div className="admin-app-users h-full w-full  grid lg:grid-rows-[57px,_1fr] grid-rows-[97px,_1fr] gap-y-[16px]">
      <div className="md:row-start-1 flex w-full md:justify-between items-center border-b border-b-gray-200">
        <div className="ml-4 hidden md:flex items-center gap-4">
          <div className="font-varela text-[24px]">{t('appUsers.title')}</div>
          {/* Active / Archived filter, mirrors the Apps page. */}
          <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50 text-sm">
            {(['active', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => updateSearchParams({ lifecycle: tab, page: 0 })}
                className={classNames(
                  'px-3 py-1 rounded-lg font-varela',
                  lifecycleTab === tab
                    ? 'bg-white text-brand-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab === 'active' ? t('appUsers.tabActive') : t('appUsers.tabArchived')}
              </button>
            ))}
          </div>
          {/* All users vs admin-panel access only (any ACL grant, owner, super admins). */}
          <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50 text-sm">
            {(['all', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => updateSearchParams({ access: tab, page: 0 })}
                className={classNames(
                  'px-3 py-1 rounded-lg font-varela',
                  accessTab === tab
                    ? 'bg-white text-brand-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                title={tab === 'admin' ? t('appUsers.tabAdminAccessTitle') : ''}
              >
                {tab === 'all' ? t('appUsers.tabAllUsers') : t('appUsers.tabAdminAccess')}
              </button>
            ))}
          </div>
          {tagFilter && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-brand-150 text-brand-500 text-sm">
              {t('appUsers.tagFilterPrefix')} {tagFilter}
              <button
                type="button"
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete('tag');
                    next.set('page', '0');
                    return next;
                  });
                }}
                aria-label={t('appUsers.tagFilterClear')}
                title={t('appUsers.tagFilterClear')}
                className="leading-none hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
        </div>
        <div className="flex lg:flex-row flex-col w-full md:w-auto lg:items-center items-end lg:justify-end justify-start gap-4">
          <Sorting<OrderByType>
            className=""
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            orderByList={[
              { key: 'createdAt', title: t('appUsers.sortCreationDate') },
              { key: 'firstName', title: t('appUsers.sortFirstName') },
              { key: 'lastName', title: t('appUsers.sortLastName') },
              { key: 'email', title: t('appUsers.sortEmail') },
              { key: 'authMethod', title: t('appUsers.sortAuthMethod') },
              { key: 'mfaEnabled', title: t('appUsers.sortMfa') },
              { key: 'tags', title: t('appUsers.sortTags') },
              { key: 'role', title: t('appUsers.sortRole') },
            ]}
            setOrderBy={setOrderBy}
          />
          <div className="flex items-center justify-end gap-4">
            <CsvButton onClick={getCsvFile} />
            <button
              onClick={() => setShowNewUserModal(true)}
              className="flex hover:bg-brand-darker items-center justify-center sm:w-[184px] p-2 h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela"
            >
              <IconAdd color="white" className="sm:mr-2" />
              <span className="hidden sm:block">{t('appUsers.addUser')}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden">
        {!items.length && (
          <div className="bg-[#F3F6FC] p-4 text-sm font-sans rounded-xl mb-4">
            {t('appUsers.emptyState')}
          </div>
        )}
        {!!items.length && (
          <>
            <div className="overflow-x-auto relative mb-4">
              {renderActionsForSelected()}
              <table className="border-collapse w-full min-w-[1200px] table-auto">
                <thead>
                  <tr className="bg-[#FCFCFC]">
                    <th className="pl-4 py-2 w-[32px] rounded-l-lg">
                      <Field className="flex items-center cursor-pointer">
                        <Checkbox
                          className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                          checked={allRowsSelected}
                          onChange={onSelectAllRows}
                        >
                          <IconCheckbox className="hidden group-data-[checked]:block" />
                        </Checkbox>
                      </Field>
                    </th>
                    {th('name', t('appUsers.colName'), 'left')}
                    {th('email', t('appUsers.colEmail'), 'left')}
                    {th('tags', t('appUsers.colTags'), 'left')}
                    {th('created', t('appUsers.colCreationSeenDate'))}
                    {th('role', t('appUsers.colRole'))}
                    {th('mfa', t('appUsers.colMfa'))}
                    {th('auth', t('appUsers.colAuthMethod'))}
                    {th('actions', t('appUsers.colActions'), 'center', 'rounded-r-lg')}
                  </tr>
                </thead>
                <tbody>
                  {items.map((el, index) => {
                    return (
                      <tr
                        key={el._id}
                        className={cn('', {
                          '!bg-[#E7EDF9]': rowsSelected[index],
                          'hover:!bg-[#F5F7F9]': !rowsSelected[index],
                        })}
                      >
                        <td className="pl-4 py-2 w-[32px] rounded-l-lg">
                          <Field className="flex items-center cursor-pointer">
                            <Checkbox
                              className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                              checked={rowsSelected[index]}
                              onChange={(isSet) => setSelect(isSet, index)}
                            >
                              <IconCheckbox className="hidden group-data-[checked]:block" />
                            </Checkbox>
                          </Field>
                        </td>
                        <td className="px-3 py-2 text-left font-sans font-normal text-[13px] whitespace-nowrap">
                          <div>{`${el.firstName || ''} ${el.lastName || ''}`.trim() || '-'}</div>
                        </td>
                        <td className="px-3 py-2 font-sans font-normal text-[13px] text-left whitespace-nowrap">
                          {el.email}
                        </td>
                        <td className="px-3 py-2 font-sans font-normal text-[13px] text-left">
                          <div className="flex flex-wrap items-center gap-1">
                            {(el.tags || []).slice(0, 4).map((raw, i) => {
                              // Legacy tags may carry whitespace / case from the old form.
                              const tg = raw.trim();
                              const active = (tagFilter || '').toLowerCase() === tg.toLowerCase();
                              return (
                                <button
                                  type="button"
                                  key={`${tg}_${i}`}
                                  onClick={() => updateSearchParams({ tag: tg, page: 0 })}
                                  title={t('appUsers.tagFilterTitle').replace('{tag}', tg)}
                                  className={classNames(
                                    'px-2 py-0.5 rounded-2xl text-xs hover:bg-brand-500 hover:text-white',
                                    active ? 'bg-brand-500 text-white' : 'bg-brand-150 text-brand-500'
                                  )}
                                >
                                  {tg}
                                </button>
                              );
                            })}
                            {(el.tags || []).length > 4 && (
                              <span className="text-xs text-gray-400" title={(el.tags || []).slice(4).join(', ')}>
                                +{(el.tags || []).length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-sans font-normal text-[12px] text-center whitespace-nowrap text-gray-700">
                          <div>{DateTime.fromISO(el.createdAt).toFormat('dd LLL yyyy t')}</div>
                          <div className="text-gray-400">{el.lastSeen ? DateTime.fromISO(el.lastSeen).toFormat('dd LLL yyyy t') : '-'}</div>
                        </td>
                        <td className="px-3 py-2 font-sans font-normal text-[13px] text-center whitespace-nowrap">
                          {el.role ? (
                            <span
                              className={classNames(
                                'px-2 py-0.5 rounded-2xl text-xs',
                                el.role === 'member' ? 'bg-gray-100 text-gray-600' : 'bg-brand-150 text-brand-500'
                              )}
                            >
                              {t(`appUsers.role_${el.role}`)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-2 font-sans font-normal text-[13px] text-center whitespace-nowrap">
                          {el.mfaEnabled === undefined && el.mfa === undefined ? (
                            '-'
                          ) : el.mfaEnabled || el.mfa?.enabled ? (
                            <span className="px-2 py-0.5 rounded-2xl text-xs bg-green-100 text-green-700">{t('appUsers.mfaOn')}</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-2xl text-xs bg-gray-100 text-gray-600">{t('appUsers.mfaOff')}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-sans font-normal text-[13px] text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {renderAuthMethodIcon(el.authMethod)}
                          </div>
                        </td>
                        <td className="px-3 py-2 rounded-r-lg font-sans font-normal text-[13px] text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-3">
                            {lifecycleTab === 'archived' && (
                              <button
                                onClick={() => onRestoreOne(el._id)}
                                className="text-xs text-green-700 hover:underline"
                                title={t('appUsers.restoreRowTitle')}
                              >
                                {t('appUsers.restore')}
                              </button>
                            )}
                            <button type="button" onClick={() => setEditUser(el)} title={t('appUsers.editTitle')} aria-label={t('appUsers.editTitle')}>
                              <IconEdit width={16} />
                            </button>
                            <button type="button" onClick={() => setEditAcl(el.acl)} title={t('appUsers.permissionsTitle')} aria-label={t('appUsers.permissionsTitle')}>
                              <IconKey width={16} height={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mx-8 my-[12px]">
              <div className="flex justify-between lg:justify-start items-center">
                <div className="text-[#71717A] text-xs mr-8 whitespace-nowrap">
                  {renderFrom()} {t('appUsers.paginationTo')} {renderTo()} {t('appUsers.paginationOf')} {total}
                </div>
                <div className="flex">
                  <div className="text-[#71717A] mr-8">{t('appUsers.showLabel')}</div>
                  <Menu>
                    <MenuButton className="flex mr-4">
                      <span className="text-brand-500 mr-4 font-semibold">
                        {itemsPerTable}
                      </span>
                      <IconArrowDown />
                    </MenuButton>
                    <MenuItems anchor="bottom" className="bg-white">
                      <div className="">
                        {[10, 15, 25].map((item) => (
                          <MenuItem>
                            <div
                              onClick={() => changeItemsPerTable(item)}
                              className="cursor-pointer px-2 text-brand-500 w-[60px] font-semibold"
                            >
                              {item}
                            </div>
                          </MenuItem>
                        ))}
                      </div>
                    </MenuItems>
                  </Menu>
                  <div className="text-[#71717A]">{t('appUsers.usersWord')}</div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end lg:items-center">
                <Pagination
                  onPageChange={onPageChange}
                  pageCount={pageCount}
                  forcePage={page}
                />
              </div>
            </div>
          </>
        )}
      </div>
      {showManageTags && (
        <SubmitModal onClose={() => setShowManageTags(false)}>
          <div className="font-varela text-[24px] text-center mb-2">{t('appUsers.tagsModalTitle')}</div>
          <div className="font-sans text-[13px] mb-6 text-center text-[#8C8C8C]">
            {t('appUsers.tagsModalSubtext').replace('{count}', String(getSelectedIndexes().length))}
          </div>
          <div className="mb-5">
            <div className="font-sans text-[13px] font-semibold mb-1">{t('appUsers.tagsAddLabel')}</div>
            <TagsInput
              value={tagsToAdd}
              onChange={setTagsToAdd}
              suggestions={appTags.map((x) => x.tag)}
              placeholder={t('appUsers.tagsAddPlaceholder')}
              autoFocus
            />
          </div>
          <div className="mb-8">
            <div className="font-sans text-[13px] font-semibold mb-1">{t('appUsers.tagsRemoveLabel')}</div>
            <TagsInput
              value={tagsToRemove}
              onChange={setTagsToRemove}
              suggestions={selectedUsersTags()}
              placeholder={t('appUsers.tagsRemovePlaceholder')}
            />
            {selectedUsersTags().length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedUsersTags()
                  .filter((tg) => !tagsToRemove.includes(tg))
                  .map((tg) => (
                    <button
                      key={tg}
                      type="button"
                      onClick={() => setTagsToRemove([...tagsToRemove, tg])}
                      className="px-2 py-0.5 rounded-2xl text-xs bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                      title={t('appUsers.tagsRemoveTitle')}
                    >
                      {tg}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="flex gap-8">
            <button
              onClick={() => setShowManageTags(false)}
              className="rounded-xl hover:bg-brand-hover border-brand-500 border max-w-[416px] w-full text-center text-brand-500 p-2"
            >
              {t('appUsers.cancel')}
            </button>
            <button
              onClick={onManageTagsSubmit}
              disabled={!tagsToAdd.length && !tagsToRemove.length}
              className="rounded-xl hover:bg-brand-darker bg-brand-500 border max-w-[416px] w-full text-center text-white p-2 disabled:opacity-50"
            >
              {t('appUsers.submit')}
            </button>
          </div>
        </SubmitModal>
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          suggestions={appTags.map((x) => x.tag)}
          loading={editBusy}
          onClose={() => setEditUser(null)}
          onSubmit={onEditUserSubmit}
        />
      )}
      {showResetPassword && (
        <SubmitModal onClose={() => setShowResetPassword(false)}>
          <div className="font-varela text-[24px] text-center mb-8">
            {t('appUsers.passwordResetTitle')}
          </div>
          <p className="font-sans text-[14px] mb-8 text-center">
            {`${t('appUsers.passwordResetConfirmPrefix')} ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? t('appUsers.userWordPlural') : t('appUsers.userWordSingular')}?`}
          </p>
          <div className="flex gap-8">
            <button
              onClick={() => setShowResetPassword(false)}
              className="w-full hover:bg-brand-hover rounded-xl border py-[12px] border-brand-500 text-brand-500"
            >
              {t('appUsers.cancel')}
            </button>
            <button
              onClick={onResetPassword}
              className="w-full hover:bg-brand-darker py-[12px] rounded-xl bg-brand-500 text-white"
            >
              {t('appUsers.submit')}
            </button>
          </div>
        </SubmitModal>
      )}
      {showResetMfa && (
        <ConfirmModal
          title={`${t('appUsers.resetMfaConfirmTitlePrefix')} ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? t('appUsers.userWordPlural') : t('appUsers.userWordSingular')}?`}
          message={t('appUsers.resetMfaConfirmMessage')}
          confirmLabel={t('appUsers.resetMfa')}
          busy={resetMfaBusy}
          onConfirm={onResetMfa}
          onCancel={() => setShowResetMfa(false)}
        />
      )}
      {showRevokeAccess && (
        <ConfirmModal
          title={`${t('appUsers.revokeAccessConfirmTitlePrefix')} ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? t('appUsers.userWordPlural') : t('appUsers.userWordSingular')}?`}
          message={t('appUsers.revokeAccessConfirmMessage')}
          confirmLabel={t('appUsers.revokeAccess')}
          busy={revokeBusy}
          onConfirm={onRevokeAccess}
          onCancel={() => setShowRevokeAccess(false)}
        />
      )}
      {showArchive && (
        <ConfirmModal
          title={`${t('appUsers.archiveConfirmTitlePrefix')} ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? t('appUsers.userWordPlural') : t('appUsers.userWordSingular')}?`}
          message={t('appUsers.archiveConfirmMessage')}
          confirmLabel={t('appUsers.archive')}
          onConfirm={onArchive}
          onCancel={() => setShowArchive(false)}
        />
      )}
      {showHardDelete && (
        <ConfirmModal
          title={`${t('appUsers.hardDeleteConfirmTitlePrefix')} ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? t('appUsers.userWordPlural') : t('appUsers.userWordSingular')}?`}
          message={t('appUsers.hardDeleteConfirmMessage')}
          confirmLabel={t('appUsers.hardDeleteConfirmLabel')}
          danger
          onConfirm={onHardDelete}
          onCancel={() => setShowHardDelete(false)}
        />
      )}
      {editAcl && (
        <AclModal
          updateAcl={updateAcl}
          acl={editAcl}
          setEditAcl={setEditAcl}
          onClose={() => setEditAcl(null)}
        />
      )}
      {showNewUserModal && (
        <NewUserModal
          loading={loading}
          onSubmit={onNewUser}
          onClose={() => setShowNewUserModal(false)}
        />
      )}
    </div>
  );
}
