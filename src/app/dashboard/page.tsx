
'use client';

import { useClient } from '@/context/client-provider';
import CmmsDashboardPage from './cmms/page';
import { useI18n } from '@/hooks/use-i18n';

export default function DashboardPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();

  if (!selectedClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-3xl font-bold font-headline mb-4">{t('sidebar.dashboard')}</h1>
          <p className="text-muted-foreground">Selecione um cliente no menu superior para ver o dashboard operacional.</p>
      </div>
    )
  }

  return <CmmsDashboardPage />;
}
