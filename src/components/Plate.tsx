interface Props {
  children: React.ReactNode;
  className?: string;
}

export function Plate({ children, className }: Props) {
  return (
    <div className={`rounded-2xl w-full border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
