import { Table } from '@alfalab/core-components-table';
import { CopyButton } from '../../../../components/CopyButton';
import { Plate } from '../../../../components/Plate';

import { Secret } from '../../../../components/Secret';
import { ModelApp } from '../../../../models';
import './Api.scss';

interface Props {
  app: ModelApp;
}

export const Api = ({ app }: Props) => {
  return (
    <div className="px-4 font-sans">
      <div className="font-semibold text-base mb-3">App Access Key</div>
      <p className="text-gray-500 text-xs mb-2">
        For accessing Ethora API and infrastructure, your App uses a Key and
        Secret pair. With this key pair, your applications can generate JWT
        tokens etc for authentication and signing API requests.
      </p>
      <p className="text-gray-500 text-xs mb-4">
        Note: “Rotate” will replace your key pair with a new one. This will
        invalidate access for your application code until it’s updated with new
        credentials.
      </p>
      <div className="w-full ove"></div>
      <Plate className="w-full overflow-auto p-4">
        <div className="table-table-outer w-full overflow-auto">
          <Table
            wrapper={false}
            className="table-table w-full min-w-[600px] table-fixed"
            compactView
          >
            <Table.THead rowClassName="border-0 font-inter font-normal text-xs">
              <Table.THeadCell
                className="py-2 font-normal relative border-0 text-gray-500 bg-gray-50 rounded-l-xl"
                title="Key"
              >
                Key
              </Table.THeadCell>
              <Table.THeadCell
                className="py-2 font-normal relative border-0 text-gray-500 bg-gray-50 rounded-r-xl"
                title="Secret"
              >
                Secret
              </Table.THeadCell>
            </Table.THead>
            <Table.TBody>
              <Table.TRow>
                <Table.TCell
                  className="h-0 relative border-0 py-3 rounded-l-xl"
                  title="Дата"
                >
                  <div className="flex justify-items-center">
                    <span className="mr-2">{app._id}</span>
                    <CopyButton value={app._id} />
                  </div>
                </Table.TCell>
                <Table.TCell
                  className="h-0 relative border-0 py-3 rounded-r-xl"
                  title="Secret"
                >
                  <div className="flex justify-items-center">
                    <Secret className="mr-2" value={app.appSecret} />
                    <CopyButton value={app.appSecret} />
                  </div>
                </Table.TCell>
              </Table.TRow>
            </Table.TBody>
          </Table>
        </div>
      </Plate>
    </div>
  );
};
