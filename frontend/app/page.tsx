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
    type: "all-types",        // Виправлено: замість ""
    series: "all-series",     // Виправлено: замість ""
    priceRange: [0, 1000],
    powerRange: [0, 12000],
    attribute: "all-attributes", // Виправлено: замість ""
    sortBy: "name-asc",
  })

  // Стан пагінації
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 30

  // Використовуємо реальні дані з API з пагінацією
  const { cards: apiCards, loading, error, totalCount } = useCards({
    search: filters.search || undefined,
    colors: filters.color.length > 0 ? filters.color : undefined,
    rarities: filters.rarity.length > 0 ? filters.rarity : undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
    limit: cardsPerPage,
    offset: (currentPage - 1) * cardsPerPage
  })

  // Додаткова фільтрація на фронтенді
  const filteredCards = useMemo(() => {
    if (!apiCards || !Array.isArray(apiCards)) {
      return [];
    }

    let filtered = apiCards.filter(card => {
      if (!card || !card.name) {
        return false;
      }
      return true;
    });

    // Seller search filter
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

    // Type filter - Виправлено: додана перевірка на нові значення
    if (filters.type && filters.type !== "all-types" && filters.type !== "") {
      filtered = filtered.filter((card) => card.type === filters.type);
    }

    // Series filter - Виправлено: додана перевірка на нові значення
    if (filters.series && filters.series !== "all-series" && filters.series !== "") {
      filtered = filtered.filter((card) => card.series_name === filters.series);
    }

    // Power range filter
    filtered = filtered.filter((card) => {
      const power = card.power || 0;
      return power >= filters.powerRange[0] && power <= filters.powerRange[1];
    });

    // Attribute filter - Виправлено: додана перевірка на нові значення
    if (filters.attribute && filters.attribute !== "all-attributes" && filters.attribute !== "") {
      filtered = filtered.filter((card) => card.attribute === filters.attribute);
    }

    // Сортування
    filtered.sort((a, b) => {
      if (!a || !b) return 0;

      switch (filters.sortBy) {
        case "name-asc":
          if (!a.name || !b.name) return 0;
          return a.name.localeCompare(b.name);
          
        case "name-desc":
          if (!a.name || !b.name) return 0;
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

  // Функції пагінації
  const totalPages = Math.ceil(totalCount / cardsPerPage);
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Скидаємо на першу сторінку при зміні фільтрів
  };

  // Компонент пагінації
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {/* Попередня сторінка */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Номери сторінок */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-2 rounded-md border ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Наступна сторінка */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    );
  };

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
            <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
          <div className="lg:col-span-3">
            {/* Статус завантаження */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading cards from database...</p>
                </div>
              </div>
            )}

            {/* Помилки */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-red-800 font-semibold mb-2">Connection Error</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <p className="text-sm text-red-600">
                  Make sure your API is running on http://192.168.31.78:5000
                </p>
              </div>
            )}

            {/* Карти */}
            {!loading && !error && (
              <>
                {/* Заголовок з статистикою */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Available Cards ({totalCount.toLocaleString()})
                  </h2>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                      Cards ({cardsPerPage}) - Showing {((currentPage - 1) * cardsPerPage) + 1}-{Math.min(currentPage * cardsPerPage, totalCount)} of {totalCount}
                    </p>
                    <p className="text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                </div>

                <CardGrid cards={filteredCards} />

                {/* Пагінація */}
                <Pagination />
              </>
            )}

            {/* Якщо немає карт */}
            {!loading && !error && apiCards && apiCards.length === 0 && (
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
