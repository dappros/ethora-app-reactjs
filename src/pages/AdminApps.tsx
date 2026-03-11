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
import { getExportAppsCsv, httpGetApps } from '../http';
import { ModelApp, OrderByType } from '../models';
import { useAppStore } from '../store/useAppStore';

export default function AdminApps() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [showStarterInf, setShowStarterInf] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newShowModal, setNewShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const apps = useAppStore((s) => s.apps);
  const [appsState, setAppState] = useState<ModelApp[]>(apps);

  const currentUser = useAppStore((s) => s.currentUser);
  const doSetApps = useAppStore((s) => s.doSetApps);
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);

  const limit = useMemo(
    () => Number(searchParams.get('limit')) || 5,
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
      const response = await httpGetApps({
        limit,
        offset: limit * pageIndex,
        order,
        orderBy,
      });

      setPageCount(Math.ceil(response.data.total / limit));
      doSetApps(response.data.apps);
    } catch (error: AxiosError | any) {
      console.error(error?.response?.data?.error || error);
    } finally {
      setLoading(false);
    }
  }, [limit, pageIndex, order, orderBy, doSetApps]);

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
    <>
      {loading ? (
        <Loading />
      ) : (
        <div id="admin-apps">
          <div>
            <div className="text-center pb-2 font-varela text-[18px] md:text-2xl block sm:hidden">
              Apps
            </div>

            <div className="flex justify-between items-center px-4">
              <div className="font-varela text-[18px] md:text-2xl hidden sm:block">
                Apps
              </div>
              <div className="flex items-center gap-4">
                {renderSorting()}
                {currentUser?.isSuperAdmin && (
                  <CsvButton onClick={getCsvFile} />
                )}
                <button
                  onClick={() => setShowModal(true)}
                  className={classNames(
                    'flex items-center justify-center sm:w-full h-[40px] w-[60px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela',
                    currentUser?.isSuperAdmin ? 'px-0' : 'px-4'
                  )}
                >
                  <IconAdd color="white" className="md:mr-2" />
                  <span className="hidden md:block">Create App</span>
                </button>
              </div>
            </div>
            <div className="my-4 border-b border-b-gray-200"></div>
          </div>

          {/* apps list */}
          <div className="">
            {showStarterInf && !apps.length && (
              <ApplicationStarterInf onClose={() => setShowStarterInf(false)} />
            )}

            {appsState &&
              appsState.map((app) => (
                <ApplicationPreview
                  key={app._id}
                  app={app}
                  primaryColor={currentApp.primaryColor}
                />
              ))}

            {currentUser?.isSuperAdmin && (
              <Pagination
                onPageChange={onPageChange}
                pageCount={pageCount}
                forcePage={currentPage}
              />
            )}
          </div>

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
        </div>
      )}
    </>
  );
}
