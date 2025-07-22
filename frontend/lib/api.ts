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

export interface ApiCard {
  productId: string;
  baseCardId: string;
  name: string;
  cardTypeDetail?: string;
  effect?: string;
  power?: number;
  cost?: number;
  life?: number;
  counter?: number;
  attribute?: string;
  rarity?: string;
  setCode?: string;
  artist?: string;
  imageUrl?: string;
  language: string;
  isAlternateArt: boolean;
  seriesName?: string;
  colors: ApiCardColor[];
  listings: ApiListing[];
  minPrice?: number;
  listingCount?: number;
}

export interface ApiCardColor {
  code: string;
  name: string;
  hexColor?: string;
  isPrimary: boolean;
}

export interface ApiListing {
  id: string;
  conditionCode: string;
  conditionName: string;
  price: number;
  quantity: number;
  description?: string;
  sellerUsername: string;
  sellerRating: number;
  isVerifiedSeller: boolean;
  createdAt: string;
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
      console.log('API Request:', url);

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
      console.log('API Response:', data);
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
    search?: string;
    colors?: string[];
    rarities?: string[];
    minPrice?: number;
    maxPrice?: number;
  } = {}): Promise<ApiResponse<CardsApiResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
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
  const primaryColor = apiCard.colors.find(c => c.isPrimary) || apiCard.colors[0];
  
  return {
    id: apiCard.baseCardId,
    name: apiCard.name,
    rarity: apiCard.rarity || 'C',
    type: apiCard.cardTypeDetail || 'CHARACTER',
    attribute: apiCard.attribute || '',
    power: apiCard.power || 0,
    counter: apiCard.counter || 0,
    color: primaryColor?.name || 'Red',
    card_type: apiCard.cardTypeDetail || '',
    effect: apiCard.effect || '',
    image_url: apiCard.imageUrl || '/placeholder.svg?height=838&width=600',
    alternate_art: apiCard.isAlternateArt,
    series_id: apiCard.setCode || '',
    series_name: apiCard.seriesName || '',
    market_price: apiCard.minPrice || 0,
    listings: apiCard.listings.map(listing => ({
      seller: listing.sellerUsername,
      condition: listing.conditionName,
      price: listing.price,
      quantity: listing.quantity
    }))
  };
}
