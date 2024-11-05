import { Field, Select } from '@headlessui/react';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { IconCopy } from '../../components/Icons/IconCopy';
import { IconDelete } from '../../components/Icons/IconDelete';
import { IconInfo } from '../../components/Icons/IconInfo';
import { IconQr } from '../../components/Icons/IconQr';
import { Loading } from '../../components/Loading';
import { CreateProfileLinkModal } from '../../components/modal/CreateProfileLinkModal';
import { QrModal } from '../../components/modal/QrModal';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { TextInput } from '../../components/ui/TextInput';
import {
  createSharedLink,
  deleteSharedLink,
  getDocuments,
  getSharedLinks,
} from '../../http';
import { ModelCurrentUser } from '../../models';
import { useAppStore } from '../../store/useAppStore';

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
  targetRecordId: string;
}

const HOUR = 60 * 60 * 1000;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = WEEK * 4;

export function DocumentShares() {
  const [showNew, setShowNew] = useState(false);
  const [items, setItems] = useState<Array<ModelProfileShare>>([]);
  const [showDelete, setShowDelete] = useState<ModelProfileShare>();
  const [showQr, setShowQr] = useState<ModelProfileShare>();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Array<any>>([]);
  const user = useAppStore((s) => s.currentUser as ModelCurrentUser);
  const [expirationTime, setExpirationTime] = useState(-1);
  const [memo, setMemo] = useState('');
  const [documentForShare, setDocumentForShare] = useState('');

  useEffect(() => {
    console.log({ documentForShare });
  }, [documentForShare]);

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

  const componentGetDocs = async () => {
    let { data } = await getDocuments(user.defaultWallet.walletAddress);
    // @ts-ignore
    let items = data.results.filter((el) => el.locations[0]);
    setDocuments(items);
  };

  useEffect(() => {
    componentGetDocs();
  }, []);

  const getItems = () => {
    getSharedLinks().then(({ data }) => {
      let items = data.items.filter((el: any) => el.resource === 'document');
      console.log({ items });
      setItems(items);
    });
  };

  const renderExpiration = (exp: number) => {
    if (exp === -1) {
      return 'infinit';
    } else {
      return DateTime.fromMillis(exp).toFormat('dd LLL yyyy t');
    }
  };

  const doCreateNewLink = () => {
    let body: any = {
      memo: memo,
      resource: 'document',
    };

    console.log({ expirationTime });

    if (expirationTime === -1) {
      body.expiration = -1;
    } else {
      body.expiration = Date.now() + expirationTime;
    }

    body.documentId = documentForShare;

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

  useEffect(() => {
    getItems();
  }, []);

  const renderNewModal = () => {
    if (showNew) {
      return (
        <CreateProfileLinkModal
          onClose={() => {
            setShowNew(false);
          }}
        >
          <h2 className="title mbc-32">Create a Profile Sharing link</h2>
          <p className="text-center mbc-32">
            Send this link to your trusted contact(s) so they can access your
            profile when you're in Restricted mode.
          </p>
          <div className="plate mbc-32">
            <IconInfo />
            You'll be able to remove this link any time if you change your mind.
          </div>
          <div className="subtitle1 mbc-32">Expiration</div>
          <div className="caption">
            If you set this, this link will only be valid for the given period
            of time.
          </div>
          <div className="subtitle1 mbc-32">Document</div>
          <Field className="profile-share-select-field mbc-32">
            <Select
              className="profile-share-select"
              onChange={(e) => {
                setDocumentForShare(e.target.value);
              }}
            >
              <option value="-1">Choose Document</option>
              {documents.map((el) => {
                return (
                  <option key={el._id} value={el._id}>
                    <span>
                      <span>{el.documentName}</span>
                    </span>
                  </option>
                );
              })}
            </Select>
          </Field>
          <div className="caption">
            Choose the Document you would like to share.
          </div>
          <Field className="profile-share-select-field mbc-32">
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
          <div className="subtitle1 mbc-16">Memo</div>
          <div className="caption mbc-16">
            Add an optional note so that you remember who you shared this with.
          </div>
          <TextInput
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add note"
            className="gen-input gen-input-large mbc-32"
          />
          <div className="buttons">
            <button
              onClick={() => setShowNew(false)}
              className="gen-secondary-btn mbc-16"
            >
              Cancel
            </button>
            <button
              onClick={doCreateNewLink}
              className="gen-primary-btn mbc-16"
            >
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
        <table className="profile-shares-table">
          <thead>
            <tr>
              <th>Document Name</th>
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
                  <td>{el.targetRecordId}</td>
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
                      text={`${import.meta.env.VITE_API}/docs/share/${el.token}`}
                      onCopy={() => toast.success('Copied')}
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
              <p className="text-center mbc-32">
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
                  onClick={() => onDelete()}
                  className="gen-primary-btn medium danger"
                >
                  Submit
                </button>
                {loading && <Loading />}
              </div>
            </SubmitModal>
          )}
          {showQr && (
            <QrModal
              path={`${import.meta.env.VITE_API}/docs/share/${showQr.token}`}
              onClose={() => setShowQr(undefined)}
            ></QrModal>
          )}
        </table>
      );
    }
  };

  return (
    <div className="profile-shares">
      <div className="subtitle1 mbc-16">Current Document Shares</div>
      <div className="caption">
        Listed below are your currently active document sharing links. You can
        share or delete them.
      </div>
      <div className="card">
        <div className="card-header">
          <div className="subtitle1">List of shares</div>
          <div className="actions">
            {' '}
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
