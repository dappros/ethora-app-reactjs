import images from '../../assets/error/429.png';
import { ErrorContainer } from '../../components/Error/ErrorContainer';

export const Error429Page = () => {
  return (
    <ErrorContainer
      status="429 error"
      title="Too Many Requests"
      description="You've sent too many requests in a short period. Please wait a moment before trying again."
      image={images}
    />
  );
};
