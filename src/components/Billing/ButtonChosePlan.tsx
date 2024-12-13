import classNames from 'classnames';
import { FC } from 'react';

interface ButtonChosePlanType {
  handleChoosePlan: () => void;
  className: string;
}

export const ButtonChosePlan: FC<ButtonChosePlanType> = ({
  handleChoosePlan,
  className,
}) => {
  return (
    <button
      onClick={() => handleChoosePlan()}
      className={classNames(
        'my-2 md:mt-8 px-4 py-2 shadow-2xl rounded-full font-semibold transition',
        'text-xs md:text-base text-center',
        className
      )}
    >
      Choose plan
    </button>
  );
};
