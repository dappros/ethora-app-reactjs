import { useEffect, useState } from "react";
import { ApplicationPreview } from "../../components/ApplicationPreview/ApplicationPreview";
import { ApplicationStarterInf } from "../../components/ApplicationStarterInf/ApplicationStarterInf";
// import { ReadyToCreateFirstAppModal } from "../../components/modal/ReadyToCreateFirstAppModal";
import { NewAppModal } from "../../components/modal/NewAppModal";
import { useAppStore } from "../../store/useAppStore";
import ReactPaginate from "react-paginate";

import "./AdminApps.scss"
import { Sorting } from "../../components/Sorting";
import { httpGetApps } from "../../http";

const ITEMS_COUNT = 5

export function AdminApps() {
    const [showStarterInf, setShowStarterInf] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const apps = useAppStore(s => s.apps)
    const currentUser = useAppStore(s => s.currentUser)
    const doSetApps = useAppStore(s => s.doSetApps)

    const [order, setOrder] = useState('asc')
    const [orderBy, setOrderBy] = useState('createdAt')

    const [currentPage, setCurrentPage] = useState(0)
    const [pageCount, setPageCount] = useState(0)

    useEffect(() => {
        (
            async function() {
                // @ts-ignore
                const response = await httpGetApps({limit: ITEMS_COUNT, order, orderBy})
                setPageCount(Math.ceil(response.data.total / ITEMS_COUNT))
                doSetApps(response.data.apps)
            }
        )()
    }, [])

    useEffect(() => {
        (async () => {
            // @ts-ignore
            const response = await httpGetApps({limit: ITEMS_COUNT, order, orderBy})
            setPageCount(Math.ceil(response.data.total / ITEMS_COUNT))
            doSetApps(response.data.apps)
        })()
    }, [order, orderBy])

    const renderAppCreationModal = () => {
        return (
            <NewAppModal onClose={() => setShowModal(false)} />
        )
        // if app.length === 0
        // return (
        //     <ReadyToCreateFirstAppModal onClose={() => setShowModal(false)} />
        // )
    }

    const onPageChange = (page: number) => {
        // @ts-ignore
        httpGetApps({ITEMS_COUNT, offset: ITEMS_COUNT * page, order, orderBy})
            .then((response) => {
                const { total, apps } = response.data
                setCurrentPage(page)
                setPageCount(Math.ceil(total / ITEMS_COUNT))
                doSetApps(apps)
            })
    }

    const renderPagination = () => {
        if (currentUser?.isSuperAdmin) {
            return (
                <div className="admin-apps-pagination">
                    <ReactPaginate className="table-pagination"
                        onPageActive={() => { }}
                        onPageChange={({selected}) => onPageChange(selected)}
                        breakLabel="..."
                        nextLabel=""
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        previousLabel=""
                        renderOnZeroPageCount={null}
                        forcePage={currentPage}
                    />
                </div>
            )
        } else {
            return null
        }
    }

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
                        { key: 'createdAt', title: 'Date' }
                    ]}
                />
            )
        } else {
            return null
        }
    }

    return (
        <div className="admin-apps">
            <div className="app-content-body-header">
                <div className="left">
                    Apps
                </div>
                <div className="right">
                    {renderSorting()}
                    <button className="primary-btn" onClick={() => setShowModal(true)}>
                        <span className="content">
                            Create App
                        </span>
                    </button>
                </div>
            </div>
            <div>

                {showStarterInf && <ApplicationStarterInf onClose={() => setShowStarterInf(false)} />}
                {
                    apps.map((app) => {
                        return (
                            <ApplicationPreview app={app} key={app._id} />
                        )
                    })
                }

            </div>
            {renderPagination()}
            {showModal && renderAppCreationModal()}
        </div>
    )
}
