import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/verify-email/:token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!params?.token) {
        setStatus("error");
        setMessage("Token de verificação não encontrado");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: params.token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Email verificado com sucesso!");
          setTimeout(() => setLocation("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Falha ao verificar email");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Erro ao verificar email");
      }
    };

    verifyEmail();
  }, [params?.token, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <h1 className="text-2xl font-bold mb-2">Verificando Email</h1>
              <p className="text-muted-foreground">Por favor, aguarde...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold mb-2 text-green-600">Email Verificado!</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecionando para login...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold mb-2 text-red-600">Erro na Verificação</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button onClick={() => setLocation("/login")} className="w-full">
                Voltar para Login
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
