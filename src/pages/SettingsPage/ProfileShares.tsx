import { Field, Select } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { IconInfo } from '../../components/Icons/IconInfo';
import { Loading } from '../../components/Loading';
import { Sorting } from '../../components/Sorting';
import { CreateProfileLinkModal } from '../../components/modal/CreateProfileLinkModal';
import { TextInput } from '../../components/ui/TextInput';
import { createSharedLink, getSharedLinks } from '../../http';

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
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [showNew, setShowNew] = useState(false);
  const [expirationTime, setExpirationTime] = useState(0);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<ModelProfileShare>>([]);

  const getItems = () => {
    getSharedLinks().then(({ data }) => {
      let items = data.items.filter((el: any) => el.resource === 'profile');
      setItems(items);
    });
  };

  useEffect(() => {
    getItems();
  }, []);

  const doCreateNewLink = () => {
    const body = {
      expiration: expirationTime,
      memo: memo,
      resource: 'profile',
    };

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
              <option value="no_expiration">No Expiration</option>
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

  const renderItems = () => {
    if (items.length) {
      return (
        <div>
          {items.map((el) => {
            return <div key={el._id}>{el._id}</div>;
          })}
        </div>
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
