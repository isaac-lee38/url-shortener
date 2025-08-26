'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  const params = useParams(); // get dynamic route params

  useEffect(() => {
    const redirect = async () => {
      try {
        if (!params?.code) return;
        console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
        console.log(params.code);

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${params.code}`, {
          method: 'GET',
          redirect: 'follow', // handle redirect manually
        });

        if (res.status === 307) {
          const redirectUrl = res.headers.get('location');
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            throw new Error('No redirect URL returned from backend.');
          }
        } else {
          throw new Error('Short URL not found.');
        }
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Unknown error occurred.');
        router.push('/');
      }
    };

    redirect();
  }, [params?.code, router]);

  return <div>Redirecting...</div>;
}
