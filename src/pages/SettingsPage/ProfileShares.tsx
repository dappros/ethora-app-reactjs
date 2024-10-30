import { Field, Select } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { IconInfo } from '../../components/Icons/IconInfo';
import { Loading } from '../../components/Loading';
// import { Sorting } from '../../components/Sorting';
import { DateTime } from 'luxon';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { IconCopy } from '../../components/Icons/IconCopy';
import { IconDelete } from '../../components/Icons/IconDelete';
import { IconQr } from '../../components/Icons/IconQr';
import { CreateProfileLinkModal } from '../../components/modal/CreateProfileLinkModal';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { TextInput } from '../../components/ui/TextInput';
import { createSharedLink, deleteSharedLink, getSharedLinks } from '../../http';
import { QrModal } from '../../components/modal/QrModal';

const HOUR = 60 * 60 * 1000;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = WEEK * 4;

interface ModelProfileShare {
  createdAt: string;
  updatedAt: string;
  expiration: string;
  memo: string;
  resource: string;
  token: string;
  userId: string;
  walletAddress: string;
  _id: string;
}

export function ProfileShares() {
  const [showNew, setShowNew] = useState(false);
  const [expirationTime, setExpirationTime] = useState(-1);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<ModelProfileShare>>([]);
  const [showDelete, setShowDelete] = useState<ModelProfileShare>();
  const [showQr, setShowQr] = useState<ModelProfileShare>()

  const getItems = () => {
    getSharedLinks().then(({ data }) => {
      let items = data.items.filter((el: any) => el.resource === 'profile');
      console.log({ items });
      setItems(items);
    });
  };

  useEffect(() => {
    getItems();
  }, []);

  const doCreateNewLink = () => {
    let body: any = {
      memo: memo,
      resource: 'profile',
    };

    console.log({ expirationTime });

    if (expirationTime === -1) {
      body.expiration = -1;
    } else {
      body.expiration = Date.now() + expirationTime;
    }

    setLoading(true);
    createSharedLink(body)
      .then(() => {
        toast.success('Success');
        setShowNew(false);
        getItems();
      })
      .catch(() => {
        toast.error('Error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderNewModal = () => {
    if (showNew) {
      return (
        <CreateProfileLinkModal
          onClose={() => {
            setShowNew(false);
          }}
        >
          <h2 className="title mb-32">Create a Profile Sharing link</h2>
          <p className="text-center mb-32">
            Send this link to your trusted contact(s) so they can access your
            profile when you're in Restricted mode.
          </p>
          <div className="plate mb-32">
            <IconInfo />
            You'll be able to remove this link any time if you change your mind.
          </div>
          <div className="subtitle1 mb-32">Expiration</div>
          <div className="caption">
            If you set this, this link will only be valid for the given period
            of time.
          </div>
          <Field className="profile-share-select-field mb-32">
            <Select
              className="profile-share-select"
              onChange={(e) => setExpirationTime(Number(e.target.value))}
            >
              <option value="-1">No Expiration</option>
              <option value={HOUR}>1 hour</option>
              <option value={DAY}>1 day</option>
              <option value={WEEK}>1 week</option>
              <option value={MONTH}>1 month</option>
            </Select>
          </Field>
          <div className="subtitle1 mb-16">Memo</div>
          <div className="caption mb-16">
            Add an optional note so that you remember who you shared this with.
          </div>
          <TextInput
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add note"
            className="gen-input gen-input-large mb-32"
          />
          <div className="buttons">
            <button
              onClick={() => setShowNew(false)}
              className="gen-secondary-btn mb-16"
            >
              Cancel
            </button>
            <button onClick={doCreateNewLink} className="gen-primary-btn mb-16">
              Continue
            </button>
          </div>
          {loading && <Loading />}
        </CreateProfileLinkModal>
      );
    }
  };

  const renderExpiration = (exp: number) => {
    if (exp === -1) {
      return 'infinit';
    } else {
      return DateTime.fromMillis(exp).toFormat('dd LLL yyyy t');
    }
  };

  const onDelete = () => {
    setLoading(true);
    deleteSharedLink(showDelete?.token as string)
      .then(() => {
        toast.success('Success');
        getItems();
        setShowDelete(undefined);
      })
      .catch((_) => {
        toast.error('Error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderItems = () => {
    if (items.length) {
      return (
        <table className="profile-shares-table">
          <thead>
            <tr>
              <th>Memo</th>
              <th>Creation Date</th>
              <th>Expired Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((el) => {
              return (
                <tr key={el._id}>
                  <td>{el.memo ? el.memo : '-'}</td>
                  <td>
                    {DateTime.fromISO(el.createdAt).toFormat('dd LLL yyyy t')}
                  </td>
                  <td>{renderExpiration(Number(el.expiration))}</td>
                  <td className="actions">
                    <button onClick={() => setShowQr(el)}>
                      <IconQr />
                    </button>
                    <CopyToClipboard
                      text={`${window.location.origin}/public/${el.walletAddress}/${el.token}`}
                    >
                      <button>
                        <IconCopy />
                      </button>
                    </CopyToClipboard>
                    <button onClick={() => setShowDelete(el)}>
                      <IconDelete />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {showDelete && (
            <SubmitModal onClose={() => setShowDelete(undefined)}>
              <div className="title">Delete Share Link</div>
              <p className="text-center mb-32">
                {`Are you sure you want to delete share link?`}
              </p>
              <div className="buttons">
                <button
                  onClick={() => setShowDelete(undefined)}
                  className="gen-secondary-btn medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="gen-primary-btn medium danger"
                >
                  Submit
                </button>
                {loading && <Loading />}
              </div>
            </SubmitModal>
          )}
          {showQr && (
            <QrModal path={`${window.location.origin}/public/${showQr.walletAddress}/${showQr.token}`} onClose={() => setShowQr(undefined)} ></QrModal>
          )}
        </table>
      );
    }
  };

  return (
    <div className="profile-shares">
      <div className="subtitle1 mb-16">Current Profile Shares</div>
      <div className="caption">
        Listed below are your currently active profile sharing links. You can
        share or delete them.
      </div>
      <div className="card">
        <div className="card-header">
          <div className="subtitle1">List of shares</div>
          <div className="actions">
            {/* <Sorting
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
            /> */}
            <button
              onClick={() => setShowNew(true)}
              className="gen-primary-btn"
            >
              + Add New Share
            </button>
          </div>
        </div>

        {!items.length && (
          <div className="plate">
            There are no shares yet, or you can add them by clicking the “Add
            New Share” button
          </div>
        )}

        {renderItems()}
      </div>
      {renderNewModal()}
    </div>
  );
}
