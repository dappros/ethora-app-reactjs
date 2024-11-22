import { Dialog, DialogPanel, Field, Select } from '@headlessui/react';
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
import { QrModal } from '../../components/modal/QrModal';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { createSharedLink, deleteSharedLink, getSharedLinks } from '../../http';
import { IconAdd } from '../../components/Icons/IconAdd';
import { IconClose } from '../../components/Icons/IconClose';

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
  const [showQr, setShowQr] = useState<ModelProfileShare>();

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
        <>
          <Dialog
            className="fixed inset-0 flex justify-center items-center bg-black/30"
            open={true}
            onClose={() => {
              setShowNew(false);
            }}
          >
            <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] m-4 flex flex-col items-center">
              <h2 className="font-varela text-[24px] mb-8 text-center pl-2">Create a Profile Sharing link</h2>
              <div className="max-w-[512px] w-full">
                <p className="font-sans text-[14px] text-center mb-8">
                  Send this link to your trusted contact(s) so they can access your
                  profile when you're in Restricted mode.
                </p>
                <div className="p-2 bg-[#F3F6FC] rounded-lg grid grid-cols-[16px,_1fr] gap-2 items-center mb-8">
                  <IconInfo />
                  <span className="text-[12px]">
                    You'll be able to remove this link any time if you change your mind.
                  </span>
                </div>

                <h3 className="font-semibold text-[16px] text-left mb-4">Expiration</h3>
                <div className="text-[12px] text-[#8C8C8C] mb-4">
                  If you set this, this link will only be valid for the given period of time.
                </div>
                <Field className="bg-[#F5F7F9] w-full py-[12px] px-[16px] rounded-xl mb-8">
                  <Select
                    className="w-full bg-[#F5F7F9]"
                    onChange={(e) => setExpirationTime(Number(e.target.value))}
                  >
                    <option value="-1">No Expiration</option>
                    <option value={HOUR}>1 hour</option>
                    <option value={DAY}>1 day</option>
                    <option value={WEEK}>1 week</option>
                    <option value={MONTH}>1 month</option>
                  </Select>
                </Field>
                <div className="font-semibold text-[16px] text-left mb-4">Memo</div>
                <div className="text-[12px] text-[#8C8C8C] mb-4">
                  Add an optional note so that you remember who you shared this with.
                </div>
                <input
                  type="text"
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add note"
                  className="w-full bg-[#F5F7F9] rounded-xl px-[12px] py-[16px] placeholder:text-[#8C8C8C] outline-none mb-8"
                />
                <div className="flex gap-8">
                  <button
                    onClick={() => setShowNew(false)}
                    className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={doCreateNewLink}
                    className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
                  >
                    Continue
                  </button>
                </div>
              </div>

              {loading && <Loading />}
              <button
                className="absolute top-[24px] right-[24px] md:top-[32px] md:right-[32px]"
                onClick={() => setShowNew(false)}
              >
                <IconClose />
              </button>
            </DialogPanel>
          </Dialog>
        </>
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
        <div className="profile-shares-table-outer">
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
              <QrModal
                path={`${window.location.origin}/public/${showQr.walletAddress}/${showQr.token}`}
                onClose={() => setShowQr(undefined)}
              ></QrModal>
            )}
          </table>
        </div>
      );
    }
  };

  return (
    <div className="md:ml-4">
      <div className="font-sans font-semibold text-[16px] mb-2">Current Profile Shares</div>
      <div className="text-[#8C8C8C] text-[12px] mb-4">
        Listed below are your currently active profile sharing links. You can
        share or delete them.
      </div>
      <div className="border border-[#F0F0F0] rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div className="font-sans font-semibold text-[16px]">List of shares</div>
          <div className="actions">
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center justify-center md:w-[184px] p-2 h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela"
            >
              <IconAdd color="white" className="md:mr-2" />
              <span className="hidden md:block">Add New Share</span>
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
