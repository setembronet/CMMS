
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { getBackupData, restoreData } from '@/lib/data';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function BackupPage() {
  const { toast } = useToast();
  const [fileToRestore, setFileToRestore] = React.useState<File | null>(null);

  const handleBackup = () => {
    try {
      const backupData = getBackupData();
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `tenantcare_backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Backup Realizado com Sucesso!',
        description: 'O arquivo de backup foi baixado para o seu computador.',
      });
    } catch (error) {
      console.error('Falha ao criar backup:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Backup',
        description: 'Não foi possível gerar o arquivo de backup.',
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setFileToRestore(file);
    } else {
      setFileToRestore(null);
      toast({
        variant: 'destructive',
        title: 'Arquivo Inválido',
        description: 'Por favor, selecione um arquivo .json válido.',
      });
    }
  };

  const handleRestore = () => {
    if (!fileToRestore) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Falha ao ler o arquivo.');
        }
        const data = JSON.parse(text);
        restoreData(data); // This function is not available in this context.
                           // In a real app this would call an API endpoint.
        toast({
          title: 'Restauração Concluída!',
          description: 'Os dados foram restaurados com sucesso. Atualize a página para ver as mudanças.',
        });
        setFileToRestore(null);
        // We clear the input value manually
        const fileInput = document.getElementById('restore-file') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
      } catch (error) {
        console.error('Falha ao restaurar:', error);
        toast({
          variant: 'destructive',
          title: 'Erro na Restauração',
          description: 'O arquivo de backup está corrompido ou em formato inválido.',
        });
      }
    };
    reader.readAsText(fileToRestore);
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Backup e Restore</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Fazer Backup</CardTitle>
          <CardDescription>Crie um backup completo de todos os dados da aplicação. Guarde este arquivo em um local seguro.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackup}>
            <Download className="mr-2 h-4 w-4" />
            Fazer Backup Agora
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Restaurar Backup</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>Atenção: A restauração substituirá TODOS os dados atuais. Esta ação não pode ser desfeita.</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restore-file">Arquivo de Backup (.json)</Label>
            <Input id="restore-file" type="file" accept=".json" onChange={handleFileChange} />
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!fileToRestore}>
                    <Upload className="mr-2 h-4 w-4" />
                    Restaurar Dados
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é irreversível e substituirá todos os dados existentes na aplicação
                  pelos dados do arquivo de backup. Você confirma que deseja prosseguir?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRestore}>Sim, restaurar backup</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
