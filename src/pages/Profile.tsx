import { logoutService } from '@ethora/chat-component';
import {
  Dialog,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionLogout, actionSetUiLanguage } from '../actions';
import { IconClose } from '../components/Icons/IconClose';
import { IconDoc } from '../components/Icons/IconDoc';
import { IconEdit } from '../components/Icons/IconEdit';
import { IconLogout } from '../components/Icons/IconLogout';
import { IconQr } from '../components/Icons/IconQr';
import { CreateDocumentModal } from '../components/modal/CreateDocumentModal';
import { QrModal } from '../components/modal/QrModal';
import { LanguageModal } from '../components/modal/LanguageModal';
import { ProfilePageUserIcon } from '../components/ProfilePageUserIcon';
import {
  UiLocale,
  resolveAvailableLanguages,
} from '../constants/languageOptionsConstants';
import { logLogout } from '../hooks/withTracking.tsx';
import { deleteDocuments, getDocuments, httpLogout } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { ModelCurrentUser } from '../models';
import { useAppStore } from '../store/useAppStore';

export default function Profile() {
  const [showQr, setShowQr] = useState<boolean>(false);
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { t } = useTranslation();
  // App-wide UI language (see store/appStore.ts's uiLanguage /
  // doSetUiLanguage). Reading it from the store - not local state - means
  // every component using useTranslation() re-renders together when it
  // changes here.
  const uiLanguage = useAppStore((s) => s.uiLanguage);
  // Languages this install offers, learned from the login / me response
  // (deploy.yml `chat.translates`). Falls back to the full bundled catalogue
  // if the server sent nothing usable - see
  // constants/languageOptionsConstants.ts. One entry means a single-language
  // install, and the picker below is not rendered at all.
  const availableLanguages = useAppStore((s) => s.availableLanguages);
  const languageOptions = resolveAvailableLanguages(availableLanguages);
  const currentLanguageName =
    languageOptions.find((l) => l.id === uiLanguage)?.name ?? uiLanguage;
  const {
    firstName,
    lastName,
    profileImage,
    description,
    defaultWallet: { walletAddress },
  } = useAppStore((s) => s.currentUser as ModelCurrentUser);

  const navigate = useNavigate();

  const componentGetDocs = async () => {
    const { data } = await getDocuments(walletAddress);
    const items = data.results.filter(
      (el: { locations: unknown[] }) => el.locations[0]
    );
    setDocuments(items);
  };

  useEffect(() => {
    componentGetDocs();
  }, []);

  const showDeleteModal = (id: string) => {
    setDeleteDocumentId(id);
    setShowDelete(true);
  };

  const handleDeleteDocument = () => {
    deleteDocuments(deleteDocumentId)
      .then(() => {
        // componentGetDocs();
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc._id !== deleteDocumentId)
        );
        toast.success(t('profile.deleteDocument.success'));
      })
      .catch(() => {
        toast.error(t('profile.deleteDocument.error'));
      });
    setShowDelete(false);
  };

  // The switch itself is local and instant; persisting it to the profile is
  // the part that can fail. On failure the UI stays on the newly-picked
  // language (it's still cached locally) and we say the save didn't stick,
  // rather than yanking the interface back to the old one.
  const onChangeUiLanguage = async (code: UiLocale) => {
    setShowLanguageModal(false);
    try {
      await actionSetUiLanguage(code);
      toast.success(t('language.savedToast'));
    } catch (e) {
      console.error('[Profile] failed to save language to profile', e);
      toast.error(t('language.saveFailedToast'));
    }
  };

  const onLogout = async () => {
    httpLogout().then(() => {
      logLogout();
      actionLogout();
      logoutService.performLogout();
      document.cookie =
        'ethora_user=; domain=.ethora.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      navigate('/login', { replace: true });
    });
  };

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px]">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          {t('nav.profile')}
        </div>
      </div>
      <div className="rounded-2xl bg-white px-4 h-full grid grid-rows-[72px,_1fr]">
        <div className="flex justify-end">
          <div className="flex items-center justify-center">
            <button
              className="mr-4 rounded-xl w-[40px] h-[40px] flex items-center justify-center hover:bg-brand-hover"
              onClick={() => setShowQr(true)}
            >
              <IconQr />
            </button>
            <button
              className="w-[40px] rounded-xl h-[40px] flex items-center justify-center hover:bg-brand-hover"
              onClick={() => navigate('/app/profile/edit')}
            >
              <IconEdit />
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="max-w-[800px] w-full flex px-[16px] flex-col gap-8">
            <div className="">
              <ProfilePageUserIcon
                firstName={firstName}
                lastName={lastName}
                profileImage={profileImage}
              />
            </div>
            <div>
              <p className="text-center font-varela text-[24px]">{`${firstName} ${lastName}`}</p>
              <p className="text-center font-sans text-[16px] text-[#8C8C8C]">
                {t('profile.onlineOffline')}
              </p>
            </div>
            <div className="border border-[#F0F0F0] rounded-xl p-4">
              <p className="text-[#8C8C8C] font-sans text-[14px] mb-2">
                {t('profile.about')}
              </p>
              <p className="text-black text-regular">{description}</p>
            </div>
            <div className="border border-[#F0F0F0] rounded-xl p-4">
              <TabGroup className="px-2">
                <TabList className="h-[44px] flex mb-4">
                  <Tab
                    key="documents"
                    // w-1/2 if there's a collection
                    className="border-b border-b-[#F0F0F0] w-full data-[selected]:text-brand-500 data-[selected]:border-b-brand-500"
                  >
                    {t('profile.documents')}
                  </Tab>
                  {/* <Tab
                    key="collections"
                    className="border-b border-b-[#F0F0F0] w-1/2 data-[selected]:text-brand-500 data-[selected]:border-b-brand-500 pointer-events-none text-gray-300"
                  >
                    Collections
                  </Tab> */}
                </TabList>
                <TabPanels className="">
                  <TabPanel key="">
                    <button
                      onClick={() => setShowNewDocModal(true)}
                      className="w-full hover:bg-brand-darker bg-brand-500 text-white py-4 font-varela text-[16px] rounded-xl mb-4"
                    >
                      {t('profile.addDocument')}
                    </button>
                    {documents.map((el) => (
                      <div
                        className="bg-[#F3F6FC] rounded-lg p-2 mb-4 flex items-center justify-between"
                        key={el._id}
                      >
                        <div className="flex items-center">
                          <div className="w-[40px] h-[40px] bg-white rounded-lg flex items-center justify-center">
                            <IconDoc />
                          </div>
                          <div className="ml-2">
                            <div className="text-[14px]">{el.documentName}</div>
                            <div className="text-[#8C8C8C] text-[12px]">
                              {DateTime.fromISO(el.createdAt).toFormat(
                                'dd LLL yyyy t'
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          color="error"
                          onClick={() => showDeleteModal(el._id)}
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    ))}
                  </TabPanel>
                  {/* <TabPanel key="collections">collections</TabPanel> */}
                </TabPanels>
              </TabGroup>
            </div>
            {/* Hidden entirely on a single-language install (deploy.yml
                `chat.translates` empty or one code): a picker with nothing to
                pick reads as a broken control, not as a setting. */}
            {languageOptions.length > 1 && (
              <div className="border border-[#F0F0F0] rounded-xl p-4">
                <p className="text-[#8C8C8C] font-sans text-[14px] mb-2">
                  {t('profile.language')}
                </p>
                <button
                  onClick={() => setShowLanguageModal(true)}
                  className="w-full text-left rounded-xl border border-gray-300 px-3 py-2 bg-white hover:bg-brand-hover"
                >
                  {currentLanguageName}
                </button>
              </div>
            )}
            <div className="border border-[#F0F0F0] rounded-xl p-4 text-center mb-8">
              <button
                className="text-[#F44336] p-4 w-full rounded-xl hover:bg-brand-hover font-varela text-regular inline-flex items-center justify-center"
                onClick={() => onLogout()}
              >
                <IconLogout />
                <span className="ml-2">{t('profile.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showQr && (
        <QrModal
          path={`${window.location.origin}/public/${walletAddress}`}
          onClose={() => setShowQr(false)}
        />
      )}
      {showNewDocModal && (
        <CreateDocumentModal
          componentGetDocs={componentGetDocs}
          onClose={() => setShowNewDocModal(false)}
        />
      )}
      {showLanguageModal && (
        <LanguageModal
          value={uiLanguage}
          options={languageOptions}
          onSelect={onChangeUiLanguage}
          onClose={() => setShowLanguageModal(false)}
        />
      )}

      {showDelete && (
        <Dialog
          className="fixed inset-x-0 inset-y-0 z-50 flex justify-center items-center bg-black/50 transition duration-300 ease-out data-[closed]:opacity-0"
          open={showDelete}
          transition
          onClose={() => {}}
        >
          <DialogPanel className="p-4 sm:p-8 bg-white rounded-3xl w-full max-w-[640px] m-8 relative">
            <button
              className="absolute top-[15px] right-[15px] "
              onClick={() => setShowDelete(false)}
            >
              <IconClose />
            </button>
            <div className="font-varela text-[18px] md:text-[24px] text-center md:mb-8 mb-[24px]">
              {t('profile.deleteDocument.title')}
            </div>
            <p className="font-sans text-[14px] mb-8 text-center">
              {t('profile.deleteDocument.confirm')}
            </p>
            <div className="flex flex-col md:flex-row gap-[16px] md:gap-8 items-start">
              <button
                className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500 hover:bg-brand-hover"
                onClick={() => setShowDelete(false)}
              >
                {t('profile.deleteDocument.cancel')}
              </button>
              <button
                className="bg-[#F44336] w-full py-[12px] rounded-xl bg-brand-500 text-white"
                onClick={handleDeleteDocument}
              >
                {t('profile.deleteDocument.delete')}
              </button>
            </div>
          </DialogPanel>
        </Dialog>
      )}
    </div>
  );
}
