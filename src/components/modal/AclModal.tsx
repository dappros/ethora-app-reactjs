import { Checkbox, Dialog, DialogPanel, Field } from '@headlessui/react';

import classNames from 'classnames';
import { ModelUserACL } from '../../models';
import { IconClose } from '../Icons/IconClose';
import './AclModal.scss';
//@ts-ignore
import {set} from 'lodash';
import { IconCheckbox } from '../Icons/IconCheckbox';

interface Props {
  onClose: () => void;
  acl: ModelUserACL;
  setEditAcl: (a: ModelUserACL) => void;
  updateAcl: () => void;
}

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



export function AclModal({ onClose, acl, setEditAcl, updateAcl }: Props) {
  const onChange = (isSet: boolean, path: string) => {
    let newAcl = JSON.parse(JSON.stringify(acl));
    set(newAcl, path, isSet);

    setEditAcl(newAcl);
  };

  return (
    <Dialog className="fixed inset-0 flex justify-center items-center bg-black/30" open={true} onClose={() => { }}>
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px]">
        <div className="font-varela text-[24px] text-center relative flex justify-center items-center mb-8">
          <span>
            ACL Editing
          </span>
          <button className="absolute top-0 right-0" onClick={() => onClose()}>
            <IconClose />
          </button>
        </div>

        <div className="font-sans font-semibold text-regular mb-2">
          App level
        </div>

        <div className="font-sans text-xs text-[#8C8C8C] mb-4">
          Here you can assign or remove User’s access rights to certain objects within the current App.
        </div>

        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  Create
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  Read
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  Update
                </th>

                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  Delete
                </th>

                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  Admin
                </th>
              </tr>
            </thead>
            <tbody>


              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  Settings
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appSettings.read}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appSettings.read')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appSettings.update}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appSettings.update')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        disabled
                        onChange={() => { }}
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appSettings.admin}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appSettings.admin')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  Create apps
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.create}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.create')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.read}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.read')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.update}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.update')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.delete}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.delete')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.admin}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.admin')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  Users
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.create}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.create')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.read}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.read')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.update}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.update')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.delete}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.delete')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appUsers.admin}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appUsers.admin')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  Tokens
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appTokens.create}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appTokens.create')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appTokens.read}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appTokens.read')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appTokens.update}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appTokens.update')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appTokens.admin}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appTokens.admin')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
              </tr>



              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  Push Notifications
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appPush.create}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appPush.create')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appPush.read}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appPush.read')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appPush.update}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appPush.update')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.application.appPush.admin}
                        onChange={(isSet) =>
                          onChange(isSet, 'application.appPush.admin')
                        }
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
              </tr>


              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  Statistics
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={acl.network.read}
                        onChange={(isSet) => onChange(isSet, 'network.read')}
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">

                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={false}
                        onChange={() => { }}
                        disabled
                      >
                        <IconCheckbox className="hidden group-data-[checked]:block" />
                      </Checkbox>
                    </Field>
                  </div>

                </td>
              </tr>



            </tbody>
            <tfoot></tfoot>
          </table>
        </div>

        <div className="font-sans font-semibold text-regular mb-2">
          Server level
        </div>

        <div className="font-sans text-xs text-[#8C8C8C] mb-4">
          Here you can assign or remove User’s access to infrastructure level objects, above the context of any Apps. Available for Enterprise Plan.
        </div>

        <div className="grid grid-cols-2 gap-8">
          <button className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500" onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={() => updateAcl()}
            className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
          >
            Update ACL
          </button>
        </div>


      </DialogPanel>
    </Dialog>
  );
}
