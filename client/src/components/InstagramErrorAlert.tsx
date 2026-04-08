import { AlertCircle, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface InstagramErrorAlertProps {
  error: Error | null;
}

export function InstagramErrorAlert({ error }: InstagramErrorAlertProps) {
  const [, navigate] = useLocation();

  if (!error) return null;

  const isCredentialsError = error.message?.includes("credentials not configured");

  if (isCredentialsError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Credenciais do Instagram não configuradas</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            Para visualizar dados reais do Instagram, é necessário configurar as credenciais da API Graph.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/configuracoes")}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Ir para Configurações
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro ao carregar dados</AlertTitle>
      <AlertDescription>
        {error.message || "Ocorreu um erro ao buscar dados do Instagram. Tente novamente."}
      </AlertDescription>
    </Alert>
  );
}
