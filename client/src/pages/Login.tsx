import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao fazer login");
        return;
      }

      toast.success("Login realizado com sucesso!");
      // Aguardar um pouco para garantir que o toast seja exibido
      setTimeout(() => {
        setLocation("/");
      }, 500);
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030106586/ev4E5UN3WPLGa6X4YsWXwc/logo-bcp_185f8543.png"
              alt="Brasília Cidade Parque"
              className="w-12 h-12"
            />
            <h1 className="text-3xl font-bold text-foreground">Brasília Cidade Parque</h1>
          </div>
          <p className="text-lg text-muted-foreground">Painel de Campanha</p>
        </div>

        {/* Login Form */}
        <Card className="p-8 border-2 border-primary/20">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">Senha</label>
                <a
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{" "}
              <a
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Registre-se aqui
              </a>
            </p>
          </div>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            Use suas credenciais de acesso ao painel da campanha para fazer login.
          </p>
        </Card>
      </div>
    </div>
  );
}
