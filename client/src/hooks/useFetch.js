import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Custom hook for data fetching with loading, error, and refresh states.
 * @param {string} url - API endpoint to fetch
 * @param {Object} options - { immediate: boolean, params: Object }
 * @returns {{ data, loading, error, refetch }}
 */
const useFetch = (url, { immediate = true, params = {} } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (overrideParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(url, {
        params: { ...params, ...overrideParams },
      });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Network error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params)]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
