import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';

interface StepQuestionLayoutProps {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  goBack?: () => void;
  children: React.ReactNode;
}

export const StepLayout = ({
  title,
  description,
  goBack,
  children,
}: StepQuestionLayoutProps) => {
  return (
    <>
      {goBack && (
        <button className="absolute sm:top-[-10px] top-2" onClick={goBack}>
          <KeyboardBackspaceOutlinedIcon />
        </button>
      )}
      <div className="text-center font-varela text-[18px] md:text-[20px] md:pt-4 pt-7 pb-2">
        {title}
      </div>
      <p className="text-left pl-2 pb-4">{description}</p>
      <div className="flex flex-col items-start gap-2">{children}</div>
    </>
  );
};
