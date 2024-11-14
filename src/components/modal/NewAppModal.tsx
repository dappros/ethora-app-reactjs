import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { useState } from 'react';
import { IconClose } from '../Icons/IconClose';

import { toast } from 'react-toastify';
import { actionCreateApp } from '../../actions';
import { Loading } from '../Loading';
import { TextInput } from '../ui/TextInput';
// import './NewAppModal.scss';

interface Props {
  onClose: () => void;
}

export function NewAppModal({ onClose }: Props) {
  const [appName, setAppName] = useState('');
  const [loading, setLoading] = useState(false);

  const onCreate = () => {
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
    // new-app-modal
    <Dialog
      className="fixed inset-x-0 inset-y-0 z-50 flex justify-center items-center bg-black/50"
      open={true}
      onClose={() => {}}
    >
      {/* inner */}
      <DialogPanel className="p-4 sm:p-8 bg-white rounded-3xl w-full max-w-[640px] m-8">
        <div className="relative mb-8">
          <div className="text-center font-varela text-2xl">
            Get Started with Your New App
          </div>
          <button className="absolute top-0 right-0 " onClick={() => onClose()}>
            <IconClose />
          </button>
        </div>
        <TextInput
          placeholder="App Name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="rounded-2xl bg-gray-100 py-3 px-6 w-full mb-8"
        />
        <div className="flex gap-8 items-start">
          <button
            className="w-1/2 border border-brand-500 rounded-2xl py-3"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            className={cn('gen-primary-btn w-1/2', { disabled: !appName })}
          >
            Continue
          </button>
        </div>
      </DialogPanel>
      {loading && <Loading />}
    </Dialog>
  );
}
