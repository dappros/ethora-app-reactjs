import appCreateImage from '../assets/app-craete-image.png';
import { IconClose } from './Icons/IconClose';

interface Props {
  onClose: () => void;
}

export function ApplicationStarterInf({ onClose }: Props) {
  return (
    <div className="p-4 bg-[#F3F6FC] relative grid grid-rows-[3fr,_2fr] lg:grid-rows-1 lg:grid-cols-[minmax(600px,_3fr),_2fr] mb-4 rounded-xl">
      <div className="text-regular flex items-end lg:items-start font-varela">
        <div>
          <p>
            Here you can Create, Manage and View applications depending on your
            permissions.
          </p>
          <ul className="list-disc pl-6">
            <li>Create: use the “Add New App” button.</li>
            <li>Manage / View: click one of the available apps in the list.</li>
          </ul>
        </div>
      </div>
      <div className="flex row-start-1 lg:row-start-auto justify-center">
        <div
          className="w-[247px] h-[152px] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${appCreateImage})` }}
        ></div>
      </div>
      <button
        className="absolute right-[10px] top-[10px]"
        onClick={() => onClose()}
      >
        <IconClose />
      </button>
    </div>
  );
}
