interface Props {
  children: React.ReactNode;
}

export function Plate({ children }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 px-2 py-4 ">
      {children}
    </div>
  );
}
