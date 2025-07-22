'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient, convertApiCardToCard } from '@/lib/api';
import type { Card } from '@/lib/types';

interface UseCardsParams {
  page?: number;
  limit?: number;
  search?: string;
  colors?: string[];
  rarities?: string[];
  minPrice?: number;
  maxPrice?: number;
  autoFetch?: boolean;
}

interface UseCardsReturn {
  cards: Card[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
}

export function useCards(params: UseCardsParams = {}): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getCards(params);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const convertedCards = response.data.data.map(convertApiCardToCard);
        setCards(convertedCards);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.autoFetch !== false) {
      fetchCards();
    }
  }, [
    params.page,
    params.limit,
    params.search,
    JSON.stringify(params.colors),
    JSON.stringify(params.rarities),
    params.minPrice,
    params.maxPrice
  ]);

  return {
    cards,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    refetch: fetchCards
  };
}

export function useFeaturedCards(limit: number = 10) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCards = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getFeaturedCards(limit);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          const convertedCards = response.data.map(convertApiCardToCard);
          setCards(convertedCards);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured cards');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCards();
  }, [limit]);

  return { cards, loading, error };
}
