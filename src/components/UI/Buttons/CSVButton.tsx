import {FC} from "react";
import {IconDownload} from "../../Icons/IconDownload.tsx";
import {useAppStore} from "../../../store/useAppStore.ts";
import {useTranslation} from "../../../i18n/useTranslation";

interface CsvButtonProps {
  onClick: () => void;
}

const CsvButton: FC<CsvButtonProps> = ({onClick}) => {
  const currentApp = useAppStore((s) => s.currentApp);
  const { t } = useTranslation();

  return (
      <button
        onClick={onClick}
        className="flex items-center h-[40px] text-sm sm:text-base px-2 sm:px-7 sm:py-2 bg-white text-brand-500 border border-brand-500 rounded-xl"
      >
        <IconDownload stroke={(currentApp && currentApp.primaryColor) || "#0052CD"}/>
        <span className="pl-3">
          {t('csvButton.exportCsv')}
        </span>
      </button>
  );
};

export default CsvButton;