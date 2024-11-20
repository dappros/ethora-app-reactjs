import { ErrorContainer } from '../../components/Error/ErrorContainer';
import images from "../../assets/error/404.png";

export const Error404Page = () => {
  return (
    <ErrorContainer
      status="404 error"
      title="We can’t find that page"
      description="Sorry, the page you are looking for doesn’t exist or has been moved."
      image={images}
    />
  );
};
