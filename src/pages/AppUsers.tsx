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
import { IconSettings } from '../components/Icons/IconSettings';
import {
  getExportCsv,
  httpArchiveUsers,
  httpCraeteUser,
  httpGetUsers,
  httpHardDeleteUsers,
  httpRestoreUser,
  httpTagsSet,
  httpUpdateAcl,
} from '../http';
import { ConfirmModal } from '../components/modal/ConfirmModal';
import { ModelAppUser, ModelUserACL, OrderByType } from '../models';

import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';
import { IconArrowDown } from '../components/Icons/IconArrowDown';
import { AclModal } from '../components/modal/AclModal';
import { NewUserModal } from '../components/modal/NewUserModal';
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
  const [showArchive, setShowArchive] = useState(false);
  const [showHardDelete, setShowHardDelete] = useState(false);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  // Active vs Archived view. ?lifecycle=archived persists across refresh so the
  // operator can land directly on the restore screen.
  const lifecycleTab = (searchParams.get('lifecycle') as 'active' | 'archived') || 'active';

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
    httpGetUsers(appId, limit, page * limit, orderBy, order, lifecycle).then(
      (response) => {
        const { total, items } = response.data;
        setItems(items);
        setTotal(total);
        setPageCount(Math.ceil(total / limit));
      }
    );
  }, [appId, limit, page, orderBy, order, lifecycleTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!appId) {
      return;
    }

    const lifecycle = lifecycleTab === 'archived' ? { status: 'archived' as const } : undefined;
    httpGetUsers(
      appId,
      itemsPerTable,
      page * itemsPerTable,
      orderBy,
      order,
      lifecycle
    ).then((response) => {
      const { total, items } = response.data;
      setItems(items);
      setTotal(total);
      setPageCount(Math.ceil(total / itemsPerTable));
      setRowsSelected((selected) => selected.map(() => false));
    });
  }, [orderBy, order, lifecycleTab]);

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

  const onTagsSumbmit = () => {
    if (!appId) {
      return;
    }

    const selectedUserIds = getSelectedUserIds();

    httpTagsSet(appId, {
      usersIdList: selectedUserIds,
      tagsList: tags.split(',').filter((el) => !!el),
    }).then(() => {
      actionGetUsers(
        appId,
        itemsPerTable,
        page * itemsPerTable,
        orderBy,
        order
      ).then((response) => {
        const { total, items } = response.data;
        setItems(items);
        setTotal(total);
        setPageCount(Math.ceil(total / itemsPerTable));
        setShowManageTags(false);
        setTags('');
        toast(t('appUsers.tagsAppliedToast'));
      });
    });
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
      lifecycle
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

  const renderAuthMethodIcon = (name: string) => {
    switch (name) {
      case 'facebook':
        return <FacebookIcon />;
      case 'apple':
        return <AppleIcon />;
      case 'metamask':
        return <MetamaskIcon />;
      default:
        return <EmailIcon />;
    }
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
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                      {t('appUsers.colFirstName')}
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                      {t('appUsers.colLastName')}
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                      {t('appUsers.colEmail')}
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                      {t('appUsers.colTags')}
                    </th>
                    {/* <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      Creation Date
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      Seen Date
                    </th> */}

                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      {t('appUsers.colCreationSeenDate')}
                    </th>

                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      {t('appUsers.colAuthMethod')}
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      {t('appUsers.colAttribution')}
                    </th>
                    <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      {t('appUsers.colActions')}
                    </th>
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
                        <td className="px-4 py-[20px] text-left font-sans font-normal text-sm whitespace-nowrap">
                          {el.firstName}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          {el.lastName}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          {el.email}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          <div className="flex items-center gap-1 justify-center">
                            {el.tags.slice(0, 3).map((e, index) => (
                              <div
                                key={`${e}_${index}`}
                                className="px-4 py-1 bg-brand-150 text-brand-500 rounded-2xl"
                              >
                                {e}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          <div>
                            {DateTime.fromISO(el.createdAt).toFormat(
                              'dd LLL yyyy t'
                            )}
                          </div>
                          <div>
                            {el.lastSeen
                              ? DateTime.fromISO(el.lastSeen).toFormat(
                                  'dd LLL yyyy t'
                                )
                              : '-'}
                          </div>
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {renderAuthMethodIcon(el.authMethod)}
                          </div>
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center">
                          -
                        </td>
                        <td className="px-4 rounded-r-lg font-sans font-normal text-sm text-center whitespace-nowrap">
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
                            <button onClick={() => setEditAcl(el.acl)} title={t('appUsers.permissionsTitle')}>
                              <IconSettings width={16} height={16} />
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
          <div className="font-varela text-[24px] text-center mb-8">{t('appUsers.tagsModalTitle')}</div>
          <div className="font-sans text-[14px] mb-8 text-center">{t('appUsers.addTagsSubtext')}</div>
          <div>
            <input
              type="text"
              placeholder={t('appUsers.tagsPlaceholder')}
              className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="flex gap-8">
            <button
              onClick={() => setShowManageTags(false)}
              className="rounded-xl hover:bg-brand-hover border-brand-500 border max-w-[416px] w-full text-center text-brand-500 p-2"
            >
              {t('appUsers.cancel')}
            </button>
            <button
              onClick={onTagsSumbmit}
              className="rounded-xl hover:bg-brand-darker  bg-brand-500 border max-w-[416px] w-full text-center text-white p-2"
            >
              {t('appUsers.submit')}
            </button>
          </div>
        </SubmitModal>
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
