import { useLayoutEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { actionGetUsers } from "../../../actions"
import { ModelAppUser, ModelUserACL } from "../../../models"
import { Checkbox, Field } from "@headlessui/react"
import { IconSettings } from "../../../components/Icons/IconSettings"
import { AclModal } from "../../../components/modal/AclModal"

export function AdminAppUsers() {
    let { appId } = useParams()
    const [allRowsSelected, setAllRowsSelected] = useState(false)
    const [items, setItems] = useState<Array<ModelAppUser>>([])
    const [rowsSelected, setRowsSelected] = useState(items.map(_el => false))

    const [editAcl, setEditAcl] = useState<ModelUserACL | null>(null)

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

    useLayoutEffect(() => {
        actionGetUsers(appId)
            .then((response) => {
                const { limit, offset, order, orderBy, total, items } = response.data
                setItems(items)
            })
    }, [])

    return (
        <div className="app-content-body-page">
            <div className="app-content-body-header">
                <div className="left">
                    Users
                </div>
                <div className="right">

                </div>
            </div>
            <div className="app-table">
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
                                        >
                                        </Checkbox>
                                    </Field>
                                </th>
                                <th scope="column">
                                    First Name
                                </th>
                                <th scope="column">
                                    Last Name
                                </th>
                                <th scope="column">
                                    Tags
                                </th>
                                <th scope="column">
                                    Creation Date
                                </th>
                                <th scope="column">
                                    Seen Date
                                </th>
                                <th scope="column">
                                    Auth method
                                </th>
                                <th scope="column">
                                    Attribution
                                </th>
                                <th scope="column">
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
                                                {el.createdAt}
                                            </td>
                                            <td>
                                                {el.lastSeen}
                                            </td>
                                            <td>
                                                {el.authMethod}
                                            </td>
                                            <td>
                                                -
                                            </td>
                                            <td>
                                                <button onClick={() => setEditAcl(el.acl)}>
                                                    <IconSettings />
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
            {editAcl && <AclModal acl={editAcl} setEditAcl={setEditAcl} onClose={() => setEditAcl(null)} />}
        </div>
    )
}
