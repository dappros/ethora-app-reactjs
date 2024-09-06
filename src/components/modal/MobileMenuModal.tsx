import {
  Dialog,
  DialogPanel,
} from '@headlessui/react'

import "./MobileMenuModal.scss"
import { IconClose } from '../Icons/IconClose'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { IconSettings } from '../Icons/IconSettings'
import { IconChat } from '../Icons/IconChat'
import { IconAdmin } from '../Icons/IconAdmin'

interface Props {
  onClose: () => void
}

export function MobileMenuModal({ onClose }: Props) {
  useEffect(() => {
    function onResize() {
      onClose()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return (
    <Dialog className="mobile-menu-modal" open={true} onClose={() => onClose()}>
      <DialogPanel className="inner">
        <div className="mobile-menu-modal-top">
          <button onClick={onClose}>
            <IconClose />
          </button>
          <NavLink to="/app/chat" onClick={onClose} className="app-menu-mobile-btn">
            <IconChat />
            <span>Chats</span>
          </NavLink >
          <NavLink to="/app/admin/apps" onClick={onClose} className="app-menu-mobile-btn">
            <IconAdmin />
            <span>Admin</span>
          </NavLink >
        </div>
        <div className="mobile-menu-modal-bottom">
          <NavLink to="/app/settings" onClick={onClose} className="app-menu-mobile-btn">
            <IconSettings />
            <span>Settings</span>
          </NavLink >
        </div>
      </DialogPanel>
    </Dialog>
  )
}
