import images from '../../assets/error/404.png';
import { ErrorContainer } from '../../components/Error/ErrorContainer';

interface Error404PageProps {
  navigateUrl?: string;
}

export const Error404Page = ({ navigateUrl }: Error404PageProps) => {
  return (
    <ErrorContainer
      status="404 error"
      title="We can’t find that page"
      description="Sorry, the page you are looking for doesn’t exist or has been moved."
      image={images}
      navigateUrl={navigateUrl}
    />
  );
};
