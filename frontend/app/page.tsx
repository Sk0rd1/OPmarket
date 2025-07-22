"use client"

import { useState, useMemo } from "react"
import Header from "@/components/header"
import FilterPanel from "@/components/filter-panel"
import CardGrid from "@/components/card-grid"
import { ApiTest } from "@/components/api-test"
import { useCards } from "@/hooks/useCards"
import type { FilterState } from "@/lib/types"

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sellerSearch: "",
    rarity: [],
    color: [],
    type: "",
    series: "",
    priceRange: [0, 1000],
    powerRange: [0, 12000],
    attribute: "",
    sortBy: "name-asc",
  })

  // Використовуємо реальні дані з API
  const { cards: apiCards, loading, error, totalCount } = useCards({
    search: filters.search || undefined,
    colors: filters.color.length > 0 ? filters.color : undefined,
    rarities: filters.rarity.length > 0 ? filters.rarity : undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
    limit: 30
  })

  // Додаткова фільтрація на фронтенді (те що API не підтримує)
  const filteredCards = useMemo(() => {
    // БЕЗПЕЧНА ПЕРЕВІРКА МАСИВУ
    if (!apiCards || !Array.isArray(apiCards)) {
      console.warn('⚠️ apiCards is not an array:', apiCards);
      return [];
    }

    let filtered = apiCards.filter(card => {
      // БАЗОВА ПЕРЕВІРКА НА ІСНУВАННЯ ОБ'ЄКТА ТА ОБОВ'ЯЗКОВИХ ПОЛІВ
      if (!card || !card.name) {
        console.warn('⚠️ Card without name found:', card);
        return false;
      }

      return true;
    });

    // Seller search filter (API не підтримує, робимо на фронтенді)
    if (filters.sellerSearch) {
      filtered = filtered.filter((card) => {
        if (!card.listings || !Array.isArray(card.listings)) {
          return false;
        }
        return card.listings.some((listing) => {
          if (!listing || !listing.seller) {
            return false;
          }
          return listing.seller.toLowerCase().includes(filters.sellerSearch.toLowerCase());
        });
      });
    }

    // Type filter (додаткова фільтрація)
    if (filters.type && filters.type !== "all-types") {
      filtered = filtered.filter((card) => card.type === filters.type);
    }

    // Series filter (додаткова фільтрація)
    if (filters.series && filters.series !== "all-series") {
      filtered = filtered.filter((card) => card.series_name === filters.series);
    }

    // Power range filter (додаткова фільтрація)
    filtered = filtered.filter((card) => {
      const power = card.power || 0;
      return power >= filters.powerRange[0] && power <= filters.powerRange[1];
    });

    // Attribute filter (додаткова фільтрація)
    if (filters.attribute && filters.attribute !== "all-attributes") {
      filtered = filtered.filter((card) => card.attribute === filters.attribute);
    }

    // БЕЗПЕЧНЕ СОРТУВАННЯ
    filtered.sort((a, b) => {
      // ПЕРЕВІРКА НА ІСНУВАННЯ ОСНОВНИХ ПОЛІВ
      if (!a || !b) {
        console.warn('⚠️ Undefined card objects in sort:', a, b);
        return 0;
      }

      switch (filters.sortBy) {
        case "name-asc":
          if (!a.name || !b.name) {
            console.warn('⚠️ Cannot sort cards with undefined names:', a, b);
            return 0;
          }
          return a.name.localeCompare(b.name);
          
        case "name-desc":
          if (!a.name || !b.name) {
            console.warn('⚠️ Cannot sort cards with undefined names:', a, b);
            return 0;
          }
          return b.name.localeCompare(a.name);
          
        case "price-low":
          const priceA = a.market_price || 0;
          const priceB = b.market_price || 0;
          return priceA - priceB;
          
        case "price-high":
          const priceHighA = a.market_price || 0;
          const priceHighB = b.market_price || 0;
          return priceHighB - priceHighA;
          
        case "rarity":
          const rarityOrder = { C: 1, UC: 2, R: 3, SR: 4, SEC: 5, L: 6, P: 7 };
          const rarityA = a.rarity || 'C';
          const rarityB = b.rarity || 'C';
          return (
            (rarityOrder[rarityB as keyof typeof rarityOrder] || 0) -
            (rarityOrder[rarityA as keyof typeof rarityOrder] || 0)
          );
          
        default:
          return 0;
      }
    });

    return filtered;
  }, [apiCards, filters]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* API Status Test (тільки для розробки) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="container mx-auto px-4 py-4">
          <ApiTest />
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>
          <div className="lg:col-span-3">
            {/* Показуємо статус завантаження */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading cards from database...</p>
                </div>
              </div>
            )}

            {/* Показуємо помилки */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <p className="text-sm text-red-600">
                  Make sure your ASP.NET API is running on http://192.168.31.78:5000
                </p>
              </div>
            )}

            {/* Показуємо карти */}
            {!loading && !error && (
              <>
                {/* Заголовок з статистикою */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Available Cards ({totalCount.toLocaleString()})
                  </h2>
                  {filteredCards.length !== apiCards.length && (
                    <p className="text-gray-600">
                      Showing {filteredCards.length} of {apiCards.length} filtered results
                    </p>
                  )}
                </div>

                <CardGrid cards={filteredCards} />
              </>
            )}

            {/* Якщо немає карт */}
            {!loading && !error && apiCards.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found in database</h3>
                <p className="text-gray-600">
                  Make sure your PostgreSQL database has card data.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
