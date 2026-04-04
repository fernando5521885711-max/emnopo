import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'


import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Application Name',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  // Inline script to redirect identity token hashes to /login before React hydrates
  const identityRedirectScript = `
    (function() {
      var h = window.location.hash;
      if (h && window.location.pathname === '/' &&
          (h.indexOf('invite_token=') !== -1 ||
           h.indexOf('recovery_token=') !== -1 ||
           h.indexOf('confirmation_token=') !== -1 ||
           h.indexOf('access_token=') !== -1)) {
        window.location.replace('/login' + h);
      }
    })();
  `;

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: identityRedirectScript }} />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
