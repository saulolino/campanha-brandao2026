import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, Phone, Users, Eye, Shield, Crown } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ROLE_DESCRIPTIONS, type UserRole } from "@shared/permissions";

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  visitor: <Eye size={24} />,
  team: <Users size={24} />,
  coordinator: <Shield size={24} />,
  superadmin: <Crown size={24} />,
};

const ROLE_COLORS: Record<UserRole, string> = {
  visitor: "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20",
  team: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
  coordinator: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
  superadmin: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
};

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !whatsapp || !password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          password,
          role: selectedRole,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao registrar");
        return;
      }

      toast.success("Registro realizado com sucesso!");
      setLocation("/home");
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
          <p className="text-lg text-muted-foreground">Registre-se no Painel de Campanha</p>
        </div>

        <Card className="p-8 border-2 border-primary/20">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome Completo</label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  type="tel"
                  placeholder="(61) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Nível de Acesso</label>
              <div className="grid grid-cols-2 gap-3">
                {(["visitor", "team", "coordinator", "superadmin"] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      ROLE_COLORS[role]
                    } ${selectedRole === role ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary">{ROLE_ICONS[role]}</span>
                      <span className="text-xs font-bold">{ROLE_DESCRIPTIONS[role].label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role].description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Register Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Faça login aqui
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
