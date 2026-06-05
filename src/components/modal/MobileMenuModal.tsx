import { Dialog, DialogPanel } from '@headlessui/react';

import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { IconAccount } from '../Icons/IconAccount';
import { IconAdmin } from '../Icons/IconAdmin';
import { IconAgents } from '../Icons/IconAgents';
import { IconBilling } from '../Icons/IconBilling';
import { IconChat } from '../Icons/IconChat';
import { IconClose } from '../Icons/IconClose';
import { IconHelp } from '../Icons/IconHelp';
import { UnreadBadge } from '../UnreadBadge';
import './MobileMenuModal.scss';

interface Props {
  isAdmin?: boolean;
  onClose: () => void;
}

export function MobileMenuModal({ onClose, isAdmin }: Props) {
  const aiEnabled = import.meta.env.VITE_AI_FEATURE_ENABLED === 'true';

  useEffect(() => {
    function onResize() {
      onClose();
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const itemBase =
    'group flex p-[12px] aria-[current=page]:bg-brand-150 rounded-xl items-center';
  const labelBase = 'ml-2 group-aria-[current=page]:text-brand-500';

  return (
    <Dialog
      className="fixed inset-0 bg-black/30 flex z-50 justify-start items-stretch "
      open={true}
      onClose={() => onClose()}
    >
      <DialogPanel className="bg-white relative rounded-r-xl p-4 w-8/12 flex flex-col justify-between">
        <button className="absolute top-[24px] left-[16px]" onClick={onClose}>
          <IconClose />
        </button>
        <div className="mt-[72px]">
          {isAdmin && (
            <NavLink to="/app/admin/apps" onClick={onClose} className={itemBase}>
              <IconAdmin />
              <span className={labelBase}>Apps</span>
            </NavLink>
          )}
          <NavLink to="/app/chat" onClick={onClose} className={itemBase}>
            <IconChat />
            <span className={labelBase}>Chats</span>
            <UnreadBadge className="ml-2" />
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/app/admin/agents"
              onClick={onClose}
              title={
                aiEnabled
                  ? undefined
                  : 'AI features are not enabled in this deployment'
              }
              className={classNames(itemBase, {
                'cursor-not-allowed pointer-events-none opacity-50': !aiEnabled,
              })}
            >
              <IconAgents />
              <span className={labelBase}>Agents</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/app/admin/billing"
              onClick={onClose}
              className={itemBase}
            >
              <IconBilling />
              <span className={labelBase}>Billing</span>
            </NavLink>
          )}
          <NavLink to="/app/help" onClick={onClose} className={itemBase}>
            <IconHelp />
            <span className={labelBase}>Help</span>
          </NavLink>
        </div>
        <div className="">
          <NavLink
            to="/app/account"
            onClick={onClose}
            className="group flex p-[12px] aria-[current=page]:bg-brand-150 rounded-xl"
          >
            <IconAccount />
            <span className="ml-2 group-aria-[current=page]:text-brand-500 font-sans ">
              Account
            </span>
          </NavLink>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
