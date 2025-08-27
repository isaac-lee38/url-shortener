// src/app/[code]/page.tsx
import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }: { params: { code: string } }) {
  const { code } = params; // plain object, no await

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
