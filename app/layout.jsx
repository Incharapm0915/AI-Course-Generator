import { ClerkProvider } from '@clerk/nextjs';

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      navigate={(to) => window.history.pushState(null, '', to)}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
