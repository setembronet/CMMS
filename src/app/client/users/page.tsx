import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ClientUsersPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Usuários</h1>
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full p-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">Módulo de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A interface para gerenciar os usuários da sua equipe (técnicos, gestores) será construída aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
