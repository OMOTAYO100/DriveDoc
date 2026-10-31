export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div
        className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
