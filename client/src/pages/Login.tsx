import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const resp = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as any).error || "Email ou senha inválidos");
      }

      const data = await resp.json();

      // Manter localStorage para compatibilidade com componentes legados
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: email.trim().toLowerCase(),
          nome: data.name || email.split("@")[0],
          role: data.role,
        })
      );

      // Toast de boas-vindas com role
      const roleLabelMap: Record<string, string> = {
        visitor: "Visitante",
        team: "Equipe",
        coordinator: "Coordenador",
        superadmin: "SuperAdmin",
      };
      const nomeExibido = data.name || email.split("@")[0];
      const roleExibido = roleLabelMap[data.role] || data.role;
      toast.success(`Bem-vindo, ${nomeExibido}!`, {
        description: `Você entrou como ${roleExibido}`,
        duration: 4000,
      });
      navigate("/home");
    } catch (err: any) {
      setErro(err.message || "Email ou senha inválidos");
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-colorida_de2594b3.png"
            alt="Brasília Cidade Parque"
            className="h-28 mx-auto mb-4 object-contain drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white mb-1">
            Painel de Campanha
          </h1>
          <p className="text-slate-400">Eduardo Brandão · DF 2026</p>
        </div>

        {/* Card de Login */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500"
                disabled={carregando}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500 pr-10"
                  disabled={carregando}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-400">{erro}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={carregando || !email || !senha}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Card>

        {/* Rodapé */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            © 2026 Campanha Eduardo Brandão. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
