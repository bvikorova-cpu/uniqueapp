import Stripe from "https://esm.sh/stripe@18.5.0";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export const ESCROW_HOLD_DAYS = 7;
export const AUTO_RELEASE_AFTER_DELIVERY_DAYS = 3;

export interface EscrowRecord {
  id: string;
  order_id: string;
  amount: number;
  commission_amount: number;
  seller_payout: number;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  auto_release_at: string;
}

export interface OrderWithEscrow {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission_amount: number;
  seller_payout: number;
  status: string;
  escrow_status: string;
}

const logStep = (prefix: string, step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${prefix}] ${step}${detailsStr}`);
};

export async function createEscrowHold(
  supabase: SupabaseClient,
  orderId: string,
  amount: number,
  commissionAmount: number,
  sellerPayout: number,
  holdDays: number = ESCROW_HOLD_DAYS
): Promise<EscrowRecord> {
  const autoReleaseAt = new Date();
  autoReleaseAt.setDate(autoReleaseAt.getDate() + holdDays);

  const { data, error } = await supabase
    .from('bazaar_escrow')
    .insert({
      order_id: orderId,
      amount,
      commission_amount: commissionAmount,
      seller_payout: sellerPayout,
      status: 'held',
      auto_release_at: autoReleaseAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create escrow: ${error.message}`);

  // Update order escrow status
  await supabase
    .from('bazaar_orders')
    .update({ escrow_status: 'held' })
    .eq('id', orderId);

  logStep('ESCROW', 'Hold created', { orderId, amount, autoReleaseAt });
  return data;
}

export async function releaseEscrow(
  supabase: SupabaseClient,
  stripe: Stripe,
  escrowId: string,
  sellerStripeAccountId?: string
): Promise<{ success: boolean; transferId?: string }> {
  // Get escrow record
  const { data: escrow, error: escrowError } = await supabase
    .from('bazaar_escrow')
    .select('*, bazaar_orders(*)')
    .eq('id', escrowId)
    .single();

  if (escrowError || !escrow) {
    throw new Error('Escrow record not found');
  }

  if (escrow.status !== 'held') {
    throw new Error(`Cannot release escrow with status: ${escrow.status}`);
  }

  let transferId: string | undefined;

  // If seller has Stripe Connect account, transfer funds
  if (sellerStripeAccountId) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(escrow.seller_payout * 100),
        currency: 'eur',
        destination: sellerStripeAccountId,
        metadata: {
          escrow_id: escrowId,
          order_id: escrow.order_id,
        },
      });
      transferId = transfer.id;
      logStep('ESCROW', 'Stripe transfer created', { transferId });
    } catch (err) {
      logStep('ESCROW', 'Stripe transfer failed', { error: err });
      // Continue without transfer - funds stay in platform account
    }
  }

  // Update escrow status
  const { error: updateError } = await supabase
    .from('bazaar_escrow')
    .update({
      status: 'released',
      released_at: new Date().toISOString(),
      stripe_transfer_id: transferId,
    })
    .eq('id', escrowId);

  if (updateError) throw new Error(`Failed to update escrow: ${updateError.message}`);

  // Update order escrow status
  await supabase
    .from('bazaar_orders')
    .update({ escrow_status: 'released' })
    .eq('id', escrow.order_id);

  logStep('ESCROW', 'Released', { escrowId, transferId });
  return { success: true, transferId };
}

export async function refundEscrow(
  supabase: SupabaseClient,
  stripe: Stripe,
  escrowId: string,
  stripePaymentIntentId: string
): Promise<{ success: boolean; refundId?: string }> {
  // Get escrow record
  const { data: escrow, error: escrowError } = await supabase
    .from('bazaar_escrow')
    .select('*')
    .eq('id', escrowId)
    .single();

  if (escrowError || !escrow) {
    throw new Error('Escrow record not found');
  }

  if (escrow.status !== 'held' && escrow.status !== 'disputed') {
    throw new Error(`Cannot refund escrow with status: ${escrow.status}`);
  }

  let refundId: string | undefined;

  // Create Stripe refund
  try {
    const refund = await stripe.refunds.create({
      payment_intent: stripePaymentIntentId,
      amount: Math.round(escrow.amount * 100),
      metadata: {
        escrow_id: escrowId,
        order_id: escrow.order_id,
      },
    });
    refundId = refund.id;
    logStep('ESCROW', 'Stripe refund created', { refundId });
  } catch (err) {
    logStep('ESCROW', 'Stripe refund failed', { error: err });
    throw new Error('Failed to process refund');
  }

  // Update escrow status
  const { error: updateError } = await supabase
    .from('bazaar_escrow')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
    })
    .eq('id', escrowId);

  if (updateError) throw new Error(`Failed to update escrow: ${updateError.message}`);

  // Update order escrow status
  await supabase
    .from('bazaar_orders')
    .update({ escrow_status: 'refunded', status: 'refunded' })
    .eq('id', escrow.order_id);

  logStep('ESCROW', 'Refunded', { escrowId, refundId });
  return { success: true, refundId };
}

export async function openDispute(
  supabase: SupabaseClient,
  orderId: string,
  userId: string,
  reason: string,
  description?: string,
  evidenceUrls?: string[]
): Promise<{ disputeId: string }> {
  // Get escrow for order
  const { data: escrow } = await supabase
    .from('bazaar_escrow')
    .select('id')
    .eq('order_id', orderId)
    .single();

  // Create dispute
  const { data: dispute, error } = await supabase
    .from('bazaar_disputes')
    .insert({
      order_id: orderId,
      escrow_id: escrow?.id,
      opened_by: userId,
      reason,
      description,
      evidence_urls: evidenceUrls || [],
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create dispute: ${error.message}`);

  // Update escrow status to disputed
  if (escrow) {
    await supabase
      .from('bazaar_escrow')
      .update({ status: 'disputed' })
      .eq('id', escrow.id);
  }

  // Update order escrow status
  await supabase
    .from('bazaar_orders')
    .update({ escrow_status: 'disputed' })
    .eq('id', orderId);

  logStep('DISPUTE', 'Opened', { disputeId: dispute.id, orderId, reason });
  return { disputeId: dispute.id };
}

export async function getEscrowForOrder(
  supabase: SupabaseClient,
  orderId: string
): Promise<EscrowRecord | null> {
  const { data, error } = await supabase
    .from('bazaar_escrow')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) return null;
  return data;
}

export async function getExpiredEscrows(
  supabase: SupabaseClient
): Promise<EscrowRecord[]> {
  const { data, error } = await supabase
    .from('bazaar_escrow')
    .select('*')
    .eq('status', 'held')
    .lt('auto_release_at', new Date().toISOString());

  if (error) return [];
  return data || [];
}
