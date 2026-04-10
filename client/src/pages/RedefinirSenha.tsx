import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";

export default function RedefinirSenha() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Extrair token da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
    else setErro("Link inválido. Solicite um novo link ao administrador.");
  }, []);

  const resetMutation = trpc.users.resetPasswordWithToken.useMutation({
    onSuccess: () => {
      setSucesso(true);
      setErro("");
      // Redirecionar para login após 3 segundos
      setTimeout(() => navigate("/login"), 3000);
    },
    onError: (err: any) => {
      setErro(err.message || "Erro ao redefinir senha. O link pode ter expirado.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 4) {
      setErro("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (!token) {
      setErro("Token inválido. Solicite um novo link ao administrador.");
      return;
    }

    resetMutation.mutate({ token, newPassword: novaSenha });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-lg mb-4">
            <KeyRound className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Redefinir Senha
          </h1>
          <p className="text-slate-400">Brasília Cidade Parque — Painel de Pré campanha</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
          {sucesso ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Senha redefinida!</h2>
              <p className="text-slate-400">
                Sua senha foi atualizada com sucesso. Você será redirecionado para a tela de login em instantes...
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Ir para Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500 pr-10"
                    disabled={resetMutation.isPending || !token}
                    autoFocus
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

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Confirmar Nova Senha
                </label>
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500"
                  disabled={resetMutation.isPending || !token}
                />
              </div>

              {erro && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-400">{erro}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={resetMutation.isPending || !token || !novaSenha || !confirmarSenha}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {resetMutation.isPending ? "Redefinindo..." : "Redefinir Senha"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Voltar para o login
                </button>
              </div>
            </form>
          )}
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            © 2026 Pré campanha Eduardo Brandão. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
