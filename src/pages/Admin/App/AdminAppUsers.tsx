import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { actionDeleteManyUsers, actionGetUsers, actionResetPasswords } from "../../../actions"
import { ModelAppUser, ModelUserACL } from "../../../models"
import { Checkbox, CloseButton, Field, Label, Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel, Radio, RadioGroup } from "@headlessui/react"
import { IconSettings } from "../../../components/Icons/IconSettings"
import { AclModal } from "../../../components/modal/AclModal"
import { DateTime } from "luxon"
import { NewUserModal } from "../../../components/modal/NewUserModal"
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';

import "./AdminAppUsers.scss"
import { IconArrowDown } from "../../../components/Icons/IconArrowDown"
import { IconMarked } from "../../../components/Icons/IconMarked"
import { IconAdd } from "../../../components/Icons/IconAdd"
import { IconDelete } from "../../../components/Icons/IconDelete"
import { SubmitModal } from "../../../components/modal/SubmitModal"
import { httpCraeteUser, httpTagsSet, httpUpdateAcl } from "../../../http"
import { TextInput } from "../../../components/ui/TextInput"

export function AdminAppUsers() {
    let { appId } = useParams()
    const [allRowsSelected, setAllRowsSelected] = useState(false)
    const [items, setItems] = useState<Array<ModelAppUser>>([])
    const [rowsSelected, setRowsSelected] = useState(items.map(_el => false))
    const [showNewUserModal, setShowNewUserModal] = useState(false)
    const [itemsPerTable, setItemsPerTable] = useState(10)
    const [pageCount, setPageCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [showManageTags, setShowManageTags] = useState(false)
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [tags, setTags] = useState('')

    const [order, setOrder] = useState<'asc' | 'desc'>('asc')
    const [orderBy, setOrderBy] = useState<'createdAt' | 'firstName' | 'lastName' | 'email'>('createdAt')

    const [editAcl, setEditAcl] = useState<ModelUserACL | null>(null)

    const updateAcl = () => {
        if (editAcl && appId) {
            httpUpdateAcl(appId, editAcl?.userId, editAcl)
                .then(() => {
                    actionGetUsers(appId, itemsPerTable, currentPage * itemsPerTable, orderBy, order)
                        .then((response) => {
                            const { total, items } = response.data
                            setItems(items)
                            setTotal(total)
                            setPageCount(Math.ceil(total / itemsPerTable))
                            setCurrentPage(currentPage)
                            setEditAcl(null)
                        })
                })
        }
    }

    const setSelect = (select: boolean, index: number) => {
        const newRowsSelected = rowsSelected.concat([])
        newRowsSelected[index] = select

        if (newRowsSelected.every((el) => el === true)) {
            setAllRowsSelected(true)
        } else {
            setAllRowsSelected(false)
        }

        setRowsSelected(newRowsSelected)
    }

    const onSelectAllRows = (selected: boolean) => {
        setAllRowsSelected(selected)

        setRowsSelected(items.map(() => selected))
    }


    if (!appId) {
        return
    }

    useEffect(() => {
        setRowsSelected(() => items.map((_el) => false))
    }, [items])

    useEffect(() => {
        actionGetUsers(appId, itemsPerTable, 0, orderBy, order)
            .then((response) => {
                const { total, items } = response.data
                setItems(items)
                setTotal(total)
                setPageCount(Math.ceil(total / itemsPerTable))
            })
    }, [])

    const onPageChange = (page: number) => {
        actionGetUsers(appId, itemsPerTable, page * itemsPerTable, orderBy, order)
            .then((response) => {
                const { total, items } = response.data
                setItems(items)
                setTotal(total)
                setPageCount(Math.ceil(total / itemsPerTable))
                setCurrentPage(page)
                setRowsSelected(selected => selected.map(() => false))
            })
    }

    useEffect(() => {
        actionGetUsers(appId, itemsPerTable, 0 * itemsPerTable, orderBy, order)
            .then((response) => {
                const { total, items } = response.data
                setItems(items)
                setTotal(total)
                setPageCount(Math.ceil(total / itemsPerTable))
                setCurrentPage(0)
                setRowsSelected(selected => selected.map(() => false))
            })
        setCurrentPage(0)
    }, [itemsPerTable])

    useEffect(() => {
        actionGetUsers(appId, itemsPerTable, currentPage * itemsPerTable, orderBy, order)
            .then((response) => {
                const { total, items } = response.data
                setItems(items)
                setTotal(total)
                setPageCount(Math.ceil(total / itemsPerTable))
                setCurrentPage(currentPage)
                setRowsSelected(selected => selected.map(() => false))
            })
    }, [orderBy, order])

    const renderTo = () => {
        return (itemsPerTable * (currentPage + 1))
    }

    const renderFrom = () => {
        if (currentPage === 0) {
            return (
                <span>1</span>
            )
        } else {
            return (
                1
            )
        }
    }

    const getSelectedIndexes = () => {
        let indexes: Array<number> = []

        rowsSelected.forEach((el, index) => {
            if (el === true) {
                indexes.push(index)
            }
        })

        return indexes
    }

    const getSelectedUserIds = () => {
        let indexes = getSelectedIndexes()
        return indexes.map(el => items[el]._id)
    }

    const onTagsSumbmit = () => {
        let selectedUserIds = getSelectedUserIds()

        httpTagsSet(appId, {usersIdList: selectedUserIds, tagsList: tags.split(',').filter(el => el ? true : false)})
            .then((_) => {
                actionGetUsers(appId, itemsPerTable, currentPage * itemsPerTable, orderBy, order)
                .then((response) => {
                    const { total, items } = response.data
                    setItems(items)
                    setTotal(total)
                    setPageCount(Math.ceil(total / itemsPerTable))
                    setCurrentPage(currentPage)
                    setShowManageTags(false)
                    setTags('')
                    toast("Tags applied successfully!")
                })
            })
    }

    const onNewUser = ({ firstName, lastName, email }: { firstName: string, lastName: string, email: string }) => {
        httpCraeteUser(appId, { firstName, lastName, email })
            .then((_) => {
                actionGetUsers(appId, itemsPerTable, currentPage * itemsPerTable, orderBy, order)
                    .then((response) => {
                        const { total, items } = response.data
                        setItems(items)
                        setTotal(total)
                        setPageCount(Math.ceil(total / itemsPerTable))
                        setCurrentPage(currentPage)
                        setShowNewUserModal(false)
                        toast("User created successfully!")
                    })
                
            })
    }

    const onResetPassword = () => {
        let selectedUserIds = getSelectedUserIds()

        actionResetPasswords(appId, selectedUserIds)
            .then(() => {
                setShowResetPassword(false)
                toast("Password reset successfully!")
            })
    }

    const onDelete = () => {
        let selectedUserIds: Array<string> = []
        rowsSelected.forEach((el, index) => {
            if (el === true) {
                let item = items[index]
                selectedUserIds.push(item._id)
            }
        })

        actionDeleteManyUsers(appId, selectedUserIds)
            .then(() => {
                actionGetUsers(appId, itemsPerTable, currentPage * itemsPerTable, orderBy, order)
                    .then((response) => {
                        const { total, items } = response.data
                        setItems(items)
                        setTotal(total)
                        setPageCount(Math.ceil(total / itemsPerTable))
                        setCurrentPage(currentPage)
                        setRowsSelected(selected => selected.map(() => false))
                        setShowDelete(false)
                        toast(`${selectedUserIds.length > 1 ? 'Users' : 'User'} deleted successfully`)
                    })
            })
    }

    const onOrderChange = (value: 'asc' | 'desc') => {
        setOrder(value)
    }

    const onSortByChange = (value: string) => {
        console.log('onSortByChange ', value)
        // @ts-ignore
        setOrderBy(value)
    }

    const renderOrder = (value: 'asc' | 'desc') => {
        if (value === 'asc') {
            return '(A-Z)'
        } else {
            return '(Z-A)'
        }
    }

    const renderOrderBy = (value: string) => {
        if (value === 'createdAt') {
            return 'Creation Date'
        }

        if (value === 'firstName') {
            return 'First Name'
        }

        if (value === 'lastName') {
            return 'Last Name'
        }

        if (value === 'email') {
            return 'Email'
        }

        return value
    }

    const renderActionsForSelected = () => {
        let selectedIndexes = []

        rowsSelected.forEach((el, index) => {
            if (el === true) {
                selectedIndexes.push(index)
            }
        })

        let length = selectedIndexes.length

        if (length > 0) {
            return (
                <div className="selected-actions">
                    <div className="selected-actions-title mr-16">Selected {length} of {itemsPerTable} users</div>
                    <button className="gen-tertiary-btn middle mr-16" onClick={() => setShowManageTags(true)}>Manage Tags</button>
                    <button className="gen-tertiary-btn middle mr-16" onClick={() => setShowResetPassword(true)}>Reset Password</button>
                    <button className="gen-tertiary-btn middle danger mr-16" onClick={() => setShowDelete(true)}>
                        <IconDelete />
                        Delete
                    </button>
                </div>
            )
        } else {
            return null
        }
    }

    return (
        <div className="app-content-body-page admin-app-users">
            <div className="app-content-body-header">
                <div className="left">
                    Users
                </div>
                <div className="right">
                    <div className="app-sorting-outer">
                        <div className="app-sorting">
                            <span className="label">Sort by</span>
                            <Popover className="relative">
                                <PopoverButton className="app-sorting-button">
                                    {renderOrderBy(orderBy)} - {renderOrder(order)}
                                    <IconArrowDown width={16} height={16} />
                                </PopoverButton>
                                <PopoverPanel anchor="bottom" className="app-sorting-panel">
                                    <div className="app-sorting-panel-inner">
                                        <Field className="app-sorting-group-title mb-8">
                                            Order
                                        </Field>
                                        <RadioGroup
                                            className="app-sorting-radiogroup"
                                            value={order}
                                            onChange={(value) => { onOrderChange(value) }}
                                            aria-label="Server size"
                                        >
                                            <CloseButton className="app-sorting-radio-outer">
                                                <Field className="app-sorting-radio">
                                                    <Radio
                                                        value={'asc'}
                                                        className="app-sorting-radio-input"
                                                    >
                                                        {(props) => {
                                                            return (
                                                                <div className="app-sorting-radio-content">
                                                                    {props.checked && <IconMarked />}
                                                                </div>
                                                            )
                                                        }}
                                                    </Radio>
                                                    <Label>{'A-Z'}</Label>
                                                </ Field>
                                                <IconAdd />
                                            </CloseButton>
                                            <CloseButton className="app-sorting-radio-outer">
                                                <Field className="app-sorting-radio">
                                                    <Radio
                                                        value={'desc'}
                                                        className="app-sorting-radio-input"
                                                    >
                                                        {(props) => {
                                                            return (
                                                                <div className="app-sorting-radio-content">
                                                                    {props.checked && <IconMarked />}
                                                                </div>
                                                            )
                                                        }}
                                                    </Radio>
                                                    <Label>{'Z-A'}</Label>
                                                </ Field>
                                                <IconAdd />
                                            </CloseButton>
                                        </RadioGroup>
                                        <Field className="app-sorting-group-title mb-8">Sort</Field>
                                        <RadioGroup
                                            className="app-sorting-radiogroup"
                                            value={orderBy}
                                            onChange={(value) => onSortByChange(value)}
                                            aria-label="Server size"
                                        >
                                            <CloseButton className="app-sorting-radio-outer">
                                                <Field className="app-sorting-radio">

                                                    <Radio
                                                        value={'createdAt'}
                                                        className="app-sorting-radio-input"
                                                    >
                                                        {(props) => {
                                                            return (
                                                                <div className="app-sorting-radio-content">
                                                                    {props.checked && <IconMarked />}
                                                                </div>
                                                            )
                                                        }}
                                                    </Radio>
                                                    <Label>{'Created At'}</Label>

                                                </ Field>
                                                <IconAdd />
                                            </CloseButton>
                                            <CloseButton className="app-sorting-radio-outer">
                                                <Field className="app-sorting-radio">
                                                    <Radio
                                                        value={'email'}
                                                        className="app-sorting-radio-input"
                                                    >
                                                        {(props) => {
                                                            return (
                                                                <div className="app-sorting-radio-content">
                                                                    {props.checked && <IconMarked />}
                                                                </div>
                                                            )
                                                        }}
                                                    </Radio>
                                                    <Label>{'Email'}</Label>
                                                </ Field>
                                                <IconAdd />
                                            </CloseButton>
                                            <CloseButton className="app-sorting-radio-outer">
                                                <Field className="app-sorting-radio">
                                                    <Radio
                                                        value={'firstName'}
                                                        className="app-sorting-radio-input"
                                                    >
                                                        {(props) => {
                                                            return (
                                                                <div className="app-sorting-radio-content">
                                                                    {props.checked && <IconMarked />}
                                                                </div>
                                                            )
                                                        }}
                                                    </Radio>
                                                    <Label>{'First Name'}</Label>
                                                </ Field>
                                                <IconAdd />
                                            </CloseButton>
                                            <CloseButton className="app-sorting-radio-outer">
                                                <Field className="app-sorting-radio">
                                                    <Radio
                                                        value={'lastName'}
                                                        className="app-sorting-radio-input"
                                                    >

                                                        {(props) => {
                                                            return (
                                                                <div className="app-sorting-radio-content">
                                                                    {props.checked && <IconMarked />}
                                                                </div>
                                                            )
                                                        }}

                                                    </Radio>
                                                    <Label>{'Last Name'}</Label>
                                                </ Field>
                                                <IconAdd />
                                            </CloseButton>
                                        </RadioGroup>
                                    </div>
                                </PopoverPanel>
                            </Popover>
                        </div>
                    </div>


                    <div className="add-user-button ml-16">
                        <button
                            onClick={() => setShowNewUserModal(true)}
                            className="gen-primary-btn"
                        >
                            Add User
                        </button>
                    </div>
                </div>
            </div>
            <div className="app-table mb-16">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th scope="column">
                                    <Field className="checkbox  mb-6">
                                        <Checkbox
                                            className="checkbox-input"
                                            checked={allRowsSelected}
                                            onChange={onSelectAllRows}
                                        // onClick={onSelectAllRows}
                                        >
                                        </Checkbox>
                                    </Field>
                                </th>
                                <th scope="column" className="caption">
                                    First Name
                                </th>
                                <th scope="column" className="caption">
                                    Last Name
                                </th>
                                <th scope="column" className="caption">
                                    Tags
                                </th>
                                <th scope="column" className="caption">
                                    Creation Date
                                </th>
                                <th scope="column" className="caption">
                                    Seen Date
                                </th>
                                <th scope="column" className="caption">
                                    Auth method
                                </th>
                                <th scope="column" className="caption">
                                    Attribution
                                </th>
                                <th scope="column" className="caption">
                                    Arcions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                items.map((el, index) => {
                                    return (
                                        <tr key={el._id}>
                                            <td>
                                                <Field className="checkbox  mb-6">
                                                    <Checkbox
                                                        className="checkbox-input"
                                                        checked={rowsSelected[index]}
                                                        onChange={(isSet) => setSelect(isSet, index)}
                                                    >
                                                    </Checkbox>
                                                </Field>
                                            </td>
                                            <td>
                                                {el.firstName}
                                            </td>
                                            <td>
                                                {el.lastName}
                                            </td>
                                            <td>
                                                {el.tags.join(', ')}
                                            </td>
                                            <td>
                                                {DateTime.fromISO(el.createdAt).toFormat('dd LLL yyyy t')}
                                            </td>
                                            <td>
                                                {el.lastSeen ? DateTime.fromISO(el.lastSeen).toFormat('dd LLL yyyy t') : '-'}
                                            </td>
                                            <td>
                                                {el.authMethod}
                                            </td>
                                            <td>
                                                -
                                            </td>
                                            <td>
                                                <button onClick={() => setEditAcl(el.acl)}>
                                                    <IconSettings width={16} height={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                        <tfoot>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="table-footer">
                <div className="left">
                    <div className="caption count">
                        {renderFrom()} to {renderTo()} of {total}
                    </div>
                    <div className="before">show</div>
                    <Menu>
                        <MenuButton className="items-in-the-table">
                            <span>{itemsPerTable}</span><IconArrowDown />
                        </MenuButton>
                        <MenuItems anchor="bottom">
                            <div className="items-in-table-options">
                                <MenuItem >
                                    <div onClick={() => setItemsPerTable(10)} className="items-in-table-option">
                                        {10}
                                    </div>
                                </MenuItem>
                                <MenuItem>
                                    <div onClick={() => setItemsPerTable(15)} className="items-in-table-option">
                                        {15}
                                    </div>
                                </MenuItem>
                                <MenuItem>
                                    <div onClick={() => setItemsPerTable(25)} className="items-in-table-option">
                                        {25}
                                    </div>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </Menu>
                    <div className="after">users</div>
                </div>
                <div className="right">
                    <ReactPaginate className="table-pagination"
                        onPageActive={(...args) => { console.log({ args }) }}
                        onPageChange={(selectedItem) => onPageChange(selectedItem.selected)}
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
            {editAcl && <AclModal updateAcl={updateAcl} acl={editAcl} setEditAcl={setEditAcl} onClose={() => setEditAcl(null)} />}
            {showNewUserModal && <NewUserModal onSubmit={onNewUser} onClose={() => setShowNewUserModal(false)} />}
            {showDelete && (
                <SubmitModal onClose={() => setShowDelete(false)}>
                    <div className="title">
                        Delete user
                    </div>
                    <p className="text-center mb-32">
                        {
                            `Are you sure you want to delete ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? 'users' : 'user'}?`
                        }
                    </p>
                    <div className="buttons">
                        <button onClick={() => setShowDelete(false)} className="gen-secondary-btn medium">
                            Cancel
                        </button>
                        <button onClick={onDelete} className="gen-primary-btn medium danger">
                            Submit
                        </button>
                    </div>
                </SubmitModal>
            )}

            {showResetPassword && (
                <SubmitModal onClose={() => setShowResetPassword(false)}>
                    <div className="title">
                        Password Reset
                    </div>
                    <p className="text-center mb-32">
                        {
                            `Are you sure you want to force a password reset for ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? 'users' : 'user'}?`
                        }
                    </p>
                    <div className="buttons">
                        <button onClick={() => setShowResetPassword(false)} className="gen-secondary-btn medium">
                            Cancel
                        </button>
                        <button onClick={onResetPassword} className="gen-primary-btn medium danger">
                            Submit
                        </button>
                    </div>
                </SubmitModal>
            )}
            {showManageTags && (
                <SubmitModal onClose={() => setShowManageTags(false)}>
                    <div className="title">
                        Tags
                    </div>
                    <div className="text-center">
                        Add Tags
                    </div>
                    <div>
                        <TextInput value={tags} onChange={(e) => setTags(e.target.value)} className="gen-input gen-input-large mb-24" />
                    </div>
                    <div className="buttons">
                        <button onClick={() => setShowManageTags(false)} className="gen-secondary-btn medium">
                            Cancel
                        </button>
                        <button onClick={onTagsSumbmit} className="gen-primary-btn medium">
                            Submit
                        </button>
                    </div>
                </SubmitModal>
            )}
            {renderActionsForSelected()}
        </div>
    )
}
