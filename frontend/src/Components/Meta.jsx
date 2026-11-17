import siteConfig from '../config/siteConfig.js';
import { Helmet } from 'react-helmet-async';

const Meta = ({
  title = siteConfig.brand.name,
  description = siteConfig.seo.description,
  keywords = siteConfig.seo.keywords,
  canonical,
  image,
  noindex = false,
}) => {
  const siteUrl = siteConfig.seo.siteUrl;
  const canonicalUrl = canonical || siteUrl;
  const imageUrl = image || siteConfig.seo.socialImage;

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
      <meta property='og:site_name' content={siteConfig.brand.name} />

      {/* Twitter / X */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={imageUrl} />
    </Helmet>
  );
};

export default Meta;
