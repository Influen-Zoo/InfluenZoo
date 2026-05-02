import { useEffect, useState } from 'react';
import api from '../services/api';
import { DEFAULT_CATEGORIES } from '../constants/common';

export default function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await api.getCategories();
        if (active && Array.isArray(data) && data.length) setCategories(data);
      } catch (error) {
        if (active) setCategories(DEFAULT_CATEGORIES);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
}
