'use client';

import * as React from 'react';
import ClientLayout from './client-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
