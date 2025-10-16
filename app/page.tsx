import { Logo } from './components/logo';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center mb-6">
        <Logo />
      </div>
      <h1 className="text-4xl font-bold font-headline mb-2">Sistema Resetado</h1>
      <p className="text-muted-foreground mb-6">A base do projeto está funcional. Podemos reconstruir a partir daqui.</p>
    </div>
  );
}
