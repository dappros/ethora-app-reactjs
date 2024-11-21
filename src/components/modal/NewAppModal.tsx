import { Dialog, DialogPanel } from '@headlessui/react';
import { useState } from 'react';
import { IconClose } from '../Icons/IconClose';

import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { actionCreateApp } from '../../actions';
import firstAppModalPic from '../../assets/first_app_modal_pic.png';
import { Loading } from '../Loading';
// import { TextInput } from '../ui/TextInput';

interface Props {
  onClose: () => void;
  show: boolean;
}

type Inputs = {
  appName: string;
};

export function NewAppModal({ onClose, show }: Props) {
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState(false);
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = ({ appName }) => {
    setLoading(true);
    actionCreateApp(appName)
      .then(() => {
        onClose();
        toast('Application created successfully!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog
      className="fixed inset-x-0 inset-y-0 z-50 flex justify-center items-center bg-black/50 transition duration-300 ease-out data-[closed]:opacity-0"
      open={show}
      transition
      onClose={() => {}}
    >
      {!next && (
        <DialogPanel className="p-4 sm:p-8 bg-white rounded-3xl w-full max-w-[640px] m-8 relative">
          <button
            className="absolute top-[15px] right-[15px] "
            onClick={() => onClose()}
          >
            <IconClose />
          </button>
          <div className="mb-[24px] md:mb-8">
            <div
              className="max:w-[400px] h-[140px] md:h-[240px] w-full bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${firstAppModalPic})` }}
            ></div>
          </div>
          <p className="font-varela text-[18px] md:text-[24px] text-center md:mb-8 mb-[24px]">
            Ready to Create Your First App?
          </p>
          <p className="font-sans text-sm text-center">
            Welcome to our platform!
          </p>
          <p className="font-sans text-sm text-center mb-[24px] md:mb-8">
            In just a few steps, you can launch your first app. Start building
            it now and take advantage of web3 technologies and integrated tools
            to grow your business or community.
          </p>
          <div className="flex flex-col md:flex-row gap-[16px] md:gap-8 items-start">
            <button
              className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
              onClick={onClose}
            >
              View Demo
            </button>
            <button
              onClick={() => setNext(true)}
              className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
            >
              Create App
            </button>
          </div>
        </DialogPanel>
      )}
      {next && (
        <DialogPanel className="p-4 sm:p-8 bg-white rounded-3xl w-full max-w-[640px] m-8 relative">
          <button
            className="absolute top-[15px] right-[15px] "
            onClick={() => onClose()}
          >
            <IconClose />
          </button>
          <div className="font-varela text-[18px] md:text-[24px] text-center md:mb-8 mb-[24px]">
            Get Started with Your New App
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="App Name"
              {...register('appName', { required: true })}
              className="rounded-2xl bg-gray-100 py-3 px-6 w-full mb-[24px] md:mb-8 outline-none"
            />
            <div className="flex flex-col md:flex-row gap-[16px] md:gap-8 items-start">
              <button
                className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="w-full py-[12px] rounded-xl bg-brand-500 text-white">
                Continue
              </button>
            </div>
          </form>
        </DialogPanel>
      )}

      {loading && <Loading />}
    </Dialog>
  );
}
