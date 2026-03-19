export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-none">
        {children}

        <p className="text-center align-bottom text-gray-500 text-xs">
          © 2026 TrainUp — Treinamentos Gamificados
        </p>
      </div>
    </div>
  );
}
