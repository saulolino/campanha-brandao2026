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
  const [step, setStep] = useState<"info" | "role">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const [isLoading, setIsLoading] = useState(false);

  const handleInfoSubmit = (e: React.FormEvent) => {
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

    setStep("role");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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

        {step === "info" ? (
          // Step 1: User Information
          <Card className="p-8 border-2 border-primary/20">
            <form onSubmit={handleInfoSubmit} className="space-y-6">
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

              {/* Next Button */}
              <Button type="submit" className="w-full">
                Próximo
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
        ) : (
          // Step 2: Role Selection
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Selecione seu nível de acesso</h2>
              <p className="text-muted-foreground">Escolha o nível de acesso que melhor se adequa ao seu papel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {(["visitor", "team", "coordinator", "superadmin"] as UserRole[]).map((role) => (
                <Card
                  key={role}
                  className={`p-6 cursor-pointer border-2 transition-all duration-200 ${ROLE_COLORS[role]} ${
                    selectedRole === role ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-primary">{ROLE_ICONS[role]}</div>
                    <Badge>{ROLE_DESCRIPTIONS[role].label}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {ROLE_DESCRIPTIONS[role].label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_DESCRIPTIONS[role].description}
                  </p>
                </Card>
              ))}
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("info")}
                disabled={isLoading}
              >
                Voltar
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
