import {FC} from "react";
import {IconDownload} from "../../Icons/IconDownload.tsx";
import {useAppStore} from "../../../store/useAppStore.ts";

interface CsvButtonProps {
  onClick: () => void;
}

const CsvButton: FC<CsvButtonProps> = ({onClick}) => {
  const currentApp = useAppStore((s) => s.currentApp);

  return (
      <button
        onClick={onClick}
        className="flex items-center px-2 sm:px-7 py-2 bg-white text-brand-500 border border-brand-500 rounded-xl"
      >
        <IconDownload stroke={(currentApp && currentApp.primaryColor) || "#0052CD"}/>
        <span className="pl-3">
          Export CSV
        </span>
      </button>
  );
};

export default CsvButton;