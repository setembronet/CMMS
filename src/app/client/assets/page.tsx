import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function ClientAssetsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Gestão de Ativos</h1>
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full p-4">
            <Wrench className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">Módulo de Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A interface para cadastrar, editar e visualizar os ativos da sua empresa será construída aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
