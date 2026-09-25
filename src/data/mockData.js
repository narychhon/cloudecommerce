/**
 * @typedef {import('../types/dataTypes.js').Brand} Brand
 * @typedef {import('../types/dataTypes.js').Category} Category
 * @typedef {import('../types/dataTypes.js').Image} Image
 * @typedef {import('../types/dataTypes.js').Product} Product
 * @typedef {import('../types/dataTypes.js').Promotion} Promotion
 * @typedef {import('../types/dataTypes.js').Stock} Stock
 */

/** @param {number} count @returns {Stock} */
function stockFor(count) {
  return {
    count,
    status: count === 0 ? 'out-of-stock' : count < 10 ? 'low-stock' : 'in-stock',
  };
}

/** @param {string} id @param {string} src @param {string} alt @param {Image['role']} role @returns {Image} */
function image(id, src, alt, role) {
  return { id, src, alt, role };
}

/** @type {Category[]} */
export const categories = [
  { id: 'headphones', slug: 'headphones', name: 'Headphones', image: image('category-headphones', '/assets/cat-tech.png', 'Headphones and audio', 'category'), tone: 'blue' },
  { id: 'furniture', slug: 'furniture', name: 'Furniture', image: image('category-furniture', '/assets/cat-furniture.png', 'Furniture', 'category'), tone: 'mint' },
  { id: 'hand-bag', slug: 'hand-bag', name: 'Hand Bag', image: image('category-hand-bag', '/assets/cat-bag.png', 'Hand bags', 'category'), tone: 'apricot' },
  { id: 'books', slug: 'books', name: 'Books', image: image('category-books', '/assets/cat-books.png', 'Books', 'category'), tone: 'berry' },
  { id: 'tech', slug: 'tech', name: 'Tech', image: image('category-tech', '/assets/cat-tech.png', 'Technology', 'category'), tone: 'green' },
  { id: 'sneakers', slug: 'sneakers', name: 'Sneakers', image: image('category-sneakers', '/assets/cat-sneakers.png', 'Sneakers', 'category'), tone: 'rose' },
  { id: 'travel', slug: 'travel', name: 'Travel', image: image('category-travel', '/assets/cat-travel.png', 'Travel essentials', 'category'), tone: 'gold' },
];

/** @type {Brand[]} */
export const brands = [
  { id: 'shopcart-audio', slug: 'shopcart-audio', name: 'Shopcart Audio' },
  { id: 'apple', slug: 'apple', name: 'Apple' },
  { id: 'bose', slug: 'bose', name: 'Bose' },
  { id: 'vivefox', slug: 'vivefox', name: 'VIVEFOX' },
  { id: 'jbl', slug: 'jbl', name: 'JBL' },
  { id: 'tagry', slug: 'tagry', name: 'TAGRY' },
  { id: 'monster', slug: 'monster', name: 'Monster' },
  { id: 'mpow', slug: 'mpow', name: 'Mpow' },
  { id: 'fujifilm', slug: 'fujifilm', name: 'Fujifilm' },
  { id: 'pendleton', slug: 'pendleton', name: 'Pendleton' },
  { id: 'shopcart-home', slug: 'shopcart-home', name: 'Shopcart Home' },
  { id: 'shopcart-style', slug: 'shopcart-style', name: 'Shopcart Style' },
  { id: 'chronicle-books', slug: 'chronicle-books', name: 'Chronicle Books' },
  { id: 'adidas', slug: 'adidas', name: 'Adidas' },
];

/**
 * @typedef {Object} ProductSeed
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} categoryId
 * @property {string} brandId
 * @property {number} price
 * @property {number} oldPrice
 * @property {string} description
 * @property {string} image
 * @property {string} tag
 * @property {string[]} colors
 * @property {number} rating
 * @property {number} reviewCount
 * @property {number} stockCount
 * @property {Record<string, string|number|boolean>} specifications
 */

/** @param {ProductSeed} seed @returns {Product} */
function createProduct(seed) {
  const { colors, stockCount } = seed;
  const baseStock = Math.floor(stockCount / colors.length);
  const remainder = stockCount % colors.length;

  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    categoryId: seed.categoryId,
    brandId: seed.brandId,
    price: { amount: seed.price, currency: 'USD' },
    oldPrice: { amount: seed.oldPrice, currency: 'USD' },
    tag: seed.tag,
    color: colors[0],
    colors: [...colors],
    rating: { average: seed.rating, count: seed.reviewCount },
    images: [image(`${seed.id}-primary`, `/assets/${seed.image}`, seed.name, 'primary')],
    variants: colors.map((color, index) => ({
      id: `${seed.id}-${color}`,
      sku: `SC-${seed.id.toUpperCase()}-${color.toUpperCase()}`,
      color,
      stock: stockFor(baseStock + (index < remainder ? 1 : 0)),
    })),
    stock: stockFor(stockCount),
    specifications: seed.specifications,
  };
}

