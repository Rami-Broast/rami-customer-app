import { OrderType, PaymentMethod } from '../types/backend';
import { ApiClient } from './http';
import { Address, AuthTokens, Branch, CustomerConfig, DeliveryTracking, Menu, Order, Payment, PriceQuote } from './types';

export interface AddressInput {
  label?: string;
  line1: string;
  line2?: string;
  district?: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isDefault?: boolean;
}

/** Cart item as the quote/order endpoints expect it. */
export interface OrderItemInput {
  productId: string;
  quantity: number;
  addonIds?: string[];
}

/**
 * Typed backend endpoints the customer app uses. One method per call, so a
 * screen never assembles a URL or body by hand.
 */
export class Api {
  constructor(private readonly http: ApiClient) {}

  // --- Auth (public) --------------------------------------------------------
  requestOtp(phone: string): Promise<{ expiresInSeconds?: number }> {
    return this.http.request('/auth/customer/otp/request', { method: 'POST', body: { phone }, public: true });
  }

  verifyOtp(phone: string, code: string): Promise<AuthTokens> {
    return this.http.request('/auth/customer/otp/verify', { method: 'POST', body: { phone, code }, public: true });
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.http.request('/auth/refresh', { method: 'POST', body: { refreshToken }, public: true });
  }

  // --- Catalog (public) -----------------------------------------------------
  listBranches(): Promise<Branch[]> {
    // Public customer list. NOT `/branches`, which is the staff route behind
    // `branches:read` and 401s an unauthenticated customer.
    return this.http.request('/customer/branches', { public: true });
  }

  menu(branchId: string): Promise<Menu> {
    return this.http.request(`/branches/${branchId}/menu`, { public: true });
  }

  /** Public app config: branding, feature flags, and the published offers. */
  config(): Promise<CustomerConfig> {
    return this.http.request('/customer/config', { public: true });
  }

  quote(input: {
    branchId: string;
    type: OrderType;
    items: OrderItemInput[];
    couponCode?: string;
  }): Promise<PriceQuote> {
    // Authenticated: `POST /pricing/quote` has no `@Public()`. `public: true`
    // stripped the bearer token and every quote 401'd, even signed in.
    return this.http.request('/pricing/quote', { method: 'POST', body: input });
  }

  // --- Customer orders (authenticated) --------------------------------------
  placeOrder(input: {
    branchId: string;
    type: OrderType;
    paymentMethod: PaymentMethod;
    customerAddressId?: string;
    items: OrderItemInput[];
    couponCode?: string;
    customerNotes?: string;
  }): Promise<Order> {
    return this.http.request('/customer/orders', { method: 'POST', body: input });
  }

  myOrders(): Promise<{ data: Order[] }> {
    return this.http.request('/customer/orders');
  }

  order(id: string): Promise<Order> {
    return this.http.request(`/customer/orders/${id}`);
  }

  cancelOrder(id: string, reason?: string): Promise<Order> {
    return this.http.request(`/customer/orders/${id}/cancel`, { method: 'POST', body: { reason } });
  }

  // --- Addresses (authenticated) --------------------------------------------
  listAddresses(): Promise<Address[]> {
    return this.http.request('/customer/addresses');
  }

  createAddress(input: AddressInput): Promise<Address> {
    return this.http.request('/customer/addresses', { method: 'POST', body: input });
  }

  deleteAddress(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.http.request(`/customer/addresses/${id}`, { method: 'DELETE' });
  }

  // --- Delivery tracking (authenticated) ------------------------------------
  trackDelivery(orderId: string): Promise<DeliveryTracking> {
    return this.http.request(`/customer/orders/${orderId}/delivery`);
  }

  // --- Payment (authenticated) ----------------------------------------------
  initiatePayment(orderId: string, method: PaymentMethod): Promise<{ payment: Payment }> {
    return this.http.request(`/customer/orders/${orderId}/pay`, { method: 'POST', body: { method } });
  }

  paymentFor(orderId: string): Promise<Payment> {
    return this.http.request(`/customer/orders/${orderId}/payment`);
  }
}
