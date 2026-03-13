export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">TrainUp</h1>
          <p className="text-foreground/50 mt-1">Plataforma de Treinamentos Corporativos</p>
        </div>

        {children}

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2026 TrainUp — Treinamentos Gamificados
        </p>
      </div>
    </div>
  );
}
