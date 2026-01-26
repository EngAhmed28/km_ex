// Utility functions for customer discounts

export interface CustomerDiscount {
  id: number;
  customer_id: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

/**
 * Calculate discounted price for a product
 * @param originalPrice - Original product price
 * @param discount - Customer discount object
 * @returns Discounted price
 */
export const calculateDiscountedPrice = (originalPrice: number, discount: CustomerDiscount | null): number => {
  if (!discount) return originalPrice;
  
  // Check if discount is active
  if (!discount.is_active) return originalPrice;
  
  // Check if current date is within discount period
  const now = new Date();
  const startDate = new Date(discount.start_date);
  const endDate = new Date(discount.end_date);
  
  // Set time to start of day for comparison
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);
  
  if (now < startDate || now > endDate) {
    return originalPrice;
  }
  
  // Calculate discounted price
  const discountAmount = (originalPrice * discount.discount_percentage) / 100;
  const discountedPrice = originalPrice - discountAmount;
  
  return Math.max(0, discountedPrice); // Ensure price is not negative
};

/**
 * Check if discount is currently active
 */
export const isDiscountActive = (discount: CustomerDiscount | null): boolean => {
  if (!discount || !discount.is_active) return false;
  
  const now = new Date();
  const startDate = new Date(discount.start_date);
  const endDate = new Date(discount.end_date);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);
  
  return now >= startDate && now <= endDate;
};
