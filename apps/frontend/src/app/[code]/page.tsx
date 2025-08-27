// src/app/[code]/page.tsx
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

type RedirectPageProps = {
  params: {
    code: string;
  };
};

export default async function RedirectPage({ params }: RedirectPageProps): Promise<ReactNode> {
  const { code } = params; // params is a plain object, do NOT await

  // If code is missing, redirect to homepage
  if (!code) {
    redirect('/');
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error('NEXT_PUBLIC_BACKEND_URL not set in environment');

  let originalUrl: string | null = null;

  try {
    // Fetch the original URL from your backend
    const res = await fetch(`${backendUrl}/${code}`, {
      method: 'GET',
      redirect: 'manual', // prevent automatic redirect following
    });

    originalUrl = res.headers.get('location');
  } catch (err) {
    console.error('Backend fetch failed:', err);
    redirect('/'); // fallback
  }

  // If the backend returned nothing, redirect to homepage
  if (!originalUrl) {
    redirect('/');
  }

  // Redirect the user to the final destination
  redirect(originalUrl);

  // Server Component must return something, null is fine for redirects
  return null;
}
