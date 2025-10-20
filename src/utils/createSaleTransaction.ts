import { supabase } from '@/integrations/supabase/client';

interface CreateSaleTransactionParams {
  itemId: string;
  itemType: 'bazaar_sale' | 'auction_sale';
  sellerId: string;
  buyerId: string;
  totalAmount: number;
}

export const createSaleTransaction = async ({
  itemId,
  itemType,
  sellerId,
  buyerId,
  totalAmount,
}: CreateSaleTransactionParams) => {
  try {
    // Call secure edge function that performs server-side calculations
    const { data, error } = await supabase.functions.invoke('process-sale-transaction', {
      body: {
        itemId,
        itemType,
        sellerId,
        buyerId,
        totalAmount,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create sale transaction error:', error);
    return { data: null, error };
  }
};
