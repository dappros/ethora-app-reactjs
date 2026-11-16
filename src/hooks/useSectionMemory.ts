import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { RESTORE_STATE, SECTION_ROOTS, SectionId, readSectionMemory, rememberLocation, sectionLink } from '../utils/sectionMemory';

// Records the current location for its sidebar section (utils/sectionMemory).
// Mounted once, in the layout.
export function useRememberSection() {
  const { pathname, search } = useLocation();
  const userId = useAppStore((s) => s.currentUser?._id);
  useEffect(() => {
    rememberLocation(userId, pathname, search);
  }, [userId, pathname, search]);
}

// The sidebar target for a section and the router state to pass with it.
export function useSectionLink(section: SectionId): { to: string; state?: typeof RESTORE_STATE } {
  const { pathname } = useLocation();
  const userId = useAppStore((s) => s.currentUser?._id);
  const chatAppId = useAppStore((s) => s.chatAppId);
  const to = sectionLink(section, { pathname, memory: readSectionMemory(userId), chatAppId });
  return to === SECTION_ROOTS[section] ? { to } : { to, state: RESTORE_STATE };
}
