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
    console.log('🚀 Starting fetchCards with params:', params);
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getCards(params);
      console.log('📡 API response:', response);
      
      if (response.error) {
        console.error('❌ API returned error:', response.error);
        setError(response.error);
      } else if (response.data) {
        console.log('✅ API response.data:', response.data);
        console.log('📊 Total count:', response.data.totalCount);
        console.log('📋 First card from API:', response.data.data[0]);
        console.log('🔢 Cards count:', response.data.data.length);
        
        // ПЕРЕВІРКА ЧИ ІСНУЄ МАСИВ ДАНИХ
        if (!response.data.data || !Array.isArray(response.data.data)) {
          console.error('❌ response.data.data is not an array:', response.data.data);
          setError('Invalid data format from API');
          return;
        }
        
        // ПЕРЕВІРКА ПЕРШОЇ КАРТИ (з правильними назвами полів PascalCase)
        if (response.data.data.length > 0) {
          const firstCard = response.data.data[0];
          console.log('🔍 Analyzing first card:', firstCard.Name);
          console.log('🔍 First card colors:', firstCard.Colors);
          console.log('🔍 First card listings:', firstCard.Listings);
        }
        
        console.log('🔄 Starting conversion...');
        const convertedCards = response.data.data.map((card, index) => {
          console.log(`🔧 Converting card ${index + 1}/${response.data.data.length}: ${card.Name}`);
          return convertApiCardToCard(card);
        });
        console.log('✅ Conversion completed, converted cards:', convertedCards.length);
        
        setCards(convertedCards);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.page);
        
        console.log('🎉 State updated successfully');
      } else {
        console.error('❌ No data and no error in response:', response);
        setError('No data received from API');
      }
    } catch (err) {
      console.error('💥 Exception in fetchCards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
      console.log('🏁 fetchCards completed');
    }
  };

  useEffect(() => {
    console.log('⚡ useEffect triggered, autoFetch:', params.autoFetch);
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
      console.log('🌟 Starting fetchFeaturedCards with limit:', limit);
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.getFeaturedCards(limit);
        console.log('📡 Featured cards response:', response);
        
        if (response.error) {
          console.error('❌ Featured cards error:', response.error);
          setError(response.error);
        } else if (response.data) {
          console.log('✅ Featured cards data:', response.data);
          
          // ПЕРЕВІРКА ДАНИХ
          if (!Array.isArray(response.data)) {
            console.error('❌ Featured cards data is not an array:', response.data);
            setError('Invalid featured cards data format');
            return;
          }
          
          console.log('🔄 Converting featured cards...');
          const convertedCards = response.data.map((card, index) => {
            console.log(`🔧 Converting featured card ${index + 1}: ${card.Name}`);
            return convertApiCardToCard(card);
          });
          console.log('✅ Featured cards converted:', convertedCards.length);
          
          setCards(convertedCards);
        } else {
          console.error('❌ No featured cards data:', response);
          setError('No featured cards data received');
        }
      } catch (err) {
        console.error('💥 Exception in fetchFeaturedCards:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch featured cards');
      } finally {
        setLoading(false);
        console.log('🏁 fetchFeaturedCards completed');
      }
    };

    fetchFeaturedCards();
  }, [limit]);

  return { cards, loading, error };
}
