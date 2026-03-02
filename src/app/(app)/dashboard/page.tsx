import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-2">
        Olá, {session.name.split(" ")[0]}!
      </h2>
      <p className="text-purple-200 mb-6">
        Você está logado na plataforma de treinamentos.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">Seus dados:</h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>
            <span className="text-gray-400">ID:</span> {session.id}
          </li>
          <li>
            <span className="text-gray-400">Nome:</span> {session.name}
          </li>
          <li>
            <span className="text-gray-400">Email:</span> {session.email}
          </li>
        </ul>
      </div>
    </div>
  );
}
