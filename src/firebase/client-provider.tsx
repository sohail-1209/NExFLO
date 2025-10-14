
'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { initializeFirebase, type FirebaseServices } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';

type FirebaseClientProviderProps = {
  children: ReactNode;
};

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    const services = initializeFirebase();
    setServices(services);
  }, []);

  if (!services) {
    return null;
  }

  return <FirebaseProvider {...services}>{children}</FirebaseProvider>;
}
