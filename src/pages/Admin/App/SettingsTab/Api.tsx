import './Api.scss';

export const Api = () => {
  return (
    <div className="settings-api">
      <div className="subtitle1">App Access Key</div>
      <p className="caption">
        For accessing Ethora API and infrastructure, your App uses a Key and
        Secret pair. With this key pair, your applications can generate JWT
        tokens etc for authentication and signing API requests.
      </p>
      <p className="caption">
        Note: “Rotate” will replace your key pair with a new one. This will
        invalidate access for your application code until it’s updated with new
        credentials.
      </p>
      <div className="tablo"></div>
    </div>
  );
};
