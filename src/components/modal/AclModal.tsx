import { Checkbox, Dialog, DialogPanel, Field } from '@headlessui/react';

import classNames from 'classnames';
import { ModelUserACL } from '../../models';
import { IconClose } from '../Icons/IconClose';
import './AclModal.scss';
//@ts-ignore
import set from 'lodash.set';

interface Props {
  onClose: () => void;
  acl: ModelUserACL;
  setEditAcl: (a: ModelUserACL) => void;
  updateAcl: () => void;
}

export function AclModal({ onClose, acl, setEditAcl, updateAcl }: Props) {
  const onChange = (isSet: boolean, path: string) => {
    let newAcl = JSON.parse(JSON.stringify(acl));
    set(newAcl, path, isSet);

    setEditAcl(newAcl);
  };

  return (
    <Dialog className="acl-app-modal" open={true} onClose={() => {}}>
      <DialogPanel className="inner">
        <div className="title">ACL Editing</div>
        <div className="inner-wrap">
          <div className="subtitle1">Applications</div>
          <div className="app-table mb-32">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="caption" scope="column">
                      Name
                    </th>
                    <th className="caption" scope="column">
                      Create
                    </th>
                    <th className="caption" scope="column">
                      Read
                    </th>
                    <th className="caption" scope="column">
                      Update
                    </th>
                    <th className="caption" scope="column">
                      Delete
                    </th>
                    <th className="caption" scope="column">
                      Admin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="caption">appCreate</td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appCreate.create}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appCreate.create')
                          }
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                  </tr>
                  <tr>
                    <td className="caption">appSettings</td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appSettings.read}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appSettings.read')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appSettings.update}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appSettings.update')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          disabled
                          onChange={() => {}}
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appSettings.admin}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appSettings.admin')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                  </tr>
                  <tr>
                    <td className="caption">appUsers</td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appUsers.create}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appUsers.create')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appUsers.read}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appUsers.read')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appUsers.update}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appUsers.update')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appUsers.delete}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appUsers.delete')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appUsers.admin}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appUsers.admin')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                  </tr>
                  <tr>
                    <td className="caption">appTokens</td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appTokens.create}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appTokens.create')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appTokens.read}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appTokens.read')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appTokens.update}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appTokens.update')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appTokens.admin}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appTokens.admin')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                  </tr>
                  <tr>
                    <td className="caption">appPush</td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appPush.create}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appPush.create')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appPush.read}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appPush.read')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appPush.update}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appPush.update')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appPush.admin}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appPush.admin')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                  </tr>
                  <tr>
                    <td className="caption">appStats</td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appStats.read}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appStats.read')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.application.appStats.admin}
                          onChange={(isSet) =>
                            onChange(isSet, 'application.appStats.admin')
                          }
                        ></Checkbox>
                      </Field>
                    </td>
                  </tr>
                </tbody>
                <tfoot></tfoot>
              </table>
            </div>
          </div>
          <div className="subtitle1">Networks</div>
          <div className="app-table mb-32">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="caption" scope="column">
                      Name
                    </th>
                    <th className="caption" scope="column">
                      Create
                    </th>
                    <th className="caption" scope="column">
                      Read
                    </th>
                    <th className="caption" scope="column">
                      Update
                    </th>
                    <th className="caption" scope="column">
                      Delete
                    </th>
                    <th className="caption" scope="column">
                      Admin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="caption">netStats</td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={acl.network.read}
                          onChange={(isSet) => onChange(isSet, 'network.read')}
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                    <td>
                      <Field className="checkbox  mb-6">
                        <Checkbox
                          className="checkbox-input"
                          checked={false}
                          onChange={() => {}}
                          disabled
                        ></Checkbox>
                      </Field>
                    </td>
                  </tr>
                </tbody>
                <tfoot></tfoot>
              </table>
            </div>
          </div>
        </div>
        <div className="buttons">
          <button className="gen-secondary-btn mr-16" onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={() => updateAcl()}
            className={classNames('gen-primary-btn')}
          >
            Update ACL
          </button>
        </div>

        <button className="close" onClick={() => onClose()}>
          <IconClose />
        </button>
      </DialogPanel>
    </Dialog>
  );
}
