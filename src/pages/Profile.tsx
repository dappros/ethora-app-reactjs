import { logoutService } from '@ethora/chat-component';
import { Dialog, DialogPanel } from '@headlessui/react';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { DateTime } from 'luxon';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionLogout } from '../actions';
import { IconClose } from '../components/Icons/IconClose';
import { IconDoc } from '../components/Icons/IconDoc';
import { IconEdit } from '../components/Icons/IconEdit';
import { IconLogout } from '../components/Icons/IconLogout';
import { IconQr } from '../components/Icons/IconQr';
import { CreateDocumentModal } from '../components/modal/CreateDocumentModal';
import { QrModal } from '../components/modal/QrModal';
import { ProfilePageUserIcon } from '../components/ProfilePageUserIcon';
import { LanguageSettings } from '../components/settings/LanguageSettings';
import { useHasLanguageSettings } from '../components/settings/useHasLanguageSettings';
import { ThemeSettings } from '../components/settings/ThemeSettings';
import { logLogout } from '../hooks/withTracking.tsx';
import { deleteDocuments, getDocuments, httpLogout } from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { ModelCurrentUser } from '../models';
import { useAppStore } from '../store/useAppStore';

function ProfileSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-sans font-semibold text-[15px]">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Profile() {
  const [showQr, setShowQr] = useState<boolean>(false);
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState('');
  const { t } = useTranslation();
  const hasLanguageSettings = useHasLanguageSettings();
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
          <div className="max-w-[800px] w-full flex px-[16px] flex-col gap-5">
            <div className="">
              <ProfilePageUserIcon
                firstName={firstName}
                lastName={lastName}
                profileImage={profileImage}
              />
            </div>
            <div>
              <p className="text-center font-varela text-[24px]">{`${firstName} ${lastName}`}</p>
              <p className="text-center font-sans text-[16px] text-gray-500">
                {t('profile.onlineOffline')}
              </p>
            </div>
            <ProfileSection title={t('profile.about')}>
              {description ? (
                <p className="font-sans text-[15px] leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              ) : (
                <p className="font-sans text-sm text-gray-500">{t('profile.aboutEmpty')}</p>
              )}
            </ProfileSection>

            <ProfileSection
              title={
                documents.length
                  ? `${t('profile.documents')} · ${documents.length}`
                  : t('profile.documents')
              }
              action={
                <button
                  onClick={() => setShowNewDocModal(true)}
                  className="inline-flex items-center gap-1 rounded-xl bg-brand-500 hover:bg-brand-darker text-white font-sans text-sm font-medium pl-2.5 pr-3.5 py-2 transition-colors"
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                  {t('profile.addDocument')}
                </button>
              }
            >
              {documents.length ? (
                <ul className="flex flex-col gap-2">
                  {documents.map((el) => (
                    <li
                      key={el._id}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="size-10 shrink-0 rounded-lg bg-brand-150 flex items-center justify-center">
                        <IconDoc />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-sans text-sm font-medium truncate">
                          {el.documentName}
                        </div>
                        <div className="font-sans text-xs text-gray-500">
                          {DateTime.fromISO(el.createdAt).toFormat('dd LLL yyyy, t')}
                        </div>
                      </div>
                      <button
                        onClick={() => showDeleteModal(el._id)}
                        aria-label={t('profile.deleteDocumentAria').replace('{name}', el.documentName)}
                        title={t('profile.deleteDocument.delete')}
                        className="size-9 shrink-0 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center font-sans text-sm text-gray-500">
                  {t('profile.documentsEmpty')}
                </div>
              )}
            </ProfileSection>

            {/* Same controls as Account > Appearance, kept here too so
                they are one tap away from the profile. */}
            <ProfileSection title={t('profile.preferences')}>
              <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t('appearance.themeHeading')}
              </p>
              <ThemeSettings />
              {hasLanguageSettings && (
                <>
                  <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wide mt-6 mb-2">
                    {t('appearance.languageHeading')}
                  </p>
                  <LanguageSettings />
                </>
              )}
            </ProfileSection>

            <button
              className="mb-8 w-full rounded-2xl border border-gray-200 px-5 py-4 inline-flex items-center justify-center gap-2 text-red-500 font-sans font-medium hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
              onClick={() => onLogout()}
            >
              <IconLogout />
              <span>{t('profile.logout')}</span>
            </button>
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
                className="bg-red-500 w-full py-[12px] rounded-xl bg-brand-500 text-white"
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
