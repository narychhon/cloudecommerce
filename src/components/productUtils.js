function amount(value) {
  return Number(value?.amount ?? value ?? 0);
}

export function getProductName(product) {
  return product?.name ?? '';
}

export function getProductPrice(product) {
  return amount(product?.price);
}

export function getProductOldPrice(product) {
  return amount(product?.oldPrice ?? product?.old);
}

export function getProductImage(product) {
  const image = product?.images?.[0]?.src ?? product?.image ?? '';
  if (!image || image.startsWith('/') || /^(https?:|data:)/i.test(image)) return image;
  return `/assets/${image}`;
}

export function getProductColors(product) {
  if (Array.isArray(product?.colors)) return product.colors;
  return product?.color ? [product.color] : [];
}

export function getProductRating(product) {
  return Number(product?.rating?.average ?? product?.rating ?? 0);
}

export function getProductRatingCount(product) {
  return Number(product?.rating?.count ?? product?.reviewCount ?? 0);
}

export function getProductDescription(product) {
  return product?.description ?? product?.desc ?? '';
}

export function getProductCategory(product) {
  return product?.category ?? product?.categoryId ?? '';
}

export function getDiscountPercent(product) {
  const price = getProductPrice(product);
  const oldPrice = getProductOldPrice(product);
  if (oldPrice <= price || oldPrice <= 0) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
}
