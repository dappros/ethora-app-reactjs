import { useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getShareDoc } from '../http';

export function ShareDocument() {
  const [accessError, setAccessError] = useState(false);

  const { token } = useParams();

  useLayoutEffect(() => {
    if (token) {
      getShareDoc(token)
        .then(() => {})
        .catch(() => {
          setAccessError(true);
        });
    }
  }, []);

  const renderForbidden = () => {
    if (accessError) {
      return (
        <div>Document access has expired or has been blocked by the owner.</div>
      );
    }
  };

  return <div>{renderForbidden()}</div>;
}
