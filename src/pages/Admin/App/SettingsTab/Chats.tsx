import { Checkbox, Field, Label } from "@headlessui/react"
import { useState } from "react"
import "./Chats.scss"

const chatsData = [
    {
        title: 'chat1',
        pinned: true,
        jid: '123'
    },
    {
        title: 'chat2',
        pinned: false,
        jid: '345'
    }
]

export function Chats() {
    const [enableCreateChats, setEnableCreateChats] = useState(false)

    const [allRowsSelected, setAllRowsSelected] = useState(false)
    const [rowsSelected, setRowsSelected] = useState(chatsData.map(el => el.pinned))

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

        setRowsSelected(rowsSelected.map((_el) => selected))
    }

    return (
        <div className="settings-chats">
            <p className="subtitle1 mb-16">
                New Chats
            </p>
            <Field className="checkbox mb-6">
                <Checkbox
                    className="checkbox-input"
                    checked={enableCreateChats}
                    onChange={setEnableCreateChats}
                >
                </Checkbox>
                <Label className="label">
                    Allow Users to create new Chats
                </Label>
            </Field>
            <p className="caption mb-32">When enabled, your Users can create new Chats and invite other Users there. When disabled, only pre-existing Chats or Chats created by your business can be used.</p>
            <p className="subtitle1">Pinned Chats</p>
            <p className="caption">Pinned or “starred” Chats are permanent chat rooms that your Users will automatically see and join. </p>
            <div className="app-table">
                <div className="title">
                    <div className="left">
                        <div className="subtitle1">List of chats</div>
                    </div>
                </div>
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
                                    Chat Name
                                </th>
                                <th scope="column">
                                    Type
                                </th>
                                <th scope="column">
                                    Visibility
                                </th>
                                <th scope="column">
                                    Comment
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                chatsData.map((el, index) => {
                                    return (
                                        <tr key={el.jid}>
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
                                                {el.title}
                                            </td>
                                            <td>
                                                Public
                                            </td>
                                            <td>
                                                Visible
                                            </td>
                                            <td>
                                                You may  replace this with your own hidden Chat.
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
        </div>
    )
}
