import { Logo } from '@/components/logo';

export default function TestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center mb-6">
        <Logo />
      </div>
      <h1 className="text-4xl font-bold font-headline mb-2 text-center">Página de Teste Funcional!</h1>
      <div className="max-w-2xl text-center space-y-4">
        <p className="text-muted-foreground">Esta página prova duas coisas importantes:</p>
        <ol className="list-decimal list-inside text-left mx-auto max-w-md space-y-2">
          <li>
            <span className="font-semibold">Roteamento Correto:</span> Você está vendo esta página porque o Next.js encontrou o arquivo em <code className="bg-muted px-1 py-0.5 rounded-sm">app/test/page.tsx</code> e o mapeou para a URL <code className="bg-muted px-1 py-0.5 rounded-sm">/test</code>.
          </li>
          <li>
            <span className="font-semibold">Aliases de Importação Corretos:</span> O logo acima está visível porque a importação <code className="bg-muted px-1 py-0.5 rounded-sm">@/components/logo</code> foi resolvida corretamente.
          </li>
        </ol>
        <p className="pt-4 text-green-600 font-bold">A estrutura base do seu projeto está funcionando como esperado.</p>
      </div>
    </div>
  );
}
