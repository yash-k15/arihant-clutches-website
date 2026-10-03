import { Helmet } from 'react-helmet-async';

const Meta = ({
  title = 'Arihant Clutches',
  description = 'Discover elegant clutches and handbags from Arihant Clutches. Shop the latest collection of handcrafted, stylish and premium clutches.',
  keywords = 'clutches, purses, handbags, clutch bags, Arihant Clutches',
  canonical,
  image,
  noindex = false,
}) => {
  const siteUrl = 'https://arihantclutches.com';
  const canonicalUrl = canonical || siteUrl;
  const imageUrl = image || 'https://arihantclutches.com/social-image.jpg';

  return (
    <Helmet>
      {noindex && <meta name='robots' content='noindex, follow' />}

      {/* Basic SEO */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      {/* Canonical URL */}
      <link rel='canonical' href={canonicalUrl} />

      {/* Open Graph */}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={canonicalUrl} />
      <meta property='og:type' content='website' />
      <meta property='og:image' content={imageUrl} />
      <meta property='og:site_name' content='Arihant Clutches' />

      {/* Twitter / X */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={imageUrl} />
    </Helmet>
  );
};

export default Meta;
