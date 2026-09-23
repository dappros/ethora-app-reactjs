import { DocumentShares } from './DocumentShares';
import { useVisibilitySetting } from './useVisibilitySetting';
import { DocumentsVisibility } from './Visibility';

export function Documents() {
  const [isAssetsOpen, setIsAssetsOpen] = useVisibilitySetting('isAssetsOpen');

  return (
    <div className="md:ml-4 flex flex-col gap-8">
      <section>
        <DocumentsVisibility value={isAssetsOpen} onChange={setIsAssetsOpen} />
      </section>
      {/* Per-document share links only apply in "Individual" mode. Kept (not
          deleted) when switching to Full, same as profile shares. */}
      {!isAssetsOpen && (
        <section>
          <DocumentShares />
        </section>
      )}
    </div>
  );
}
