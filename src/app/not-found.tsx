import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#FAFBFA] font-sans">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#2E8B34] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="text-6xl font-extrabold text-[#111827] tracking-tight mb-2">404</h1>
          <p className="text-lg text-[#6B7280] mb-8">
            This page doesn&apos;t exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-[#2E8B34] text-white font-semibold text-sm hover:bg-[#257A2B] transition-colors"
            >
              Go home
            </Link>
            <Link
              href="/timeline"
              className="px-6 py-3 rounded-full border border-[#C0CEC0] text-[#374151] font-medium text-sm hover:border-[#2E8B34] hover:text-[#2E8B34] transition-colors"
            >
              Open app
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
