// src/app/[code]/page.tsx
import { redirect } from 'next/navigation';

// Define the type for the props yourself
interface PageProps {
  params: {
    code: string;
  };
}

export default async function RedirectPage({ params }: PageProps) {
  const { code } = params;

  if (!code) redirect('/');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error('NEXT_PUBLIC_BACKEND_URL not set');

  let originalUrl: string | null = null;

  try {
    const res = await fetch(`${backendUrl}/${code}`, {
      method: 'GET',
      redirect: 'manual',
    });
    originalUrl = res.headers.get('location');
  } catch {
    redirect('/');
  }

  if (!originalUrl) redirect('/');

  redirect(originalUrl);

  return null;
}