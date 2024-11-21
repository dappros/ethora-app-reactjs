import { useEffect, useState } from 'react';
import { ApplicationPreview } from '../components/ApplicationPreview';
import { IconAdd } from '../components/Icons/IconAdd';
import { httpGetApps } from '../http';
import { ModelApp } from '../models';
import { useAppStore } from '../store/useAppStore';
import { NewAppModal } from '../components/modal/NewAppModal';
import { ApplicationStarterInf } from '../components/ApplicationStarterInf';

const ITEMS_COUNT = 5;

export default function AdminApps() {
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

  return (
    <>
      <div>
        <div className="flex justify-between items-center px-4">
          <div className="font-varela text-[18px] md:text-2xl">Apps</div>
          <div>
            <button onClick={() => setShowModal(true)} className="flex items-center justify-center md:w-[184px] h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela">
              <IconAdd color="white" className="md:mr-2" />
              <span className="hidden md:block">Create App</span>
            </button>
          </div>
        </div>
        <div className="my-4 border-b border-b-gray-200"></div>
      </div>
      {/* apps list */}
      <div className="">
        <ApplicationStarterInf onClose={() => {}} />
        {apps.map((app) => (
          <ApplicationPreview
            key={app._id}
            app={app}
            primaryColor={currentApp.primaryColor}
          />
        ))}
      </div>
      {showModal && <NewAppModal show={showModal} onClose={() => setShowModal(false)} />}
    </>
  );
}
