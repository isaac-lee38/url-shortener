// src/app/[code]/page.tsx
import { redirect } from 'next/navigation';

// Define your own props interface
interface RedirectPageProps {
  params: {
    code: string;
  };
}

// Async server component
export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = params; // params is plain object

  if (!code) {
    redirect('/');
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error('NEXT_PUBLIC_BACKEND_URL not set');

  let originalUrl: string | null = null;

  try {
    const res = await fetch(`${backendUrl}/${code}`, {
      method: 'GET',
      redirect: 'manual', // do not follow redirects automatically
    });
    originalUrl = res.headers.get('location');
  } catch (err) {
    console.error('Fetch failed:', err);
    redirect('/');
  }

  if (!originalUrl) {
    redirect('/');
  }

  // Perform the redirect
  redirect(originalUrl);

  // Server component must return something
  return null;
}
