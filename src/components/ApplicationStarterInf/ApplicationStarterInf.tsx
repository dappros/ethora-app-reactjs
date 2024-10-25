import { IconClose } from '../Icons/IconClose';
import './ApplicationStarterInf.scss';

interface Props {
  onClose: () => void;
}

export function ApplicationStarterInf({ onClose }: Props) {
  return (
    <div className="application-starter-inf">
      <div className="text">
        <p>
          Here you can Create, Manage and View applications depending on your
          permissions.
        </p>
        <ul>
          <li>Create: use the “Add New App” button.</li>
          <li>Manage / View: click one of the available apps in the list.</li>
        </ul>
      </div>
      <div className="app-craete-image"></div>
      <button className="close" onClick={() => onClose()}>
        <IconClose />
      </button>
    </div>
  );
}
