// This page has been intentionally left as a placeholder.
// The full UI for managing contracts and maintenance plans will be built in a future step.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ContractsPagePlaceholder() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Gestão de Contratos e Planos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Este módulo permitirá o gerenciamento completo dos contratos e a definição de planos de manutenção preventiva.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-12">
            <FileText className="w-16 h-16 mb-4" />
            <p>A funcionalidade completa de gestão de contratos será implementada aqui.</p>
        </CardContent>
      </Card>
    </div>
  );
}
