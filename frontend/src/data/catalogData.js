export const categories = ['Dried fruits', 'Vegetables & herbs', 'Spices & spice mixes', 'Grains & rice', 'Pantry staples'];
export const sellers = ['Serendib Spice House', 'Ruhunu Harvest'];

export const products = [
  { id: 'cinnamon', name: 'Ceylon cinnamon quills', price: 8, pack: '100 g', seller: sellers[0], origin: 'MATALE', category: categories[2], image: 'imgEditorialPhotograph.png' },
  { id: 'mango', name: 'Sun-dried mango', price: 7.5, pack: '150 g', seller: sellers[1], origin: 'HAMBANTOTA', category: categories[0], image: 'imgEditorialPhotograph1.png' },
  { id: 'curry', name: 'Roasted curry powder', price: 6, pack: '100 g', seller: sellers[0], origin: 'MATALE', category: categories[2], image: 'imgEditorialPhotograph2.png' },
  { id: 'rice', name: 'Traditional red rice', price: 5.5, pack: '1 kg', seller: sellers[1], origin: 'HAMBANTOTA', category: categories[3], image: 'imgEditorialPhotograph3.png' },
  { id: 'leaves', name: 'Dried curry leaves', price: 3.5, pack: '40 g', seller: sellers[0], origin: 'MATALE', category: categories[1], image: 'imgEditorialPhotograph4.png' },
  { id: 'coconut', name: 'Desiccated coconut', price: 4.5, pack: '250 g', seller: sellers[1], origin: 'HAMBANTOTA', category: categories[4], image: 'imgEditorialPhotograph5.png' },
];

export function filterProducts({ query = '', categories: selectedCategories = [], sellers: selectedSellers = [], maxPrice = 8, sort = 'featured' }) {
  const term = query.trim().toLowerCase();
  const result = products.filter(product =>
    (!selectedCategories.length || selectedCategories.includes(product.category)) &&
    (!selectedSellers.length || selectedSellers.includes(product.seller)) &&
    product.price <= maxPrice &&
    `${product.name} ${product.category} ${product.seller} ${product.origin}`.toLowerCase().includes(term));
  if (sort === 'price-low') result.sort((a, b) => a.price - b.price);
  if (sort === 'price-high') result.sort((a, b) => b.price - a.price);
  if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
