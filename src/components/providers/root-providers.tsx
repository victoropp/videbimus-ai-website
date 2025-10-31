'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { TRPCProvider } from '@/lib/trpc/provider';
import { ReactNode } from 'react';

interface RootProvidersProps {
  children: ReactNode;
}

export default function RootProviders({ children }: RootProvidersProps) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}