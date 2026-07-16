import { Component, ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// RouterErrorBoundary is a class component, so it can't call the
// useTranslation() hook directly (hooks only work in function components).
// This small function component holds the translated fallback UI and is
// rendered from the class's render() method instead.
function RouterErrorFallback({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {t('routerErrorBoundary.somethingWentWrong')}
        </h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-brand-500 text-white rounded"
        >
          {t('routerErrorBoundary.refreshPage')}
        </button>
      </div>
    </div>
  );
}

export class RouterErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    if (
      error.name === 'NotFoundError' &&
      error.message.includes('removeChild') &&
      error.message.includes('not a child')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (
      !(
        error.name === 'NotFoundError' &&
        error.message.includes('removeChild') &&
        error.message.includes('not a child')
      )
    ) {
      console.error('Router Error Boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (
      this.state.hasError &&
      this.state.error &&
      this.state.error.name === 'NotFoundError' &&
      this.state.error.message.includes('removeChild') &&
      this.state.error.message.includes('not a child')
    ) {
      if (this.state.hasError) {
        setTimeout(() => {
          this.setState({ hasError: false, error: null });
        }, 0);
      }
      return this.props.children;
    }

    if (this.state.hasError && this.state.error) {
      return (
        <RouterErrorFallback
          onRefresh={() => {
            this.setState({ hasError: false, error: null });
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}

export function RouterErrorElement() {
  const { t } = useTranslation();
  const error = useRouteError();

  if (
    error instanceof Error &&
    error.name === 'NotFoundError' &&
    error.message.includes('removeChild') &&
    error.message.includes('not a child')
  ) {
    return null;
  }

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {error.status} {error.statusText}
          </h2>
          <p className="mb-4">
            {error.data?.message || t('routerErrorBoundary.errorOccurred')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {t('routerErrorBoundary.routingError')}
        </h2>
        <p className="mb-4">
          {error instanceof Error
            ? error.message
            : t('routerErrorBoundary.unknownError')}
        </p>
      </div>
    </div>
  );
}

