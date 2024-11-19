import cn from 'classnames';
import { CopyButton } from '../../components/CopyButton';
import { Secret } from '../../components/Secret';
import { ModelApp } from '../../models';
import './Api.scss';

interface Props {
  app: ModelApp;
}

export const Api = ({ app }: Props) => {
  return (
    <div className="">
      <div className="font-semibold font-sans text-normal mb-4">
        App Access Key
      </div>
      <p className="text-gray-500 text-sm font-sans">
        For accessing Ethora API and infrastructure, your App uses a Key and
        Secret pair. With this key pair, your applications can generate JWT
        tokens etc for authentication and signing API requests.
      </p>
      <p className="text-gray-500 text-sm font-sans mb-4">
        Note: “Rotate” will replace your key pair with a new one. This will
        invalidate access for your application code until it’s updated with new
        credentials.
      </p>

      <div className="p-4 border border-gray-200 rounded-xl">
        <div className="mx-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="w-1/2 r-delimiter px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-l-lg">
                  Key
                </th>
                <th className="w-1/2 px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-r-lg">
                  Secret
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={cn('hover:!bg-[#F5F7F9]')}>
                <td className="r-delimiter px-4 py-[20px] font-sans font-normal text-sm rounded-l-lg">
                  <div className="flex justify-items-center">
                    <span className="mr-2">{app._id}</span>
                    <CopyButton value={app._id} />
                  </div>
                </td>
                <td className=" px-4 font-sans font-normal text-sm text-center rounded-r-lg">
                  <div className="flex justify-items-center">
                    <Secret className="mr-2" value={app.appSecret} />
                    <CopyButton value={app.appSecret} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
