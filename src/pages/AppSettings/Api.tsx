import { Plate } from '../../components/Plate';
import { ModelApp } from '../../models';
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
      <Plate className="w-full overflow-auto p-4">Hello</Plate>
    </div>
  );
};
