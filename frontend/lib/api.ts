// API клієнт для підключення до ASP.NET backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CardsApiResponse {
  data: ApiCard[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ІНТЕРФЕЙСИ ДЛЯ PASCALCASE (як повертає ASP.NET)
export interface ApiCard {
  ProductId: string;
  BaseCardId: string;
  Name: string;
  CardTypeDetail?: string;
  Effect?: string;
  Power?: number;
  Cost?: number;
  Life?: number;
  Counter?: number;
  Attribute?: string;
  Rarity?: string;
  SetCode?: string;
  Artist?: string;
  ImageUrl?: string;
  Language: string;
  IsAlternateArt: boolean;
  SeriesName?: string;
  Colors: ApiCardColor[];
  Listings: ApiListing[];
  MinPrice?: number;
  ListingCount?: number;
}

export interface ApiCardColor {
  Code: string;
  Name: string;
  HexColor?: string;
  IsPrimary: boolean;
}

export interface ApiListing {
  Id: string;
  ConditionCode: string;
  ConditionName: string;
  Price: number;
  Quantity: number;
  Description?: string;
  SellerUsername: string;
  SellerRating: number;
  IsVerifiedSeller: boolean;
  CreatedAt: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Логуємо тільки у development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request:', url);
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Логуємо тільки у development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response received:', { 
          endpoint, 
          dataCount: Array.isArray(data?.data) ? data.data.length : 'N/A',
          totalCount: data?.totalCount || 'N/A'
        });
      }
      
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown API error' 
      };
    }
  }

  async getCards(params: {
    page?: number;
    limit?: number;
    offset?: number; // Додав підтримку offset
    search?: string;
    colors?: string[];
    rarities?: string[];
    minPrice?: number;
    maxPrice?: number;
  } = {}): Promise<ApiResponse<CardsApiResponse>> {
    const searchParams = new URLSearchParams();
    
    // Конвертуємо offset в page якщо потрібно
    let page = params.page;
    if (params.offset !== undefined && params.limit) {
      page = Math.floor(params.offset / params.limit) + 1;
    }
    
    if (page) searchParams.append('page', page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.colors?.length) {
      params.colors.forEach(color => searchParams.append('colors', color));
    }
    if (params.rarities?.length) {
      params.rarities.forEach(rarity => searchParams.append('rarities', rarity));
    }
    if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());

    const query = searchParams.toString();
    const endpoint = `/cards${query ? `?${query}` : ''}`;
    
    return this.request<CardsApiResponse>(endpoint);
  }

  async getCard(id: string): Promise<ApiResponse<ApiCard>> {
    return this.request<ApiCard>(`/cards/${id}`);
  }

  async getFeaturedCards(limit: number = 10): Promise<ApiResponse<ApiCard[]>> {
    return this.request<ApiCard[]>(`/cards/featured?limit=${limit}`);
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  async testDatabase(): Promise<ApiResponse<any>> {
    return this.request<any>('/test-db');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Функція для конвертації API Card в компонентний Card
export function convertApiCardToCard(apiCard: ApiCard): import('./types').Card {
  // Безпечна перевірка і fallback значення
  const colors = apiCard.Colors || [{ Code: "Red", Name: "Red", IsPrimary: true, HexColor: "#ff0000" }];
  const listings = apiCard.Listings || [];
  const primaryColor = colors.find(c => c.IsPrimary) || colors[0] || { Name: "Red" };
  
  return {
    id: apiCard.BaseCardId,
    name: apiCard.Name,
    rarity: apiCard.Rarity || 'C',
    type: apiCard.CardTypeDetail || 'CHARACTER',
    attribute: apiCard.Attribute || '',
    power: apiCard.Power || 0,
    counter: apiCard.Counter || 0,
    color: primaryColor?.Name || 'Red',
    card_type: apiCard.CardTypeDetail || '',
    effect: apiCard.Effect || '',
    image_url: apiCard.ImageUrl || '/placeholder.svg?height=838&width=600',
    alternate_art: apiCard.IsAlternateArt,
    series_id: apiCard.SetCode || '',
    series_name: apiCard.SeriesName || '',
    market_price: apiCard.MinPrice || 0,
    listings: listings.map(listing => ({
      seller: listing.SellerUsername,
      condition: listing.ConditionName,
      price: listing.Price,
      quantity: listing.Quantity
    }))
  };
}
