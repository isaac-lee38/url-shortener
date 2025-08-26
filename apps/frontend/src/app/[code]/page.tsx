import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }: { params: { code: string } }) {
  const { code } = await params;

  if (!code) {
    redirect('/');
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) throw new Error('BACKEND_URL not set in environment');

  let originalUrl = null;

  try {
    // ONLY the fetch operation, which can fail, should be in the try block.
    console.log(`Fetching from backend: ${backendUrl}/${code}`);
    const res = await fetch(`${backendUrl}/${code}`, {
      method: 'GET',
      redirect: 'manual',
    });
    originalUrl = res.headers.get('location');
    console.log('Extracted originalUrl from header:', originalUrl);

  } catch (err) {
    // This will now only catch genuine network errors from fetch().
    console.error('Fetch operation failed:', err);
    // If the fetch fails, we redirect to the homepage.
    redirect('/');
  }

  // The redirect logic now lives OUTSIDE the try...catch.
  if (!originalUrl) {
    console.log('originalUrl is empty after fetch. Redirecting to /');
    redirect('/');
  }

  console.log(`Redirecting to final destination: ${originalUrl}`);
  redirect(originalUrl);
}