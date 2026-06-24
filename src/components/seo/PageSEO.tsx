import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: object;
}

const BASE_URL = 'https://www.hoplalok.fr';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

export function PageSEO({ title, description, path, image = DEFAULT_IMAGE, jsonLd }: PageSEOProps) {
  const url = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Hoplalo'K`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