/** @type {Product[]} */
export const products = [
  createProduct({ id: 'earbuds', slug: 'wireless-earbuds-ipx8', name: 'Wireless Earbuds, IPX8', categoryId: 'headphones', brandId: 'shopcart-audio', price: 89, oldPrice: 119, description: 'Premium bone conduction open ear Bluetooth earbuds.', image: 'product-headphones.png', tag: 'BEST SELLER', colors: ['black', 'blue', 'white'], rating: 4.9, reviewCount: 121, stockCount: 42, specifications: { connectivity: 'Bluetooth 5.3', waterResistance: 'IPX8', batteryLife: '8 hours', fit: 'Open ear' } }),
  createProduct({ id: 'airpods', slug: 'airpods-max', name: 'AirPods Max', categoryId: 'headphones', brandId: 'apple', price: 559, oldPrice: 629, description: 'A perfect balance of high-fidelity audio, effortless magic, and deep comfort.', image: 'product-airpods.png', tag: 'POPULAR', colors: ['pink', 'black', 'blue', 'silver', 'green'], rating: 4.9, reviewCount: 384, stockCount: 18, specifications: { connectivity: 'Bluetooth', noiseControl: 'Active noise cancellation', batteryLife: '20 hours', weight: '385 g' } }),
  createProduct({ id: 'bose', slug: 'bose-bt-earphones', name: 'Bose BT Earphones', categoryId: 'headphones', brandId: 'bose', price: 289, oldPrice: 349, description: 'Rich sound with noise cancellation for focused listening.', image: 'product-headphones.png', tag: '', colors: ['black', 'white'], rating: 4.8, reviewCount: 209, stockCount: 28, specifications: { connectivity: 'Bluetooth', noiseControl: 'Noise cancellation', microphone: true, batteryLife: '18 hours' } }),
  createProduct({ id: 'vivefox', slug: 'vivefox-headphones', name: 'VIVEFOX Headphones', categoryId: 'headphones', brandId: 'vivefox', price: 39, oldPrice: 59, description: 'Wireless stereo headphones with a built-in microphone.', image: 'product-airpods.png', tag: 'NEW', colors: ['red', 'black', 'blue'], rating: 4.8, reviewCount: 87, stockCount: 60, specifications: { connectivity: 'Bluetooth', microphone: true, batteryLife: '12 hours', fit: 'Over-ear' } }),
  createProduct({ id: 'jbl', slug: 'jbl-tune-600btnc', name: 'JBL Tune 600BTNC', categoryId: 'headphones', brandId: 'jbl', price: 79, oldPrice: 99, description: 'Lightweight sound made to move with you.', image: 'product-headphones.png', tag: '', colors: ['blue', 'black', 'white'], rating: 4.7, reviewCount: 164, stockCount: 31, specifications: { connectivity: 'Bluetooth', noiseControl: 'Active noise cancellation', batteryLife: '12 hours', fit: 'On-ear' } }),
  createProduct({ id: 'tagry', slug: 'tagry-bluetooth-earbuds', name: 'TAGRY Bluetooth', categoryId: 'headphones', brandId: 'tagry', price: 59, oldPrice: 89, description: 'All-day battery life with a comfortable fit.', image: 'product-headphones.png', tag: 'SALE', colors: ['black', 'green'], rating: 4.7, reviewCount: 143, stockCount: 47, specifications: { connectivity: 'Bluetooth 5.0', waterResistance: 'IPX5', batteryLife: '10 hours', fit: 'In-ear' } }),
  createProduct({ id: 'monster', slug: 'monster-n-flex', name: 'Monster N-Flex', categoryId: 'headphones', brandId: 'monster', price: 99, oldPrice: 139, description: 'Flexible active noise-cancelling Bluetooth headphones.', image: 'product-airpods.png', tag: '', colors: ['green', 'black', 'pink'], rating: 4.6, reviewCount: 76, stockCount: 16, specifications: { connectivity: 'Bluetooth', noiseControl: 'Active noise cancellation', batteryLife: '22 hours', fit: 'Over-ear' } }),
  createProduct({ id: 'mpow', slug: 'mpow-ch6', name: 'Mpow CH6', categoryId: 'headphones', brandId: 'mpow', price: 36, oldPrice: 49, description: 'Comfort-first headphones made for kids.', image: 'product-headphones.png', tag: '', colors: ['red', 'blue'], rating: 4.7, reviewCount: 98, stockCount: 73, specifications: { connectivity: 'Wired', microphone: true, cableLength: '1.2 m', fit: 'On-ear' } }),
  createProduct({ id: 'homepod', slug: 'homepod-mini', name: 'HomePod mini', categoryId: 'tech', brandId: 'apple', price: 99, oldPrice: 129, description: 'Room-filling sound in a small package.', image: 'product-homepod.png', tag: 'TOP PICK', colors: ['white', 'blue', 'yellow'], rating: 4.8, reviewCount: 251, stockCount: 24, specifications: { connectivity: 'Wi-Fi, Bluetooth', voiceAssistant: 'Siri', power: 'AC powered', height: '3.3 in' } }),
  createProduct({ id: 'instax', slug: 'instax-mini-9', name: 'Instax Mini 9', categoryId: 'tech', brandId: 'fujifilm', price: 99, oldPrice: 119, description: 'Instant photos, ready to keep and share.', image: 'product-camera.png', tag: '', colors: ['blue', 'pink', 'yellow'], rating: 4.7, reviewCount: 136, stockCount: 38, specifications: { cameraType: 'Instant film', filmFormat: 'Instax Mini', flash: 'Built-in', power: '2 AA batteries' } }),
  createProduct({ id: 'macbook', slug: 'macbook-pro-13', name: 'MacBook Pro 13”', categoryId: 'tech', brandId: 'apple', price: 1099, oldPrice: 1299, description: '13-inch laptop with 256 GB storage, an 8-core GPU, and 8 GB memory.', image: 'product-macbook.png', tag: 'SAVE $200', colors: ['silver', 'blue'], rating: 4.9, reviewCount: 312, stockCount: 12, specifications: { storage: '256 GB', memory: '8 GB', graphics: '8-core GPU', display: '13-inch Retina' } }),
  createProduct({ id: 'bottle', slug: 'pendleton-water-bottle', name: 'Pendleton Water Bottle', categoryId: 'travel', brandId: 'pendleton', price: 89, oldPrice: 109, description: 'Stainless steel, food safe, and easy to hand wash.', image: 'product-bottle.png', tag: '', colors: ['yellow', 'blue'], rating: 4.6, reviewCount: 63, stockCount: 35, specifications: { material: 'Stainless steel', capacity: '24 oz', insulation: 'Double wall', care: 'Hand wash' } }),
  createProduct({ id: 'sofa', slug: 'modern-sofa', name: 'Modern Sofa', categoryId: 'furniture', brandId: 'shopcart-home', price: 799, oldPrice: 999, description: 'A comfortable place to land, made for everyday living.', image: 'product-sofa.png', tag: 'SAVE $200', colors: ['green', 'blue'], rating: 4.8, reviewCount: 45, stockCount: 8, specifications: { material: 'Performance fabric', seating: '3 seats', assembly: 'Required', frame: 'Hardwood' } }),
  createProduct({ id: 'tote', slug: 'tote-e-medium', name: 'Tote e Medium', categoryId: 'hand-bag', brandId: 'shopcart-style', price: 239, oldPrice: 279, description: 'Canvas, full-grain leather, and thoughtful details.', image: 'product-tote.png', tag: '', colors: ['tan', 'black'], rating: 4.7, reviewCount: 58, stockCount: 17, specifications: { material: 'Canvas and full-grain leather', size: 'Medium', closure: 'Open top', pockets: 3 } }),
  createProduct({ id: 'book', slug: 'the-design-book', name: 'The Design Book', categoryId: 'books', brandId: 'chronicle-books', price: 28, oldPrice: 34, description: 'Fresh ideas for creative spaces and everyday life.', image: 'product-book.png', tag: '', colors: ['red'], rating: 4.6, reviewCount: 102, stockCount: 52, specifications: { format: 'Hardcover', language: 'English', pages: 256, subject: 'Design and interiors' } }),
  createProduct({ id: 'sneakers', slug: 'adidas-court-sneakers', name: 'Adidas Court Sneakers', categoryId: 'sneakers', brandId: 'adidas', price: 89, oldPrice: 110, description: 'A classic court look with a soft, easy fit.', image: 'product-sneakers.png', tag: 'BEST SELLER', colors: ['white', 'blue'], rating: 4.8, reviewCount: 119, stockCount: 26, specifications: { upper: 'Synthetic leather', sole: 'Rubber', closure: 'Lace-up', fit: 'Regular' } }),
];

