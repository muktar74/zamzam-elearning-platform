import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Switched to modern class property syntax for state initialization.
  // This is the standard way to declare state in React class components and avoids
  // potential issues with 'this' context that can arise with constructors.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-zamzam-teal-50 flex items-center justify-center p-4">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h1>
                <p className="text-slate-600 mb-6">We're sorry for the inconvenience. An unexpected error occurred in the application. Please try refreshing the page or clicking the button below.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-zamzam-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-zamzam-teal-700 transition"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;