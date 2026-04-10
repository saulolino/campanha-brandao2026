import { useLocation } from "wouter";
import { ShieldOff, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

interface AcessoNegadoProps {
  /** Rota que o usuário tentou acessar */
  rotaTentada?: string;
}

const roleLabel: Record<string, string> = {
  visitor: "Visitante",
  team: "Equipe",
  coordinator: "Coordenador",
  superadmin: "SuperAdmin",
};

export default function AcessoNegado({ rotaTentada }: AcessoNegadoProps) {
  const [, navigate] = useLocation();
  const { role } = usePermissions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-colorida_de2594b3.png"
            alt="Brasília Cidade Parque"
            className="h-20 object-contain opacity-80"
          />
        </div>

        {/* Ícone */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center">
            <ShieldOff size={36} className="text-red-400" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Você está autenticado como{" "}
            <span className="text-slate-200 font-medium">
              {roleLabel[role] ?? role}
            </span>
            , mas não tem permissão para acessar
            {rotaTentada ? (
              <>
                {" "}a seção{" "}
                <span className="text-slate-200 font-mono text-xs bg-slate-700/60 px-1.5 py-0.5 rounded">
                  {rotaTentada}
                </span>
              </>
            ) : (
              " esta seção"
            )}
            .
          </p>
        </div>

        {/* Orientação */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            O que fazer?
          </p>
          <ul className="text-sm text-slate-400 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              Solicite ao administrador da campanha que eleve seu nível de acesso.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              Verifique se você fez login com a conta correta.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              Se acredita que isso é um erro, entre em contato com a equipe técnica.
            </li>
          </ul>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft size={16} />
            Voltar para Home
          </Button>
          <Button
            variant="ghost"
            className="gap-2 text-slate-400 hover:text-slate-200"
            onClick={() => {
              window.location.href = "mailto:contato@eduardobrandao.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20acesso&body=Ol%C3%A1%2C%20preciso%20de%20acesso%20%C3%A0%20se%C3%A7%C3%A3o%20restrita%20do%20painel.";
            }}
          >
            <Mail size={16} />
            Solicitar acesso
          </Button>
        </div>
      </div>
    </div>
  );
}
