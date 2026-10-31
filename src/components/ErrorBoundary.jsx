import { Component } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Catches a render error anywhere below it.
 *
 * Without this, one thrown error unmounts the entire tree and the user is left
 * looking at a white page with no explanation and no way forward. React has no
 * hook equivalent — an error boundary must be a class.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Somewhere to hang Sentry or similar later.
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" aria-hidden="true" />
          <h1 className="mb-2 text-xl font-bold text-gray-900">Something broke on this page</h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-600">
            Your documents are safe — this is a display problem, not a data one. Reloading usually
            fixes it.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 cursor-pointer"
            >
              Reload
            </button>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Back to dashboard
            </button>
          </div>

          {import.meta.env.DEV && (
            <pre className="mt-6 max-h-48 overflow-auto rounded bg-gray-900 p-3 text-left text-xs text-gray-100">
              {this.state.error.stack || String(this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
