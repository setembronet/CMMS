import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ClientSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Configurações da Conta</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil da Empresa</CardTitle>
          <CardDescription>Atualize as informações da sua empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa</Label>
            <Input id="company-name" defaultValue="Elevadores Atlas" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">Email de Contato</Label>
            <Input id="company-email" type="email" defaultValue="contato@atlas.com" />
          </div>
          <Button>Salvar Alterações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Tema</Label>
              <p className="text-sm text-muted-foreground">Selecione seu esquema de cores preferido.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
