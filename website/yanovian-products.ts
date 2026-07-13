import {
  pagesSiteUrl,
  SITE_REPO_PATH,
  YANOVIAN_LLC_URL,
} from './site-meta';

export const YANOVIAN_PROJECTS_URL = `${YANOVIAN_LLC_URL}/projects`;

export type YanovianProductId = 'tabby' | 'why-am-i-here' | 'breadcrumb';

export type YanovianProduct = {
  id: YanovianProductId;
  name: string;
  url: string;
  iconUrl: string;
  descKey:
    | 'relatedTabbyDesc'
    | 'relatedWhyAmIHereDesc'
    | 'relatedBreadcrumbDesc';
};

/** Which product this marketing site is for. Sibling links exclude this id. */
export const SITE_PRODUCT_ID: YanovianProductId = 'why-am-i-here';

const PAGES_ICON = 'icon-48.png';

const PAGES_REPO_BY_ID: Record<YanovianProductId, string> = {
  tabby: 'chrome-ext-tabby',
  'why-am-i-here': SITE_REPO_PATH,
  breadcrumb: 'chrome-ext-breadcrumb',
};

function yanovianProduct(
  id: YanovianProductId,
  name: string,
  descKey: YanovianProduct['descKey'],
): YanovianProduct {
  const pagesRepo = PAGES_REPO_BY_ID[id];
  return {
    id,
    name,
    url: pagesSiteUrl(pagesRepo),
    iconUrl: pagesSiteUrl(pagesRepo, PAGES_ICON),
    descKey,
  };
}

export const YANOVIAN_PRODUCTS: YanovianProduct[] = [
  yanovianProduct('tabby', 'Tabby', 'relatedTabbyDesc'),
  yanovianProduct('why-am-i-here', 'Why Am I Here?', 'relatedWhyAmIHereDesc'),
  yanovianProduct('breadcrumb', 'Breadcrumb', 'relatedBreadcrumbDesc'),
];

export function yanovianSiblingProducts(): YanovianProduct[] {
  return YANOVIAN_PRODUCTS.filter((product) => product.id !== SITE_PRODUCT_ID);
}
