import { supabase } from '@/integrations/supabase/client';

interface CreateSaleTransactionParams {
  itemId: string;
  itemType: 'bazaar_sale' | 'auction_sale';
  sellerId: string;
  buyerId: string;
  totalAmount: number;
  commissionRate: number;
}

export const createSaleTransaction = async ({
  itemId,
  itemType,
  sellerId,
  buyerId,
  totalAmount,
  commissionRate,
}: CreateSaleTransactionParams) => {
  try {
    // Get seller's subscription to apply correct commission
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', sellerId)
      .eq('status', 'active')
      .maybeSingle();

    let actualCommissionRate = commissionRate;
    
    // Apply commission based on subscription tier
    if (subscription) {
      switch (subscription.tier) {
        case 'premium':
        case 'business':
          actualCommissionRate = 0; // No commission
          break;
        case 'basic':
          actualCommissionRate = 3; // 3% commission
          break;
        default:
          actualCommissionRate = 5; // 5% for free tier
      }
    }

    const commissionAmount = (totalAmount * actualCommissionRate) / 100;
    const sellerAmount = totalAmount - commissionAmount;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: buyerId,
        seller_id: sellerId,
        buyer_id: buyerId,
        item_id: itemId,
        item_type: itemType,
        amount: totalAmount,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        status: 'completed',
        transaction_type: itemType,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create sale transaction error:', error);
    return { data: null, error };
  }
};
