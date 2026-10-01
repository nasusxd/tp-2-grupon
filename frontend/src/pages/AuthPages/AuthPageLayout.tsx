import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 flex min-h-screen w-full items-center justify-center p-6 sm:p-0">
      {children}
    </div>
  );
}