import { Dialog, DialogPanel } from '@headlessui/react';

import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IconAdmin } from '../Icons/IconAdmin';
import { IconChat } from '../Icons/IconChat';
import { IconClose } from '../Icons/IconClose';
import { IconSettings } from '../Icons/IconSettings';
import './MobileMenuModal.scss';

interface Props {
  onClose: () => void;
}

export function MobileMenuModal({ onClose }: Props) {
  useEffect(() => {
    function onResize() {
      onClose();
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return (
    <Dialog className="fixed inset-0 bg-black/30 flex justify-start items-stretch " open={true} onClose={() => onClose()}>
      <DialogPanel className="bg-white relative rounded-r-xl p-4 w-8/12 flex flex-col justify-between">
        <button className="absolute top-[24px] left-[16px]" onClick={onClose}>
          <IconClose />
        </button>
        <div className="mt-[72px]">

          <NavLink
            to="/app/chat"
            onClick={onClose}
            className="group flex p-[12px] aria-[current=page]:bg-brand-150 rounded-xl"
          >
            <IconChat />
            <span className="ml-2 group-aria-[current=page]:text-brand-500">Chats</span>
          </NavLink>
          <NavLink
            to="/app/admin/apps"
            onClick={onClose}
            className="group flex p-[12px] aria-[current=page]:bg-brand-150 rounded-xl"
          >
            <IconAdmin />
            <span className="ml-2 group-aria-[current=page]:text-brand-500">Admin</span>
          </NavLink>
        </div>
        <div className="">
          <NavLink
            to="/app/settings"
            onClick={onClose}
            className="group flex p-[12px] aria-[current=page]:bg-brand-150 rounded-xl"
          >
            <IconSettings />
            <span className="ml-2 group-aria-[current=page]:text-brand-500 font-sans ">Settings</span>
          </NavLink>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
