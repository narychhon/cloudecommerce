/**
 * Monetary value in a specific currency.
 * @typedef {Object} Price
 * @property {number} amount
 * @property {string} currency
 */

/**
 * Available inventory for a product or variant.
 * @typedef {Object} Stock
 * @property {number} count
 * @property {'in-stock'|'low-stock'|'out-of-stock'} status
 */

/**
 * Image asset used by catalog and promotion records.
 * @typedef {Object} Image
 * @property {string} id
 * @property {string} src
 * @property {string} alt
 * @property {'primary'|'gallery'|'category'|'promotion'} [role]
 */

/**
 * A purchasable product option, such as a color.
 * @typedef {Object} Variant
 * @property {string} id
 * @property {string} sku
 * @property {string} color
 * @property {Stock} stock
 */

/**
 * Normalized product rating summary.
 * @typedef {Object} Rating
 * @property {number} average
 * @property {number} count
 */

/**
 * Normalized catalog category.
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {Image} image
 * @property {string} tone
 */

/**
 * Catalog brand used to group products.
 * @typedef {Object} Brand
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 */

/**
 * Product catalog record. Category and brand values reference normalized IDs.
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} description
 * @property {string} categoryId
 * @property {string} brandId
 * @property {Price} price
 * @property {Price} oldPrice
 * @property {string} tag
 * @property {string} color
 * @property {string[]} colors
 * @property {Rating} rating
 * @property {Image[]} images
 * @property {Variant[]} variants
 * @property {Stock} stock
 * @property {Record<string, string|number|boolean>} specifications
 */

/**
 * Hero campaign shown in the storefront promotion area.
 * @typedef {Object} Promotion
 * @property {string} id
 * @property {string} slug
 * @property {string} eyebrow
 * @property {string} title
 * @property {string} description
 * @property {number} discountPercent
 * @property {Image} image
 * @property {string} ctaLabel
 * @property {string} categoryId
 */

/**
 * Single normalized filter choice.
 * @typedef {Object} FilterOption
 * @property {string} id
 * @property {string} label
 * @property {string|number|boolean} value
 * @property {number} [count]
 */

/**
 * Selected product-list filters.
 * @typedef {Object} ProductFilters
 * @property {string|null} categoryId
 * @property {{min: number|null, max: number|null}} priceRange
 * @property {string[]} colors
 * @property {string[]} brandIds
 * @property {number|null} minimumRating
 * @property {boolean} onSale
 */

export {};
