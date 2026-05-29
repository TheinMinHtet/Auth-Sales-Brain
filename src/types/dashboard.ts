export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in MMK
  description: string;
  stock: number;
  image: string;
}

export interface DeliveryZone {
  township: string;
  rate: number;
  deliveryTime: string; // e.g., "1-2 Days"
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  customerTelegramId: string;
  township: string;
  addressDetails?: string;
  deliveryFee: number;
  paymentMethod: 'cod' | 'prepay';
  totalAmount: number; // product total + deliveryFee
  status: 'pending' | 'verifying' | 'confirmed' | 'completed' | 'cancelled';
  items: OrderItem[];
  paymentDetails?: {
    method: 'KPay' | 'WavePay' | 'CBPay' | 'AYA Pay' | 'CoD';
    transactionId: string;
    screenshotUrl?: string; // base64 encoded or placeholder image
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'bot' | 'owner' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
  interactiveOptions?: string[]; // Quick reply suggestions
  invoiceData?: Order; // Attached invoice helper
  paymentDetailsNeeded?: boolean;
}

export interface ShopConfig {
  shopId?: string;
  publicUrl?: string;
  shopName: string;
  ownerName: string;
  phone: string;
  currency: string;
  telegramBotToken: string;
  telegramBotUsername: string;
  messengerPageAccessToken: string;
  messengerVerifyToken: string;
  messengerBotId: string;
  messengerBotName: string;
  onboardingCompleted: boolean;
}

export interface TelegramSession {
  sessionId: string;
  customerName: string;
  customerPhone: string;
  customerTelegramId: string;
  messages: ChatMessage[];
  lastActive: string;
  currentStep: 'greeting' | 'browsing' | 'ordering' | 'selecting_township' | 'selecting_payment' | 'prepayment_pending' | 'verifying' | 'completed' | 'live_takeover';
  cart: { productId: string; quantity: number }[];
  liveTakeoverActive: boolean;
  activeOrderId?: string;
  tempPayMethod?: string;
}

export interface SystemState {
  config: ShopConfig;
  products: Product[];
  deliveryZones: DeliveryZone[];
  orders: Order[];
  sessions: { [id: string]: TelegramSession };
}
