import {
  Checkbox,
  Field,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import cn from 'classnames';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  actionDeleteManyUsers,
  actionGetUsers,
  actionResetPasswords,
} from '../actions';
import { IconAdd } from '../components/Icons/IconAdd';
import { IconCheckbox } from '../components/Icons/IconCheckbox';
import { IconDelete } from '../components/Icons/IconDelete';
import { IconSettings } from '../components/Icons/IconSettings';
import { httpCraeteUser, httpTagsSet, httpUpdateAcl } from '../http';
import { ModelAppUser, ModelUserACL } from '../models';

import { IconArrowDown } from '../components/Icons/IconArrowDown';
import { AclModal } from '../components/modal/AclModal';
import { NewUserModal } from '../components/modal/NewUserModal';
import { SubmitModal } from '../components/modal/SubmitModal';
import './AppUsers.scss';
import { Sorting } from '../components/Sorting';

export default function AppUsers() {
  let { appId } = useParams();
  const [allRowsSelected, setAllRowsSelected] = useState(false);
  const [items, setItems] = useState<Array<ModelAppUser>>([]);
  const [rowsSelected, setRowsSelected] = useState(items.map((_el) => false));
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [itemsPerTable, setItemsPerTable] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showManageTags, setShowManageTags] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const [order, setOrder] = useState<string>('asc');
  const [orderBy, setOrderBy] = useState<string>('createdAt');

  const [editAcl, setEditAcl] = useState<ModelUserACL | null>(null);

  const updateAcl = () => {
    if (editAcl && appId) {
      httpUpdateAcl(appId, editAcl?.userId, editAcl).then(() => {
        actionGetUsers(
          appId,
          itemsPerTable,
          currentPage * itemsPerTable,
          // @ts-ignore
          orderBy,
          order
        ).then((response) => {
          const { total, items } = response.data;
          setItems(items);
          setTotal(total);
          setPageCount(Math.ceil(total / itemsPerTable));
          setCurrentPage(currentPage);
          setEditAcl(null);
        });
      });
    }
  };

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

    setRowsSelected(items.map(() => selected));
  };

  if (!appId) {
    return;
  }

  useEffect(() => {
    setRowsSelected(() => items.map((_el) => false));
  }, [items]);

  useEffect(() => {
    // @ts-ignore
    actionGetUsers(appId, itemsPerTable, 0, orderBy, order).then((response) => {
      const { total, items } = response.data;
      setItems(items);
      setTotal(total);
      setPageCount(Math.ceil(total / itemsPerTable));
    });
  }, []);

  const onPageChange = (page: number) => {
    actionGetUsers(
      appId,
      itemsPerTable,
      page * itemsPerTable,
      // @ts-ignore
      orderBy,
      order
    ).then((response) => {
      const { total, items } = response.data;
      setItems(items);
      setTotal(total);
      setPageCount(Math.ceil(total / itemsPerTable));
      setCurrentPage(page);
      setRowsSelected((selected) => selected.map(() => false));
    });
  };

  useEffect(() => {
    actionGetUsers(
      appId,
      itemsPerTable,
      0 * itemsPerTable,
      // @ts-ignore
      orderBy,
      order
    ).then((response) => {
      const { total, items } = response.data;
      setItems(items);
      setTotal(total);
      setPageCount(Math.ceil(total / itemsPerTable));
      setCurrentPage(0);
      setRowsSelected((selected) => selected.map(() => false));
    });
    setCurrentPage(0);
  }, [itemsPerTable]);

  useEffect(() => {
    actionGetUsers(
      appId,
      itemsPerTable,
      currentPage * itemsPerTable,
      // @ts-ignore
      orderBy,
      order
    ).then((response) => {
      const { total, items } = response.data;
      setItems(items);
      setTotal(total);
      setPageCount(Math.ceil(total / itemsPerTable));
      setCurrentPage(currentPage);
      setRowsSelected((selected) => selected.map(() => false));
    });
  }, [orderBy, order]);

  const renderTo = () => {
    return itemsPerTable * (currentPage + 1);
  };

  const renderFrom = () => {
    if (currentPage === 0) {
      return <span>1</span>;
    } else {
      return 1;
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

  const getSelectedUserIds = () => {
    let indexes = getSelectedIndexes();
    return indexes.map((el) => items[el]._id);
  };

  const onTagsSumbmit = () => {
    let selectedUserIds = getSelectedUserIds();

    httpTagsSet(appId, {
      usersIdList: selectedUserIds,
      tagsList: tags.split(',').filter((el) => (el ? true : false)),
    }).then((_) => {
      actionGetUsers(
        appId,
        itemsPerTable,
        currentPage * itemsPerTable,
        // @ts-ignore
        orderBy,
        order
      ).then((response) => {
        const { total, items } = response.data;
        setItems(items);
        setTotal(total);
        setPageCount(Math.ceil(total / itemsPerTable));
        setCurrentPage(currentPage);
        setShowManageTags(false);
        setTags('');
        toast('Tags applied successfully!');
      });
    });
  };

  const onNewUser = ({
    firstName,
    lastName,
    email,
  }: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    setLoading(true);
    httpCraeteUser(appId, { firstName, lastName, email })
      .then((_) => {
        actionGetUsers(
          appId,
          itemsPerTable,
          currentPage * itemsPerTable,
          // @ts-ignore
          orderBy,
          order
        ).then((response) => {
          const { total, items } = response.data;
          setItems(items);
          setTotal(total);
          setPageCount(Math.ceil(total / itemsPerTable));
          setCurrentPage(currentPage);
          setShowNewUserModal(false);
          toast('User created successfully!');
        });
      })
      .finally(() => setLoading(false));
  };

  const onResetPassword = () => {
    let selectedUserIds = getSelectedUserIds();

    actionResetPasswords(appId, selectedUserIds).then(() => {
      setShowResetPassword(false);
      toast('Password reset successfully!');
    });
  };

  const onDelete = () => {
    let selectedUserIds: Array<string> = [];
    rowsSelected.forEach((el, index) => {
      if (el === true) {
        let item = items[index];
        selectedUserIds.push(item._id);
      }
    });

    actionDeleteManyUsers(appId, selectedUserIds).then(() => {
      actionGetUsers(
        appId,
        itemsPerTable,
        currentPage * itemsPerTable,
        // @ts-ignore
        orderBy,
        order
      ).then((response) => {
        const { total, items } = response.data;
        setItems(items);
        setTotal(total);
        setPageCount(Math.ceil(total / itemsPerTable));
        setCurrentPage(currentPage);
        setRowsSelected((selected) => selected.map(() => false));
        setShowDelete(false);
        toast(
          `${selectedUserIds.length > 1 ? 'Users' : 'User'} deleted successfully`
        );
      });
    });
  };

  // @ts-ignore
  const onOrderChange = (value: 'asc' | 'desc') => {
    setOrder(value);
  };

  // @ts-ignore
  const onSortByChange = (value: string) => {
    console.log('onSortByChange ', value);
    // @ts-ignore
    setOrderBy(value);
  };

  // @ts-ignore
  const renderOrder = (value: 'asc' | 'desc') => {
    if (value === 'asc') {
      return '(A-Z)';
    } else {
      return '(Z-A)';
    }
  };

  // @ts-ignore
  const renderOrderBy = (value: string) => {
    if (value === 'createdAt') {
      return 'Creation Date';
    }

    if (value === 'firstName') {
      return 'First Name';
    }

    if (value === 'lastName') {
      return 'Last Name';
    }

    if (value === 'email') {
      return 'Email';
    }

    return value;
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
      return (
        <div className="shadow px-[16px] py-[12px] grid grid-cols-4 gap-[16px] items-center z-50 translate-x-1/2 bg-white rounded-xl fixed bottom-[30px]">
          <div className="whitespace-nowrap text-sm">
            Selected {length} of {itemsPerTable} users
          </div>
          <button
            className="text-brand-500 font-varela text-base"
            onClick={() => setShowManageTags(true)}
          >
            Manage Tags
          </button>
          <button
            className="text-brand-500 font-varela text-base"
            onClick={() => setShowResetPassword(true)}
          >
            Reset Password
          </button>
          <button
            className="text-brand-500 flex font-varela text-base items-center justify-center"
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

  return (
    // overflow-hidden
    <div className="admin-app-users h-full w-full  grid grid-rows-[57px,_1fr] gap-y-[16px]">
      <div className="md:row-start-1 flex w-full md:justify-between items-center border-b border-b-gray-200">
        <div className="ml-4 hidden md:block font-varela text-[24px]">
          Users
        </div>
        <div className="flex w-full md:w-auto items-center justify-end">
          <Sorting
            className=""
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            orderByList={[
              { key: 'createdAt', title: 'Creation Date' },
              { key: 'firstName', title: 'First Name' },
              { key: 'lastName', title: 'Last Name' },
              { key: 'email', title: 'Email' }
            ]}

            setOrderBy={setOrderBy}
          />
          <button
            onClick={() => setShowNewUserModal(true)}
            className="flex ml-4 hover:bg-brand-darker items-center justify-center md:w-[184px] p-2 h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela"
          >
            <IconAdd color="white" className="md:mr-2" />
            <span className="hidden md:block">Add User</span>
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        {!items.length && (
          <div className="bg-[#F3F6FC] p-4 text-sm font-sans rounded-xl mb-4">
            There are no users yet, or you can add them by clicking the 'Add User'
            button
          </div>
        )}
        {!!items.length && (
          <>
            <div className="overflow-x-auto relative mb-4">
              {renderActionsForSelected()}
              <table className="border-collapse w-full min-w-[1200px] table-fixed">
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
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                      First Name
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                      Last Name
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                      Tags
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      Creation Date
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      Seen Date
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      Auth method
                    </th>
                    <th className="px-4 r-delimiter text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      Attribution
                    </th>
                    <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((el, index) => {
                    return (
                      <tr
                        key={el._id}
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
                        <td className="px-4 py-[20px] text-left font-sans font-normal text-sm whitespace-nowrap">
                          {el.firstName}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          {el.lastName}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          { }
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          {DateTime.fromISO(el.createdAt).toFormat('dd LLL yyyy t')}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          {el.lastSeen
                            ? DateTime.fromISO(el.lastSeen).toFormat(
                              'dd LLL yyyy t'
                            )
                            : '-'}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center whitespace-nowrap">
                          {el.authMethod}
                        </td>
                        <td className="px-4 font-sans font-normal text-sm text-center">
                          -
                        </td>
                        <td className="px-4 rounded-r-lg font-sans font-normal text-sm text-center whitespace-nowrap">
                          <button onClick={() => setEditAcl(el.acl)}>
                            <IconSettings width={16} height={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mx-8 my-[12px]">
              <div className="flex justify-between md:justify-start items-center">
                <div className="text-[#71717A] text-xs mr-8 whitespace-nowrap">
                  {renderFrom()} to {renderTo()} of {total}
                </div>
                <div className="flex">
                  <div className="text-[#71717A] mr-8">show</div>
                  <Menu>
                    <MenuButton className="flex mr-4">
                      <span className="text-brand-500 mr-4 font-semibold">
                        {itemsPerTable}
                      </span>
                      <IconArrowDown />
                    </MenuButton>
                    <MenuItems anchor="bottom" className="bg-white">
                      <div className="">
                        <MenuItem>
                          <div
                            onClick={() => setItemsPerTable(10)}
                            className="cursor-pointer px-2 text-brand-500 w-[60px] font-semibold"
                          >
                            {10}
                          </div>
                        </MenuItem>
                        <MenuItem>
                          <div
                            onClick={() => setItemsPerTable(15)}
                            className="cursor-pointer px-2 text-brand-500 w-[60px] font-semibold"
                          >
                            {15}
                          </div>
                        </MenuItem>
                        <MenuItem>
                          <div
                            onClick={() => setItemsPerTable(25)}
                            className="cursor-pointer px-2 text-brand-500 w-[60px] font-semibold"
                          >
                            {25}
                          </div>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                  <div className="text-[#71717A]">users</div>
                </div>
              </div>
              <div className="flex justify-center md:justify-end md:items-center">
                <ReactPaginate
                  className="paginate"
                  onPageActive={(...args) => {
                    console.log({ args });
                  }}
                  onPageChange={(selectedItem) =>
                    onPageChange(selectedItem.selected)
                  }
                  breakLabel="..."
                  nextLabel=""
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel=""
                  renderOnZeroPageCount={null}
                  forcePage={currentPage}
                />
              </div>
            </div>

          </>

        )}
      </div>
      {showManageTags && (
        <SubmitModal onClose={() => setShowManageTags(false)}>
          <div className="title">Tags</div>
          <div className="text-center mb-4 font-varela text-[18px]">
            Add Tags
          </div>
          <div>
            <input
              type="text"
              placeholder="Tags"
              className="w-full rounded-xl bg-[#F5F7F9] outline-none mb-8 py-[12px] px-[16px]"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="buttons">
            <button
              onClick={() => setShowManageTags(false)}
              className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
            >
              Cancel
            </button>
            <button
              onClick={onTagsSumbmit}
              className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
            >
              Submit
            </button>
          </div>
        </SubmitModal>
      )}
      {showResetPassword && (
        <SubmitModal onClose={() => setShowResetPassword(false)}>
          <div className="title">Password Reset</div>
          <p className="text-center mb-8">
            {`Are you sure you want to force a password reset for ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? 'users' : 'user'}?`}
          </p>
          <div className="buttons">
            <button
              onClick={() => setShowResetPassword(false)}
              className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
            >
              Cancel
            </button>
            <button
              onClick={onResetPassword}
              className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
            >
              Submit
            </button>
          </div>
        </SubmitModal>
      )}
      {showDelete && (
        <SubmitModal onClose={() => setShowDelete(false)}>
          <div className="title">Delete user</div>
          <p className="text-center mb-8">
            {`Are you sure you want to delete ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? 'users' : 'user'}?`}
          </p>
          <div className="buttons">
            <button
              onClick={() => setShowDelete(false)}
              className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="w-full py-[12px] rounded-xl bg-red-600 text-white"
            >
              Submit
            </button>
          </div>
        </SubmitModal>
      )}
      {editAcl && (
        <AclModal
          updateAcl={updateAcl}
          acl={editAcl}
          setEditAcl={setEditAcl}
          onClose={() => setEditAcl(null)}
        />
      )}
      {showNewUserModal && (
        <NewUserModal
          loading={loading}
          onSubmit={onNewUser}
          onClose={() => setShowNewUserModal(false)}
        />
      )}
    </div>
  );
}
