# Shopcart Strapi CMS Integration Guide

This guide details how to connect the Shopcart storefront to a Strapi v4 / v5 headless CMS backend.

---

## 1. Environment Variables

Store all API configuration in environment variables (`.env.local` or deployment settings). Never hardcode API keys or URLs in application components.

```env
# Strapi API Endpoint
VITE_STRAPI_API_URL=https://api.shopcart.example.com

# Strapi Public / API Token (Bearer Token)
VITE_STRAPI_TOKEN=your_strapi_api_token_here
```

In `src/services/apiConfig.js`, these values are referenced dynamically:
```js
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_STRAPI_API_URL || '',
  token: import.meta.env.VITE_STRAPI_TOKEN || '',
  useMock: !import.meta.env.VITE_STRAPI_API_URL,
};
```

---

## 2. Proposed Strapi Content Types & Schema

### Content Type 1: `Product` (`api::product.product`)
| Field Name | Type | Options / Details |
|---|---|---|
| `name` | String | Required |
| `slug` | UID | Target: `name`, Required, Unique |
| `price` | Decimal | Required |
| `oldPrice` | Decimal | Optional |
| `description` | Text / RichText | Required |
| `tag` | String | e.g. "BEST SELLER", "NEW", "SALE" |
| `color` | String | Primary display color |
| `colors` | JSON / Component | Array of available colors e.g. `["black", "blue", "white"]` |
| `rating` | Decimal | Default `4.8` |
| `reviewCount` | Integer | Default `120` |
| `stock` | Integer | Stock quantity |
| `specifications` | JSON / Component | Key-value pairs for technical specifications |
| `images` | Media (Multiple) | Product gallery images |
| `category` | Relation | `Product` belongs to many/one `Category` |
| `brand` | Relation | `Product` belongs to one `Brand` |

### Content Type 2: `Category` (`api::category.category`)
| Field Name | Type | Options / Details |
|---|---|---|
| `title` | String | Required |
| `slug` | UID | Target: `title`, Required, Unique |
| `tone` | String | Color accent (e.g. `mint`, `apricot`, `berry`, `green`, `rose`, `gold`) |
| `image` | Media (Single) | Category card background image |

### Content Type 3: `Brand` (`api::brand.brand`)
| Field Name | Type | Options / Details |
|---|---|---|
| `name` | String | Required |
| `slug` | UID | Target: `name` |
| `isOfficial` | Boolean | Default `true` |

### Content Type 4: `Promotion` (`api::promotion.promotion`)
| Field Name | Type | Options / Details |
|---|---|---|
| `title` | String | Banner heading |
| `subtitle` | String | Banner copy |
| `discountPercentage` | Integer | e.g. `50` |
| `bannerImage` | Media (Single) | Promo image asset |
| `expiresAt` | DateTime | Promo countdown target |

---

## 3. Media URL Handling

Strapi returns relative paths for uploaded media (e.g. `/uploads/image_123.png`).
The service boundary transforms media URLs into absolute URLs:

```js
export function formatStrapiImageUrl(mediaField) {
  if (!mediaField) return '/assets/product-headphones.png'; // Fallback asset
  const url = typeof mediaField === 'string' ? mediaField : mediaField.data?.attributes?.url;
  if (!url) return '/assets/product-headphones.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_CONFIG.baseUrl}${url}`;
}
```

---

## 4. Switching `catalogService.js` from Mock to Strapi

To switch to live Strapi data:

1. Update `src/services/catalogService.js` to execute fetch queries when `API_CONFIG.useMock` is false:
```js
export async function getProducts(filters = {}) {
  if (API_CONFIG.useMock) {
    return getMockProducts(filters);
  }

  const params = new URLSearchParams();
  params.append('populate', '*');
  if (filters.category) params.append('filters[category][slug][$eq]', filters.category);
  if (filters.search) params.append('filters[name][$containsi]', filters.search);
  if (filters.color) params.append('filters[colors][$containsi]', filters.color);

  const response = await fetch(`${API_CONFIG.baseUrl}/api/products?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${API_CONFIG.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Strapi request failed: ${response.statusText}`);
  const json = await response.json();
  return normalizeStrapiProducts(json.data);
}
```

2. Payment processing remains completely decoupled in `CheckoutPage.jsx` and checkout service layer.

---

## 5. Verification Checklist

- [x] Product, Category, and Promotion data models follow normalized shapes.
- [x] Catalog access uses `catalogService.js` boundary.
- [x] Environment variables support custom Strapi API URL and JWT token.
- [x] Slugs are stable and usable for deep linking (`#product/:slug`).
