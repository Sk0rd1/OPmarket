// API клієнт для підключення до ASP.NET backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API_BASE_URL:', API_BASE_URL);

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

// ОНОВЛЕНІ ІНТЕРФЕЙСИ ДЛЯ PASCALCASE (як повертає ASP.NET)
export interface ApiCard {
  ProductId: string;          // було: productId
  BaseCardId: string;         // було: baseCardId
  Name: string;               // було: name
  CardTypeDetail?: string;    // було: cardTypeDetail
  Effect?: string;            // було: effect
  Power?: number;             // було: power
  Cost?: number;              // було: cost
  Life?: number;              // було: life
  Counter?: number;           // було: counter
  Attribute?: string;         // було: attribute
  Rarity?: string;            // було: rarity
  SetCode?: string;           // було: setCode
  Artist?: string;            // було: artist
  ImageUrl?: string;          // було: imageUrl
  Language: string;           // було: language
  IsAlternateArt: boolean;    // було: isAlternateArt
  SeriesName?: string;        // було: seriesName
  Colors: ApiCardColor[];     // було: colors
  Listings: ApiListing[];     // було: listings
  MinPrice?: number;          // було: minPrice
  ListingCount?: number;      // було: listingCount
}

export interface ApiCardColor {
  Code: string;               // було: code
  Name: string;               // було: name
  HexColor?: string;          // було: hexColor
  IsPrimary: boolean;         // було: isPrimary
}

export interface ApiListing {
  Id: string;                 // було: id
  ConditionCode: string;      // було: conditionCode
  ConditionName: string;      // було: conditionName
  Price: number;              // було: price
  Quantity: number;           // було: quantity
  Description?: string;       // було: description
  SellerUsername: string;     // було: sellerUsername
  SellerRating: number;       // було: sellerRating
  IsVerifiedSeller: boolean;  // було: isVerifiedSeller
  CreatedAt: string;          // було: createdAt
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
  console.log('🔧 Converting API card:', apiCard.Name);
  console.log('🎨 Colors:', apiCard.Colors);
  console.log('📋 Listings:', apiCard.Listings);
  
  // ПЕРЕВІРКА НА UNDEFINED (тепер з правильними назвами полів)
  if (!apiCard.Colors) {
    console.error('❌ Colors is undefined for card:', apiCard.Name);
    console.log('Full apiCard:', JSON.stringify(apiCard, null, 2));
    // Створюємо fallback colors
    apiCard.Colors = [{ Code: "Red", Name: "Red", IsPrimary: true }];
  }
  
  if (!apiCard.Listings) {
    console.error('❌ Listings is undefined for card:', apiCard.Name);
    apiCard.Listings = [];
  }
  
  // БЕЗПЕЧНИЙ ПОШУК КОЛЬОРУ (з правильними назвами полів)
  const primaryColor = apiCard.Colors?.find(c => c.IsPrimary) || apiCard.Colors?.[0] || { Name: "Red" };
  
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
    listings: (apiCard.Listings || []).map(listing => ({
      seller: listing.SellerUsername,
      condition: listing.ConditionName,
      price: listing.Price,
      quantity: listing.Quantity
    }))
  };
}
