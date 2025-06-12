interface Props {
  displayName: string;
  onDelete: () => void;
}

export const DeleteSetting = ({ displayName, onDelete }: Props) => {
  return (
    <div className="overflow-hidden">
      <div className="font-semibold font-sans text-[16px] mb-4">Delete</div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        By pressing the button below you confirm you wish to completely delete
        this App including Users, Chats, Files and other contents. This action
        is irreversible.
      </p>
      <button
        onClick={onDelete}
        className="w-full hover:bg-red-300 p-2 border bg-red-400 border-red-800 rounded-xl text-white text-[16px] font-varela"
      >
        Delete {displayName}
      </button>
    </div>
  );
};
