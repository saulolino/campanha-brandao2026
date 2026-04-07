import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, LogIn } from "lucide-react";

// Personas pré-configuradas
const PERSONAS = [
  {
    email: "visitante@teste.com",
    senha: "senha123",
    whatsapp: "(61) 98888-8888",
    role: "visitor",
    nome: "Visitante",
  },
  {
    email: "equipe@teste.com",
    senha: "senha123",
    whatsapp: "(61) 97777-7777",
    role: "team",
    nome: "Equipe",
  },
  {
    email: "coordenador@teste.com",
    senha: "senha123",
    whatsapp: "(61) 96666-6666",
    role: "coordinator",
    nome: "Coordenador",
  },
  {
    email: "superadmin@teste.com",
    senha: "senha123",
    whatsapp: "(61) 95555-5555",
    role: "superadmin",
    nome: "Superadmin",
  },
];

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // Validar credenciais
      const persona = PERSONAS.find(
        (p) => p.email === email && p.senha === senha
      );

      if (!persona) {
        setErro("Email ou senha inválidos");
        setCarregando(false);
        return;
      }

      // Armazenar dados da sessão no localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: persona.email,
          nome: persona.nome,
          role: persona.role,
          whatsapp: persona.whatsapp,
        })
      );

      // Redirecionar para o dashboard
      navigate("/home");
    } catch (err) {
      setErro("Erro ao fazer login");
      setCarregando(false);
    }
  };

  const handleQuickLogin = async (persona: (typeof PERSONAS)[0]) => {
    setErro("");
    setCarregando(true);

    try {
      // Armazenar dados da sessão no localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: persona.email,
          nome: persona.nome,
          role: persona.role,
          whatsapp: persona.whatsapp,
        })
      );

      // Redirecionar para o dashboard
      navigate("/home");
    } catch (err) {
      setErro("Erro ao fazer login");
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-lg mb-4">
            <div className="text-3xl font-bold text-green-500">🌳</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Brasília Cidade Parque
          </h1>
          <p className="text-slate-400">Painel de Campanha - Eduardo Brandão</p>
        </div>

        {/* Card de Login */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 mb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                disabled={carregando}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Senha
              </label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                disabled={carregando}
              />
            </div>

            {erro && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle size={16} className="text-red-500" />
                <p className="text-sm text-red-400">{erro}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={carregando || !email || !senha}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Card>

        {/* Personas de Teste */}
        <div className="space-y-3">
          <p className="text-xs text-slate-400 text-center mb-3">
            Clique em uma persona para teste rápido:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PERSONAS.map((persona) => (
              <button
                key={persona.role}
                onClick={() => handleQuickLogin(persona)}
                disabled={carregando}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-xs font-medium text-white">
                  {persona.nome}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {persona.role}
                </div>
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Todos usam senha: <span className="font-mono">senha123</span>
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            © 2026 Campanha Eduardo Brandão. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
