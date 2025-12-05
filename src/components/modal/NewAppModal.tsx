import { Dialog, DialogPanel } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { IconClose } from '../Icons/IconClose';

import { CircularProgress } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionCreateApp } from '../../actions';
import { useGoogleTranslateFix } from '../../hooks/useGoogleTranslateFix';
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

        setTimeout(() => {
          toast('Application created successfully!');
          setLoading(false);
          navigate(`/app/admin/apps/${app._id}/settings`, {
            state: { from: location.pathname + location.search },
          });
          localStorage.removeItem('newUser');

          onClose();
        }, 1500);
      })
      .catch(() => {
        toast.error('Error creating application.');
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
      onClose={() => {}}
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
              Application creation in progress!
            </div>
            <p className="font-sans text-base text-left mb-4">
              Your app is being deployed. Please wait, this might take up to
              10-15 seconds{dots}
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
              Get Started with Your New App
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="App Name"
                  {...register('appName', {
                    required: 'App name is required',
                    minLength: {
                      value: 3,
                      message: 'App name must be at least 3 characters',
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
              <div className="flex gap-4">
                <button
                  className="w-full py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="w-full py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker"
                  type="submit"
                >
                  Continue
                </button>
              </div>
            </form>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}
