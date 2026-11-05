import { useRef, useState } from 'react';
import { filterProducts } from '../data/catalogData';

export default function useCatalog() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategories, setCategories] = useState([]);
  const [selectedSellers, setSellers] = useState([]);
  const [maxPrice, setMaxPrice] = useState(8);
  const [inStock, setInStock] = useState(true);
  const [eligible, setEligible] = useState(true);
  const [sort, setSort] = useState('featured');
  const [notice, setNotice] = useState('');
  const searchInput = useRef(null);
  const visibleProducts = filterProducts({ query, categories: selectedCategories, sellers: selectedSellers, maxPrice, sort });

  function toggle(value, selected, update) {
    update(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  }
  function pending(action) {
    setNotice(`${action}: Backend integration pending. No server action has been completed.`);
  }
  function reset() {
    setCategories([]); setSellers([]); setMaxPrice(8); setInStock(true);
    setEligible(true); setSearch(''); setQuery(''); setSort('featured'); setNotice('');
  }

  return { search, setSearch, setQuery, selectedCategories, setCategories, selectedSellers,
    setSellers, maxPrice, setMaxPrice, inStock, setInStock, eligible, setEligible,
    sort, setSort, notice, setNotice, searchInput, visibleProducts, toggle, pending, reset };
}
