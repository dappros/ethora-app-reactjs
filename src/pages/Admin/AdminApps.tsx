import { useEffect, useState } from 'react';
import { ApplicationPreview } from '../../components/ApplicationPreview/ApplicationPreview';
import { ApplicationStarterInf } from '../../components/ApplicationStarterInf/ApplicationStarterInf';
// import { ReadyToCreateFirstAppModal } from "../../components/modal/ReadyToCreateFirstAppModal";
import ReactPaginate from 'react-paginate';
import { NewAppModal } from '../../components/modal/NewAppModal';
import { useAppStore } from '../../store/useAppStore';

import { IconAdd } from '../../components/Icons/IconAdd';
import { Sorting } from '../../components/Sorting';
import { httpGetApps } from '../../http';
import { ModelApp } from '../../models';
import './AdminApps.scss';

const ITEMS_COUNT = 5;

export function AdminApps() {
  const [showStarterInf, setShowStarterInf] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const apps = useAppStore((s) => s.apps);
  const currentUser = useAppStore((s) => s.currentUser);
  const doSetApps = useAppStore((s) => s.doSetApps);
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('createdAt');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    (async function () {
      // @ts-ignore
      const response = await httpGetApps({
        limit: ITEMS_COUNT,
        // @ts-ignore
        order,
        // @ts-ignore
        orderBy,
      });
      setPageCount(Math.ceil(response.data.total / ITEMS_COUNT));
      doSetApps(response.data.apps);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const response = await httpGetApps({
        limit: ITEMS_COUNT,
        // @ts-ignore
        order,
        // @ts-ignore
        orderBy,
      });
      setPageCount(Math.ceil(response.data.total / ITEMS_COUNT));
      doSetApps(response.data.apps);
    })();
  }, [order, orderBy]);

  const onPageChange = (page: number) => {
    httpGetApps({
      ITEMS_COUNT,
      offset: ITEMS_COUNT * page,
      // @ts-ignore
      order,
      // @ts-ignore
      orderBy,
    }).then((response) => {
      const { total, apps } = response.data;
      setCurrentPage(page);
      setPageCount(Math.ceil(total / ITEMS_COUNT));
      doSetApps(apps);
    });
  };

  const renderPagination = () => {
    if (currentUser?.isSuperAdmin) {
      return (
        <div className="admin-apps-pagination">
          <ReactPaginate
            className="table-pagination"
            onPageActive={() => {}}
            onPageChange={({ selected }) => onPageChange(selected)}
            breakLabel="..."
            nextLabel=""
            pageRangeDisplayed={3}
            pageCount={pageCount}
            previousLabel=""
            renderOnZeroPageCount={null}
            forcePage={currentPage}
          />
        </div>
      );
    } else {
      return null;
    }
  };

  const renderSorting = () => {
    if (currentUser?.isSuperAdmin) {
      return (
        <Sorting
          className="mr-16"
          order={order}
          setOrder={setOrder}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
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
  };

  return (
    <div className="admin-apps ">
      <div className="app-content-body-header">
        <div className="font-varena text-[24px]">Apps</div>
        <div className="w-full flex justify-end">
          {renderSorting()}
          <button
            className="bg-brand-500 flex justify-center leading-relaxed items-center text-white font-varela text-sm p-2 rounded-xl w-full max-w-[184px]"
            onClick={() => setShowModal(true)}
          >
            <IconAdd color="white" className="mr-2" />
            <span>Create App</span>
          </button>
        </div>
      </div>
      <div>
        {showStarterInf && (
          <ApplicationStarterInf onClose={() => setShowStarterInf(false)} />
        )}
        {apps.map((app) => {
          return (
            <ApplicationPreview
              primaryColor={currentApp.primaryColor}
              app={app}
              key={app._id}
            />
          );
        })}
      </div>
      {renderPagination()}
      <NewAppModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
