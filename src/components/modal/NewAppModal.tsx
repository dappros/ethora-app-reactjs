import { Dialog, DialogPanel } from '@headlessui/react';
import cn from 'classnames';
import { useState } from 'react';
import { IconClose } from '../Icons/IconClose';

import { toast } from 'react-toastify';
import { actionCreateApp } from '../../actions';
import { Loading } from '../Loading';
import { TextInput } from '../ui/TextInput';
import './NewAppModal.scss';

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
    <Dialog className="new-app-modal" open={true} onClose={() => {}}>
      <DialogPanel className="inner">
        <div className="title">Get Started with Your New App</div>
        <TextInput
          placeholder="App Name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          className="gen-input gen-input-large mb-16"
        />
        <div className="buttons">
          <button className="gen-secondary-btn mb-16" onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={onCreate}
            className={cn('gen-primary-btn mb-16', { disabled: !appName })}
          >
            Continue
          </button>
        </div>
        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
      {loading && <Loading />}
    </Dialog>
  );
}
