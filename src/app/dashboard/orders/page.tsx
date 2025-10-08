import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function WorkOrdersPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Ordens de Serviço</h1>
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full p-4">
            <ClipboardList className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">Gestão de Ordens de Serviço em Breve</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O módulo para criar, atribuir e rastrear ordens de serviço está sendo construído. Fique atento para atualizações!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
