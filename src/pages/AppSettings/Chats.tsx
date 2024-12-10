import { Checkbox, Dialog, DialogPanel, Field, Label } from '@headlessui/react';
import { useState } from 'react';
import { IconAdd } from '../../components/Icons/IconAdd';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import { ModelAppDefaulRooom } from '../../models';
import { IconClose } from '../../components/Icons/IconClose';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createAppChat, deleteDefaultRooms, getDefaultRooms, httpGetConfig } from '../../http';
import { Loading } from '../../components/Loading';
import { IconDelete } from '../../components/Icons/IconDelete';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { de } from 'date-fns/locale';
import { se } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { IconMinus } from '../../components/Icons/IconMinus';
import { set } from 'date-fns';

interface Props {
  allowUsersToCreateRooms: boolean
  setAllowUsersToCreateRooms: (value: boolean) => void
  defaultChatRooms: Array<ModelAppDefaulRooom>,
  setDefaultChatRooms: (value: Array<ModelAppDefaulRooom>) => void,
  appId: string,
}

interface Inputs {
  chatTitle: string;
  pinned: false;
}

export function Chats({ allowUsersToCreateRooms, setAllowUsersToCreateRooms, defaultChatRooms, setDefaultChatRooms, appId }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [allRowsSelected, setAllRowsSelected] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [rowsSelected, setRowsSelected] = useState(
    defaultChatRooms.map((_) => false)
  );

  const [someSelected, setSomeSelected] = useState(false);

  const {
    register,
    handleSubmit,
    reset
  } = useForm<Inputs>();

  const setSelect = (select: boolean, index: number) => {
    const newRowsSelected = rowsSelected.concat([]);
    newRowsSelected[index] = select;

    if (newRowsSelected.every((el) => el === true)) {
      setAllRowsSelected(true);
    } else {
      setAllRowsSelected(false);
    }

    if (newRowsSelected.some((el) => el === true)) {
      setSomeSelected(true);
    } else {
      setSomeSelected(false);
    }

    setRowsSelected(newRowsSelected);
  };

  const renderActionsForSelected = () => {
    let selectedIndexes = [];

    rowsSelected.forEach((el, index) => {
      if (el === true) {
        selectedIndexes.push(index);
      }
    });

    let length = selectedIndexes.length;

    if (length > 0) {
      // 
      return (
        <div className="shadow px-[16px] py-[12px] flex gap-[16px] items-center justify-center z-50 transform -translate-x-1/2 bg-white rounded-xl fixed left-[50%] bottom-[30px]">
          <button
            className="text-brand-500 inline-flex font-varela text-base items-center justify-center"
            onClick={() => setShowDelete(true)}
          >
            <div className="mr-2">
              <IconDelete />
            </div>
            Delete
          </button>
        </div>
      );
    } else {
      return null;
    }
  };

  const onSelectAllRows = (selected: boolean) => {
    if (someSelected) {
      setAllRowsSelected(false);
      setRowsSelected(rowsSelected.map((_el) => false));
      setSomeSelected(false);
    } else {
      setAllRowsSelected(selected);
      setRowsSelected(rowsSelected.map((_el) => selected));
    }
  };

  const getSelectedIndexes = () => {
    let indexes: Array<number> = [];

    rowsSelected.forEach((el, index) => {
      if (el === true) {
        indexes.push(index);
      }
    });

    return indexes;
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ chatTitle }) => {
    setShowLoading(true)
    try {
      await createAppChat(appId, chatTitle, true)
      const { data } = await getDefaultRooms(appId)
      setDefaultChatRooms(data)
      setShowLoading(false)
      reset()
      setShowCreate(false)
      toast.success('Chat created successfully')
    } catch (error) {
      setShowLoading(false)
      toast.error('Failed to create chat')
    }
  }

  const onDelete = async () => {
    let selectedRooms: Array<ModelAppDefaulRooom> = [];
    rowsSelected.forEach((el, index) => {
      if (el === true) {
        let item = defaultChatRooms[index];
        selectedRooms.push(item);
      }
    });
    setShowLoading(true)
    for (const room of selectedRooms) {
      await deleteDefaultRooms(appId, room.jid)
    }
    setShowLoading(false)
    setShowDelete(false)
    const { data } = await getDefaultRooms(appId)
    setDefaultChatRooms(data)
  }

  return (
    <div className="overflow-hidden">
      <p className="font-semibold font-sans text-[16px] mb-2">New Chats</p>

      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={allowUsersToCreateRooms}
          onChange={setAllowUsersToCreateRooms}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          Allow Users to create new Chats
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        When enabled, your Users can create new Chats and invite other Users
        there. When disabled, only pre-existing Chats or Chats created by your
        business can be used.
      </p>
      <p className="font-semibold font-sans text-[16px] mb-2">Pinned Chats</p>
      <p className="font-sans text-xs text-gray-500 mb-4">
        Pinned or “starred” Chats are permanent chat rooms that your Users will
        automatically see and join.
      </p>
      <div className="p-4 border border-gray-200 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="font-sans font-semibold text-base">List of chats</div>
          <div>
            <button onClick={() => setShowCreate(true)} className="flex items-center justify-center md:w-[184px] h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela">
              <IconAdd color="white" className="md:mr-2" />
              <span className="hidden md:block">Add New Chat</span>
            </button>
          </div>
        </div>
        <div className="mx-2 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="pl-4 py-2 w-[32px] rounded-l-lg">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={(someSelected || allRowsSelected)}
                        onChange={onSelectAllRows}
                      >
                        {allRowsSelected && (
                          <IconCheckbox className="hidden group-data-[checked]:block" />
                        )}
                        {(someSelected && !allRowsSelected) && (
                          <IconMinus className="hidden group-data-[checked]:block" />
                        )}
                      </Checkbox>
                    </Field>
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  Chat Name
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody>
              {defaultChatRooms.map((el, index) => {
                return (
                  <tr key={el.jid} className="hover:!bg-[#F5F7F9]">
                    <td className="pl-4 py-2 w-[32px] rounded-l-lg">
                      <Field className="flex items-center cursor-pointer">
                        <Checkbox
                          className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                          checked={rowsSelected[index]}
                          onChange={(isSet) => setSelect(isSet, index)}
                        >
                          <IconCheckbox className="hidden group-data-[checked]:block" />
                        </Checkbox>
                      </Field>
                    </td>
                    <td className="px-4 py-[20px] font-sans font-normal text-sm  whitespace-nowrap">
                      {el.title}
                    </td>
                    <td className="px-4 font-sans font-normal text-sm text-center  whitespace-nowrap">
                      {el.creator}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot></tfoot>
          </table>
        </div>
      </div>
      {renderActionsForSelected()}
      {showLoading && (<Loading />)}
      {showCreate && (
        <Dialog
          className="fixed inset-x-0 inset-y-0 z-50 flex justify-center items-center bg-black/50 transition duration-300 ease-out data-[closed]:opacity-0"
          open={showCreate}
          transition
          onClose={() => { }}
        >
          <DialogPanel className="p-4 sm:p-8 bg-white rounded-3xl w-full max-w-[640px] m-8 relative">
            <button
              className="absolute top-[15px] right-[15px] "
              onClick={() => setShowCreate(false)}
            >
              <IconClose />
            </button>
            <div className="font-varela text-[18px] md:text-[24px] text-center md:mb-8 mb-[24px]">
              Create New Chat for your App Users
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                placeholder="Chat Title"
                {...register('chatTitle', { required: true })}
                className="rounded-2xl bg-gray-100 py-3 px-6 w-full mb-[24px] md:mb-8 outline-none"
              />
              <div className="flex flex-col md:flex-row gap-[16px] md:gap-8 items-start">
                <button
                  className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500 hover:bg-brand-hover"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button className="w-full py-[12px] rounded-xl bg-brand-500 text-white hover:bg-brand-darker">
                  Continue
                </button>
              </div>
            </form>
          </DialogPanel>
        </Dialog>
      )}
      {showDelete && (
        <SubmitModal onClose={() => setShowDelete(false)}>
          <div className="font-varela text-[24px] text-center mb-8">Delete App Room</div>
          <p className="font-sans text-[14px] mb-8 text-center">
            {`Are you sure you want to delete ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? 'rooms' : 'room'}?`}
          </p>
          <div className="flex gap-8">
            <button
              onClick={() => setShowDelete(false)}
              className="w-full hover:bg-brand-hover rounded-xl border py-[12px] border-brand-500 text-brand-500"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete()}
              className="w-full py-[12px] rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Submit
            </button>
          </div>
        </SubmitModal>
      )}
    </div>
  );
}
