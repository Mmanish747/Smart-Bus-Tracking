import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-600">Page not found</p>
      <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
