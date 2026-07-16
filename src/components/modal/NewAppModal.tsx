import { Dialog, DialogPanel } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { IconClose } from '../Icons/IconClose';

import { CircularProgress } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionCreateApp } from '../../actions';
import { useGoogleTranslateFix } from '../../hooks/useGoogleTranslateFix';
import { useTranslation } from '../../i18n/useTranslation';
// import { TextInput } from '../ui/TextInput';

interface Props {
  onClose: () => void;
  show: boolean;
  haveApps: boolean;
}

type Inputs = {
  appName: string;
};

export function NewAppModal({ onClose, show }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const fixKey = useGoogleTranslateFix();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const [dots, setDots] = useState('');

  const onSubmit: SubmitHandler<Inputs> = ({ appName }) => {
    setLoading(true);
    setProgress(0);

    let serverResponded = false;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (serverResponded) return prev;
        return prev < 100 ? prev + 5 : 100;
      });
    }, 500);

    actionCreateApp(appName)
      .then((app) => {
        serverResponded = true;
        clearInterval(interval);

        setProgress(100);

        // Brief pause so the 100% progress flashes into the user's eye
        // before we navigate away; previously 1500ms which felt like
        // dead time on top of an already-slow modal transition.
        setTimeout(() => {
          toast(t('newAppModal.createSuccessToast'));
          setLoading(false);
          navigate(`/app/admin/apps/${app._id}/settings`, {
            state: { from: location.pathname + location.search },
          });
          localStorage.removeItem('newUser');
          localStorage.setItem('firstAdd', true.toString());

          onClose();
        }, 400);
      })
      .catch(() => {
        toast.error(t('newAppModal.createErrorToast'));
        clearInterval(interval);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!loading) return;

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, [loading]);

  return (
    <Dialog
      key={fixKey}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
      open={show}
      onClose={() => {
        if (!loading) onClose();
      }}
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-[20px] bg-white rounded-3xl w-full max-w-[640px] m-8 relative">
        <button
          className="absolute top-[15px] right-[15px]"
          onClick={() => onClose()}
        >
          <IconClose />
        </button>

        {loading ? (
          <>
            <div className="font-varela text-[18px] md:text-[24px] text-center mb-4 text-brand-500">
              {t('newAppModal.creatingTitle')}
            </div>
            <p className="font-sans text-base text-left mb-4">
              {t('newAppModal.creatingMessage')}
              {dots}
            </p>

            <div className="flex flex-col items-center justify-center">
              <div className="relative inline-flex items-center justify-center">
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={80}
                  thickness={5}
                  sx={{
                    color: '#0052CD',
                  }}
                />
                <div className="absolute text-base font-semibold">
                  {progress}%
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="font-varela text-[18px] md:text-[24px] text-center mb-8">
              {t('newAppModal.title')}
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={t('newAppModal.namePlaceholder')}
                  {...register('appName', {
                    required: t('newAppModal.nameRequired'),
                    minLength: {
                      value: 3,
                      message: t('newAppModal.nameMinLength'),
                    },
                  })}
                  className={`rounded-2xl bg-gray-100 py-3 px-6 w-full outline-none ${
                    errors.appName
                      ? 'border-2 border-red-500'
                      : 'border-2 border-transparent'
                  }`}
                />
                {errors.appName && (
                  <p className="text-red-500 text-sm mt-1 px-6">
                    {errors.appName.message}
                  </p>
                )}
              </div>
              <button
                className="w-full py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker"
                type="submit"
              >
                {t('newAppModal.continueButton')}
              </button>
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                  onClick={onClose}
                >
                  {t('newAppModal.cancelButton')}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}
