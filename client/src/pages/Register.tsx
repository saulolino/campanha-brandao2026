import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Register() {
  const [, navigate] = useLocation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Formatar WhatsApp automaticamente: (61) 99999-9999
  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const registerMutation = trpc.users.register.useMutation({
    onSuccess: () => {
      setSucesso(true);
    },
    onError: (err) => {
      setErro(err.message || "Erro ao realizar cadastro. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    const digitsOnly = whatsapp.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setErro("Informe um WhatsApp válido com DDD");
      return;
    }

    registerMutation.mutate({
      name: nome.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: digitsOnly,
      password: senha,
    });
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Cadastro realizado!</h2>
          <p className="text-slate-400 mb-2">
            Seu acesso foi solicitado com sucesso.
          </p>
          <p className="text-slate-400 mb-8">
            Aguarde a <span className="text-green-400 font-medium">aprovação do administrador</span> para acessar o painel. Você será notificado por WhatsApp.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp-colorida_de2594b3.png"
            alt="Brasília Cidade Parque"
            className="h-20 mx-auto mb-4 object-contain drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white mb-1">
            Solicitar Acesso
          </h1>
          <p className="text-slate-400 text-sm">Pré campanha Eduardo Brandão · DF 2026</p>
        </div>

        {/* Card de Cadastro */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Nome completo <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500"
                disabled={registerMutation.isPending}
                required
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                E-mail <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500"
                disabled={registerMutation.isPending}
                required
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                WhatsApp <span className="text-red-400">*</span>
              </label>
              <Input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                placeholder="(61) 99999-9999"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500"
                disabled={registerMutation.isPending}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Informe com DDD. Usado para notificação de aprovação.</p>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500 pr-10"
                  disabled={registerMutation.isPending}
                  required
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

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Confirmar senha <span className="text-red-400">*</span>
              </label>
              <Input
                type={mostrarSenha ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-green-500"
                disabled={registerMutation.isPending}
                required
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
              disabled={registerMutation.isPending || !nome || !email || !whatsapp || !senha || !confirmarSenha}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus size={18} />
              {registerMutation.isPending ? "Enviando..." : "Solicitar acesso"}
            </Button>
          </form>
        </Card>

        {/* Link para login */}
        <div className="mt-5 text-center">
          <p className="text-sm text-slate-400">
            Já tem acesso?{" "}
            <Link href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Entrar no painel
            </Link>
          </p>
          <p className="text-xs text-slate-500 mt-3">
            © 2026 Pré campanha Eduardo Brandão. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
