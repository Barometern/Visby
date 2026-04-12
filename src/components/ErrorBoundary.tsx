import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1008] px-4 text-center">
          <p className="font-heading text-2xl text-medieval-gold">Something went wrong</p>
          <p className="mt-2 font-body text-sm text-amber-200/70">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full border border-medieval-gold/30 bg-medieval-gold/10 px-6 py-2 font-heading text-sm text-medieval-gold hover:bg-medieval-gold/20"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
