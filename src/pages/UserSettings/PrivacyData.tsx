import { ManageData } from './ManageData';
import { ProfileShares } from './ProfileShares';
import { useVisibilitySetting } from './useVisibilitySetting';
import { ProfileVisibility } from './Visibility';

// Who can see the profile, the share links that matter only while it is
// restricted, then the account-level data actions (export / delete).
export function PrivacyData() {
  const [isProfileOpen, setIsProfileOpen] =
    useVisibilitySetting('isProfileOpen');

  return (
    <div className="md:ml-4 flex flex-col gap-8">
      <section>
        <ProfileVisibility value={isProfileOpen} onChange={setIsProfileOpen} />
      </section>
      {/* Share links only do anything while the profile is restricted.
          Switching back to Open hides them but does not delete them, so
          restricting again brings the same links back. */}
      {!isProfileOpen && (
        <section>
          <ProfileShares />
        </section>
      )}
      <section className="border-t border-gray-200 pt-8">
        <ManageData />
      </section>
    </div>
  );
}
