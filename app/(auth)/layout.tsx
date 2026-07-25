"use client";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-gray-900 p-4 lg:p-8 transition-colors">
      {children}
    </div>
  );
}
