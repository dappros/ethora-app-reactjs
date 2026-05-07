import { useUnread } from '@ethora/chat-component';

interface Props {
  className?: string;
}

export function UnreadBadge({ className = '' }: Props) {
  const { hasUnread } = useUnread();

  if (!hasUnread) return null;

  return (
    <span
      className={
        'min-w-[18px] h-[18px] px-[5px] rounded-full bg-red-500 text-white text-[11px] font-sans font-semibold flex items-center justify-center leading-none ' +
        className
      }
  />
  );
}
