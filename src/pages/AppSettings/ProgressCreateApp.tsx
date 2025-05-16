import { useNavigate, useSearchParams } from 'react-router-dom';

interface Props {
  isAppearanceAdjusted: boolean;
  isEndUserCreated: boolean;
  onClose: () => void;
}

const ProgressCreateApp = ({
  isAppearanceAdjusted,
  isEndUserCreated,
  onClose,
}: Props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const renderHint = () => {
    if (!isAppearanceAdjusted) {
      return (
        <span className="text-xs text-gray-500">
          Hint: open{' '}
          <button
            className="text-brand-500 underline"
            onClick={() => {
              searchParams.set('tab', 'Appearance');
              navigate({ search: searchParams.toString() });
            }}
          >
            Appearance tab
          </button>{' '}
          to adjust your branding.
        </span>
      );
    }

    if (!isEndUserCreated) {
      return (
        <span className="text-xs text-gray-500">
          Hint: go to{' '}
          <button
            className="text-brand-500 underline"
            onClick={() => {
              searchParams.set('tab', 'Web app');
              navigate({ search: searchParams.toString() });
            }}
          >
            Web app tab
          </button>{' '}
          and copy your app link to test as end-user.
        </span>
      );
    }

    return (
      <p className="text-xs text-gray-500">
        Well done! You have successfully completed the Initial Setup!
      </p>
    );
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl flex flex-col gap-1 relative">
      <button
        onClick={onClose}
        className="absolute right-4 top-2 text-gray-400 hover:text-gray-600"
      >
        ✖
      </button>

      <div className="text-sm font-medium pb-1">
        [ App created ✅ ] → [ Appearance adjusted{' '}
        {isAppearanceAdjusted ? '✅' : '❌'} ] → [ End User created{' '}
        {isEndUserCreated ? '✅' : '❌'} ]
      </div>

      {renderHint()}
    </div>
  );
};

export default ProgressCreateApp;
