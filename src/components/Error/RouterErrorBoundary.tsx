import { Component, ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-brand-500 text-white rounded"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function RouterErrorElement() {
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
          <p className="mb-4">{error.data?.message || 'An error occurred'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Routing error</h2>
        <p className="mb-4">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    </div>
  );
}

