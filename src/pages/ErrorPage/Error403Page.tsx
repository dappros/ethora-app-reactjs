import images from '../../assets/error/403.png';
import { ErrorContainer } from '../../components/Error/ErrorContainer';

export const Error403Page = () => {
  return (
    <ErrorContainer
      status="403 error"
      title="Access Forbidden"
      description="Sorry, you don't have the permissions to access this page."
      image={images}
    />
  );
};
