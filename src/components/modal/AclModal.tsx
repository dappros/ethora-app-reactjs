import { Dialog, DialogPanel } from '@headlessui/react';

import { ModelUserACL } from '../../models';
import { IconClose } from '../Icons/IconClose';
import './AclModal.scss';
//@ts-ignore
import { set, get } from 'lodash';
import { CheckboxApp } from '../CheckboxApp';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  onClose: () => void;
  acl: ModelUserACL;
  setEditAcl: (a: ModelUserACL) => void;
  updateAcl: () => void;
}

export function AclModal({ onClose, acl, setEditAcl, updateAcl }: Props) {
  const { t } = useTranslation();

  const onChange = (isSet: boolean, path: string) => {
    let newAcl = JSON.parse(JSON.stringify(acl));
    set(newAcl, path, isSet);

    setEditAcl(newAcl);
  };

  return (
    <Dialog
      className="fixed inset-0 flex justify-center items-center bg-black/30"
      open={true}
      onClose={() => {}}
    >
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px]">
        <div className="font-varela text-[24px] text-center relative flex justify-center items-center mb-8">
          <span>{t('aclModal.title')}</span>
          <button className="absolute top-0 right-0" onClick={() => onClose()}>
            <IconClose />
          </button>
        </div>

        <div className="font-sans font-semibold text-regular mb-2">
          {t('aclModal.appLevelTitle')}
        </div>

        <div className="font-sans text-xs text-[#8C8C8C] mb-4">
          {t('aclModal.appLevelDescription')}
        </div>

        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('aclModal.colName')}
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  {t('aclModal.colCreate')}
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  {t('aclModal.colRead')}
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  {t('aclModal.colUpdate')}
                </th>

                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  {t('aclModal.colDelete')}
                </th>

                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  {t('aclModal.colAdmin')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  {t('aclModal.rowCreateApps')}
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appCreate.create}
                      disabled
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appCreate.create')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} disabled onChange={() => {}} />
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} disabled onChange={() => {}} />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  {t('aclModal.rowSettings')}
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appSettings.read}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appSettings.read')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appSettings.update}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appSettings.update')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} disabled onChange={() => {}} />
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} disabled onChange={() => {}} />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  {t('aclModal.rowUsers')}
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appUsers.create}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appUsers.create')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appUsers.read}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appUsers.read')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appUsers.update}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appUsers.update')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appUsers.delete}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appUsers.delete')
                      }
                    />
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appUsers.admin}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appUsers.admin')
                      }
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  {t('aclModal.rowTokens')}
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appTokens.create}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appTokens.create')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appTokens.read}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appTokens.read')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appTokens.update}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appTokens.update')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appTokens.admin}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appTokens.admin')
                      }
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  {t('aclModal.rowPushNotifications')}
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appPush.create}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appPush.create')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appPush.read}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appPush.read')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appPush.update}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appPush.update')
                      }
                    />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>

                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appPush.admin}
                      onChange={(isSet) =>
                        onChange(isSet, 'application.appPush.admin')
                      }
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  {t('aclModal.rowStatistics')}
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appStats.read}
                      onChange={(isSet) => onChange(isSet, 'application.appStats.read')}
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.application.appStats.admin}
                      onChange={(isSet) => onChange(isSet, 'application.appStats.admin')}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot></tfoot>
          </table>
        </div>

        <div className="font-sans font-semibold text-regular mb-2">
          {t('aclModal.serverLevelTitle')}
        </div>

        <div className="font-sans text-xs text-[#8C8C8C] mb-4">
          {t('aclModal.serverLevelDescription')}
        </div>

        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                  {t('aclModal.colName')}
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  {t('aclModal.colCreate')}
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                  {t('aclModal.colRead')}
                </th>
                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  {t('aclModal.colUpdate')}
                </th>

                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  {t('aclModal.colDelete')}
                </th>

                <th className="px-4 text-gray-500 font-normal font-inter text-xs rounded-r-lg text-center whitespace-nowrap">
                  {t('aclModal.colAdmin')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pl-4 py-2 w-[32px] rounded-l-lg font-inter text-xs whitespace-nowrap">
                  {t('aclModal.rowStatistics')}
                </td>
                <td className="px-4 py-[13px] text-center font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp
                      checked={acl.network.netStats.read}
                      onChange={(isSet) => onChange(isSet, 'network.netStats.read')}
                    />
                  </div>
                </td>
                <td className="px-4 font-sans font-normal text-sm text-center">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
                <td className="px-4 rounded-r-lg font-sans font-normal text-sm">
                  <div className="flex justify-center">
                    <CheckboxApp checked={false} onChange={() => {}} disabled />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <button
            className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500"
            onClick={onClose}
          >
            {t('aclModal.cancel')}
          </button>
          <button
            onClick={() => updateAcl()}
            className="w-full py-[12px] rounded-xl bg-brand-500 text-white"
          >
            {t('aclModal.updateAcl')}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
