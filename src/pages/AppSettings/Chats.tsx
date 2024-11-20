import { Checkbox, Field, Label } from '@headlessui/react';
import cn from 'classnames';
import { useState } from 'react';
import { IconAdd } from '../../components/Icons/IconAdd';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';

const chatsData = [
  {
    title: 'chat1',
    pinned: true,
    jid: '123',
  },
  {
    title: 'chat2',
    pinned: false,
    jid: '345',
  },
];

export function Chats() {
  const [enableCreateChats, setEnableCreateChats] = useState(false);

  const [allRowsSelected, setAllRowsSelected] = useState(false);
  const [rowsSelected, setRowsSelected] = useState(
    chatsData.map((el) => el.pinned)
  );

  const setSelect = (select: boolean, index: number) => {
    const newRowsSelected = rowsSelected.concat([]);
    newRowsSelected[index] = select;

    if (newRowsSelected.every((el) => el === true)) {
      setAllRowsSelected(true);
    } else {
      setAllRowsSelected(false);
    }

    setRowsSelected(newRowsSelected);
  };

  const onSelectAllRows = (selected: boolean) => {
    setAllRowsSelected(selected);

    setRowsSelected(rowsSelected.map((_el) => selected));
  };

  return (
    <div>
      <p className="font-semibold font-sans text-[16px] mb-2">New Chats</p>

      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableCreateChats}
          onChange={setEnableCreateChats}
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
            <button className="flex items-center justify-center md:w-[184px] h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela">
              <IconAdd color="white" className="md:mr-2" />
              <span className="hidden md:block">Add New Chat</span>
            </button>
          </div>
        </div>
        <div className="mx-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="pl-4 py-2 w-[32px] rounded-l-lg">
                  <Field className="flex items-center cursor-pointer">
                    <Checkbox
                      className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                      checked={allRowsSelected}
                      onChange={onSelectAllRows}
                    >
                      <IconCheckbox className="hidden group-data-[checked]:block" />
                    </Checkbox>
                  </Field>
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  Chat Name
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  Type
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  Visibility
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-left whitespace-nowrap">
                  Comment
                </th>
              </tr>
            </thead>
            <tbody>
              {chatsData.map((el, index) => {
                return (
                  <tr
                    key={el.jid}
                    className={cn('', {
                      '!bg-[#E7EDF9]': rowsSelected[index],
                      'hover:!bg-[#F5F7F9]': !rowsSelected[index],
                    })}
                  >
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
                    <td className="px-4 py-[20px] font-sans font-normal text-sm">
                      {el.title}
                    </td>
                    <td className="px-4 font-sans font-normal text-sm text-center">
                      Public
                    </td>
                    <td className="px-4 font-sans font-normal text-sm text-center">
                      Visible
                    </td>
                    <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                      You may replace this with your own hidden Chat.
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot></tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
