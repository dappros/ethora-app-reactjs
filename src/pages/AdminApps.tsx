import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ApplicationPreview } from '../components/ApplicationPreview';
import { ApplicationStarterInf } from '../components/ApplicationStarterInf';
import { IconAdd } from '../components/Icons/IconAdd';
import { NewAppModal } from '../components/modal/NewAppModal';
import { Sorting } from '../components/Sorting';
import { httpGetApps } from '../http';
import { ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';

const ITEMS_COUNT = 5;

type OrderByType =
  | 'createdAt'
  | 'displayName'
  | 'totalRegistered'
  | 'totalSessions'
  | 'totalApiCalls'
  | 'totalFiles'
  | 'totalTransactions';

export default function AdminApps() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [showStarterInf, setShowStarterInf] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const apps = useAppStore((s) => s.apps);
  const currentUser = useAppStore((s) => s.currentUser);
  const doSetApps = useAppStore((s) => s.doSetApps);
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);

  const limit = useMemo(
    () => Number(searchParams.get('limit')) || ITEMS_COUNT,
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

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const fetchApps = useCallback(async () => {
    const response = await httpGetApps({
      limit,
      offset: limit * page,
      order,
      orderBy,
    });

    setPageCount(Math.ceil(response.data.total / limit));
    doSetApps(response.data.apps);
  }, [limit, page, order, orderBy, doSetApps]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

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
      updateSearchParams({ page: selectedItem.selected });
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (newOrderBy: OrderByType, newOrder: 'asc' | 'desc') => {
      updateSearchParams({ orderBy: newOrderBy, order: newOrder, page: 0 });
    },
    [updateSearchParams]
  );

  const renderSorting = useCallback(() => {
    if (currentUser?.isSuperAdmin) {
      return (
        <Sorting
          className="mr-4"
          order={order}
          setOrder={(newOrder) => handleSortChange(orderBy, newOrder)}
          orderBy={orderBy}
          setOrderBy={(newOrderBy) => handleSortChange(newOrderBy, order)}
          orderByList={[
            { key: 'displayName', title: 'Display Name' },
            { key: 'totalRegistered', title: 'Registered' },
            { key: 'totalSessions', title: 'Sessions' },
            { key: 'totalApiCalls', title: 'API' },
            { key: 'totalFiles', title: 'Files' },
            { key: 'totalTransactions', title: 'Transactions' },
            { key: 'createdAt', title: 'Date' },
          ]}
        />
      );
    } else {
      return null;
    }
  }, [currentUser?.isSuperAdmin, order, orderBy, handleSortChange]);

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div id="admin-apps">
      <div>
        <div className="flex justify-between items-center px-4">
          <div className="font-varela text-[18px] md:text-2xl">Apps</div>
          <div className="flex items-center">
            {renderSorting()}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center md:w-[184px] h-[40px] w-[40px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela"
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

        {apps.map((app) => (
          <ApplicationPreview
            key={app._id}
            app={app}
            primaryColor={currentApp.primaryColor}
          />
        ))}

        {currentUser?.isSuperAdmin && (
          <ReactPaginate
            className="flex items-center justify-center gap-2 mt-4 text-gray-500"
            onPageChange={onPageChange}
            breakLabel="..."
            nextLabel="Next ➝"
            pageRangeDisplayed={2}
            pageCount={pageCount}
            previousLabel="⬅ Prev"
            renderOnZeroPageCount={null}
            forcePage={currentPage}
            activeClassName="text-brand-500 font-bold px-3 py-2 rounded"
            pageClassName="px-3 py-2 hover:bg-gray-200"
            previousClassName="px-3 py-2 hover:bg-gray-200"
            nextClassName="px-3 py-2 hover:bg-gray-200"
            disabledClassName="text-grey-300 cursor-not-allowed"
            breakClassName="px-3 py-2"
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
    </div>
  );
}
