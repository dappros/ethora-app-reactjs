import { AxiosError } from 'axios';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ApplicationPreview } from '../components/ApplicationPreview';
import { ApplicationStarterInf } from '../components/ApplicationStarterInf';
import { IconAdd } from '../components/Icons/IconAdd';
import { Loading } from '../components/Loading.tsx';
import { NewAppModal } from '../components/modal/NewAppModal';
import { PreviewAppModal } from '../components/modal/PreviewAppModal.tsx';
import { Sorting } from '../components/Sorting';
import CsvButton from '../components/UI/Buttons/CSVButton.tsx';
import { Pagination } from '../components/UI/Pagination/Pagination.tsx';
import { useCentrifugeAppUpdater } from '../hooks/useCentrifugeAppUpdater.ts';
import { getExportAppsCsv, httpGetAppsWithStatus, httpImportApp } from '../http';
import { ImportAppModal } from '../components/modal/ImportAppModal';
import { ModelApp, OrderByType } from '../models';
import { useAppStore } from '../store/useAppStore';

export default function AdminApps() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [showStarterInf, setShowStarterInf] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newShowModal, setNewShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState(false);
  // 'active' (default) / 'archived' (restore screen) - the new lifecycle filter
  // wired in ethora-backend 2607+. Tab persists via the URL so refresh stays put.
  const lifecycleTab = (searchParams.get('lifecycle') as 'active' | 'archived') || 'active';
  // Per-tab counts shown alongside the tab labels: "Active (22) | Archived (1)".
  // Fetched in parallel with the main list refresh via httpGetAppsWithStatus
  // (limit=1 returns the same `total` we use for pagination on either view).
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [archivedCount, setArchivedCount] = useState<number | null>(null);

  const apps = useAppStore((s) => s.apps);
  const [appsState, setAppState] = useState<ModelApp[]>(apps);

  const currentUser = useAppStore((s) => s.currentUser);
  const doSetApps = useAppStore((s) => s.doSetApps);
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);

  const limit = useMemo(
    () => Number(searchParams.get('limit')) || 10,
    [searchParams]
  );
  const pageIndex = useMemo(() => {
    const p = Number(searchParams.get('page')) || 1;
    return Math.max(0, p - 1);
  }, [searchParams]);
  const order = useMemo(
    () => (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    [searchParams]
  );
  const orderBy = useMemo(
    () => (searchParams.get('orderBy') as OrderByType) || 'totalRegistered',
    [searchParams]
  );

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageIndex);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await httpGetAppsWithStatus({
        limit,
        offset: limit * pageIndex,
        order,
        orderBy,
        ...(lifecycleTab === 'archived' ? { status: 'archived' as const } : {}),
      });

      setPageCount(Math.ceil(response.data.total / limit));
      doSetApps(response.data.apps);

      // Update the tab's own total directly from this response - the list
      // we just rendered IS the source of truth for the active tab. Then
      // make one cheap (limit=1) call for the other tab's total.
      if (lifecycleTab === 'archived') {
        setArchivedCount(response.data.total ?? 0);
      } else {
        setActiveCount(response.data.total ?? 0);
      }
      try {
        const otherResp = await httpGetAppsWithStatus({
          limit: 1,
          offset: 0,
          order,
          orderBy,
          ...(lifecycleTab === 'archived' ? {} : { status: 'archived' as const }),
        });
        if (lifecycleTab === 'archived') {
          setActiveCount(otherResp.data.total ?? 0);
        } else {
          setArchivedCount(otherResp.data.total ?? 0);
        }
      } catch {
        // non-fatal: tab counts are nice-to-have; the rest of the page works without them.
      }
    } catch (error: AxiosError | any) {
      console.error(error?.response?.data?.error || error);
    } finally {
      setLoading(false);
    }
  }, [limit, pageIndex, order, orderBy, doSetApps, lifecycleTab]);

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

  const onPageChange = useCallback(
    (selectedItem: { selected: number }) => {
      updateSearchParams({ page: selectedItem.selected + 1 });
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (newOrderBy: OrderByType, newOrder: 'asc' | 'desc') => {
      updateSearchParams({ orderBy: newOrderBy, order: newOrder, page: 1 });
    },
    [updateSearchParams]
  );

  const renderSorting = useCallback(() => {
    if (currentUser?.isSuperAdmin) {
      return (
        <Sorting<OrderByType>
          className="mr-4"
          order={order}
          setOrder={(newOrder) => handleSortChange(orderBy, newOrder)}
          orderBy={orderBy}
          setOrderBy={(newOrderBy) => handleSortChange(newOrderBy, order)}
          orderByList={[
            { key: 'displayName', title: 'Display Name' },
            { key: 'totalRegistered', title: 'Users' },
            { key: 'totalSessions', title: 'Sessions' },
            { key: 'totalApiCalls', title: 'API' },
            { key: 'totalTokens', title: 'AI' },
            { key: 'totalFiles', title: 'Files' },
            { key: 'totalTransactions', title: 'Transactions' },
            { key: 'createdAt', title: 'Date' },
            { key: 'totalChats', title: 'Chats' },
          ]}
        />
      );
    } else {
      return null;
    }
  }, [currentUser?.isSuperAdmin, order, orderBy, handleSortChange]);

  const getCsvFile = async () => {
    try {
      const response = await getExportAppsCsv();
      const binaryData = response.data;

      const blob = new Blob([binaryData], { type: 'text/csv' });

      const date = new Date();
      const formattedDate = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      const fileName = `apps_${formattedDate}.csv`;

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

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    const newUser = localStorage.getItem('newUser');

    if (newUser && !apps.length) {
      return setNewShowModal(true);
    }
    setShowModal(!apps.length);
  }, [apps.length]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  useEffect(() => {
    setAppState(apps);
  }, [apps]);

  useCentrifugeAppUpdater(setAppState);

  // useEffect(() => {
  //   if (!data) return;

  //   if (data.type === 'counter_chats') {
  //     setAppState((prev) =>
  //       prev.map((app) =>
  //         app._id === data.appId
  //           ? {
  //               ...app,
  //               stats: {
  //                 ...app.stats,
  //                 totalChats: app.stats.totalChats + 1,
  //                 recentlyChats: app.stats.recentlyChats + 1,
  //               },
  //             }
  //           : app
  //       )
  //     );
  //   }
  // }, [data]);

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      {/* Page-level header (outside the white card) - matches the Chats
          shell. The old inner 'Apps' h2 + Create App row inside the card
          and the 'Admin' / tab row above used to be the navigation chrome;
          since Apps / Agents / Billing are now sidebar items, the title +
          primary action live here on their own. */}
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Apps
        </div>
        <div className="flex items-center gap-4">
          {/* Active / Archived filter. Persists via ?lifecycle=... so a refresh
              keeps the operator on the restore screen. Tab labels show counts
              so the Archived tab broadcasts when there is something to restore
              even before the user clicks into it. */}
          <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50 text-sm">
            {(['active', 'archived'] as const).map((tab) => {
              const n = tab === 'active' ? activeCount : archivedCount;
              return (
                <button
                  key={tab}
                  onClick={() => updateSearchParams({ lifecycle: tab, page: 1 })}
                  className={classNames(
                    'px-3 py-1 rounded-lg font-varela',
                    lifecycleTab === tab
                      ? 'bg-white text-brand-500 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab === 'active' ? 'Active' : 'Archived'}
                  {n !== null && (
                    <span className={classNames('ml-1', lifecycleTab === tab ? 'text-brand-500' : 'text-gray-400')}>
                      ({n})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {renderSorting()}
          {currentUser?.isSuperAdmin && <CsvButton onClick={getCsvFile} />}
          {/* Create App stays as the dominant primary action in the header.
              Import lives in the closing tile of the list (CreateOrImportTile)
              so new operators don't trip into it first thing. */}
          <button
            onClick={() => setShowModal(true)}
            className={classNames(
              'flex items-center justify-center h-[40px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela px-4'
            )}
          >
            <IconAdd color="white" className="mr-2" />
            <span>Create App</span>
          </button>
        </div>
      </div>

      <div id="admin-apps" className="rounded-2xl bg-white p-4 overflow-y-auto">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="text-center pb-2 font-varela text-[18px] block sm:hidden">
              Apps
            </div>

            {/* mobile-only Create App button (keeps mobile UX since the
                outer top bar is desktop-only). */}
            <div className="flex sm:hidden justify-end mb-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center h-[40px] w-[60px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela"
              >
                <IconAdd color="white" />
              </button>
            </div>

            {showStarterInf && !apps.length && (
              <ApplicationStarterInf onClose={() => setShowStarterInf(false)} />
            )}

            {appsState &&
              appsState.map((app) => (
                <ApplicationPreview
                  key={app._id}
                  app={app}
                  primaryColor={currentApp.primaryColor}
                  onChanged={fetchApps}
                />
              ))}

            {!loading && appsState && appsState.length === 0 && lifecycleTab === 'archived' && (
              <div className="text-center text-gray-500 py-12 font-varela">
                No archived apps. Archived apps appear here so you can restore
                them or permanently delete their data.
              </div>
            )}

            {/* Trailing tile shown only on the Active tab. Re-exposes Create
                (visual peer of an app tile so the next obvious action stays
                in flow), with Import as the muted secondary affordance. */}
            {lifecycleTab === 'active' && (
              <div className="grid grid-rows-[auto,_1fr] md:grid-cols-[auto,_1fr] gap-x-4 p-4 rounded-xl border border-dashed border-gray-300 mb-4 bg-gray-50/40">
                <div className="flex justify-center items-center">
                  <div className="w-[120px] h-[120px] rounded-xl flex justify-center items-center bg-white border border-gray-200">
                    <IconAdd color="#9CA3AF" />
                  </div>
                </div>
                <div className="flex flex-col justify-center md:ml-[40px] gap-2 mt-4 md:mt-0">
                  <div className="font-varela text-[18px]">Add another app</div>
                  <div className="font-sans text-[12px] text-gray-500 mb-2">
                    Start a fresh app, or bring one in from a JSON / ZIP bundle.
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center justify-center h-[40px] bg-brand-500 hover:bg-brand-darker rounded-xl text-white text-sm font-varela px-5"
                    >
                      <IconAdd color="white" className="mr-2" />
                      Create App
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="text-sm text-brand-500 hover:underline font-varela self-center"
                      title="Import an app from a previously-exported JSON or ZIP bundle"
                    >
                      or import from a bundle
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Pagination
              onPageChange={onPageChange}
              pageCount={pageCount}
              forcePage={currentPage}
            />

            {showModal && (
              <NewAppModal
                haveApps={!!apps.length}
                show={showModal}
                onClose={() => setShowModal(false)}
              />
            )}

            {newShowModal && (
              <PreviewAppModal
                haveApps={!!apps.length}
                show={newShowModal}
                onClose={() => setNewShowModal(false)}
              />
            )}

            {showImportModal && (
              <ImportAppModal
                onClose={() => setShowImportModal(false)}
                onImported={() => {
                  setShowImportModal(false);
                  fetchApps();
                }}
                doImport={httpImportApp}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
