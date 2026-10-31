import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
        <Compass className="mx-auto mb-4 h-10 w-10 text-gray-300" aria-hidden="true" />
        <h1 className="mb-2 text-xl font-bold text-gray-900">Page not found</h1>
        <p className="mb-6 text-sm text-gray-600">
          That link doesn't go anywhere in DriveDoc.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