/** @type {Promotion[]} */
export const heroPromotions = [
  {
    id: 'weekend-audio-special',
    slug: 'weekend-audio-special',
    eyebrow: 'WEEKEND SPECIAL',
    title: 'Grab up to 50% off on selected headphones',
    description: 'Big sound, little prices. Find the pair that feels made for you.',
    discountPercent: 50,
    image: image('promotion-audio', '/assets/product-airpods.png', 'Pink over-ear headphones', 'promotion'),
    ctaLabel: 'Shop headphones',
    categoryId: 'headphones',
  },
  {
    id: 'little-joys-at-home',
    slug: 'little-joys-at-home',
    eyebrow: 'HOME REFRESH',
    title: 'Make room for a little more comfort',
    description: 'Thoughtful pieces to make your everyday spaces feel like home.',
    discountPercent: 20,
    image: image('promotion-home', '/assets/product-sofa.png', 'Modern green sofa', 'promotion'),
    ctaLabel: 'Explore home',
    categoryId: 'furniture',
  },
  {
    id: 'smarter-everyday-tech',
    slug: 'smarter-everyday-tech',
    eyebrow: 'TECH PICKS',
    title: 'Find your next everyday essential',
    description: 'Reliable tech, considered details, and prices worth a closer look.',
    discountPercent: 15,
    image: image('promotion-tech', '/assets/product-macbook.png', 'Silver laptop', 'promotion'),
    ctaLabel: 'Shop technology',
    categoryId: 'tech',
  },
];
