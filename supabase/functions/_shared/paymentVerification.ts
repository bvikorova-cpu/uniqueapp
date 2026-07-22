import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

interface PaymentVerificationResult {
  success: boolean;
  alreadyProcessed?: boolean;
  credits?: number;
  error?: string;
}

interface CreditTableConfig {
  tableName: string;
  creditsColumn: string;
  totalColumn: string;
}

// Mapping of credit types to their table configurations
const CREDIT_TABLE_CONFIG: Record<string, CreditTableConfig> = {
  brain_duel_credits: { tableName: "brain_duel_credits", creditsColumn: "credits", totalColumn: "credits" },
  analyzer_credits: { tableName: "analyzer_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  ai_credits: { tableName: "ai_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  ai_studio_credits: { tableName: "ai_studio_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  emotion_credits: { tableName: "emotion_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  photo_credits: { tableName: "photo_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  handwriting_credits: { tableName: "handwriting_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  past_life_credits: { tableName: "past_life_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  lie_detector_credits: { tableName: "lie_detector_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  creative_forge_credits: { tableName: "creative_forge_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  messenger_ai_credits: { tableName: "messenger_ai_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  brand_battle_credits: { tableName: "brand_battle_credits", creditsColumn: "credits", totalColumn: "credits" },
  iq_credits: { tableName: "iq_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  cooking_credits: { tableName: "cooking_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  tutoring_credits: { tableName: "tutoring_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  video_ad_credits: { tableName: "video_ad_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  secret_santa_credits: { tableName: "secret_santa_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  shadow_credits: { tableName: "shadow_credits", creditsColumn: "credits", totalColumn: "credits" },
  character_credits: { tableName: "character_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  coloring_credits: { tableName: "coloring_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  antique_credits: { tableName: "antique_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" },
  astrology_credits: { tableName: "astrology_credits", creditsColumn: "credits_remaining", totalColumn: "total_credits_purchased" } };

/**
 * Verifies a Stripe payment and adds credits with idempotency protection
 * This function should be called from webhooks or verify-payment endpoints
 */
export async function verifyAndProcessPayment(
  supabaseAdmin: any,
  sessionId: string,
  expectedUserId?: string
): Promise<PaymentVerificationResult> {
  console.log(`[PAYMENT-VERIFICATION] Starting verification for session: ${sessionId}`);

  // 1. Check if this session was already processed (idempotency)
  const { data: existingVerification } = await supabaseAdmin
    .from("payment_verifications")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single();

  if (existingVerification && existingVerification.payment_status === "completed") {
    console.log(`[PAYMENT-VERIFICATION] Session ${sessionId} already processed`);
    return { success: true,
      alreadyProcessed: true,
      credits: existingVerification.credits_amount };
  }

  // 2. Retrieve session from Stripe
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error(`[PAYMENT-VERIFICATION] Failed to retrieve Stripe session:`, error);
    return { success: false, error: "Invalid session ID" };
  }

  // 3. Verify payment status
  if (session.payment_status !== "paid") {
    console.log(`[PAYMENT-VERIFICATION] Payment not completed, status: ${session.payment_status}`);
    return { success: false, error: "Payment not completed" };
  }

  // 4. Verify user ownership if expectedUserId provided
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error(`[PAYMENT-VERIFICATION] No user_id in session metadata`);
    return { success: false, error: "Invalid session metadata" };
  }

  if (expectedUserId && userId !== expectedUserId) {
    console.error(`[PAYMENT-VERIFICATION] User mismatch: ${userId} vs ${expectedUserId}`);
    return { success: false, error: "Session does not belong to this user" };
  }

  // 5. Extract credits info
  const creditsToAdd = parseInt(session.metadata?.credits || "0");
  const creditType = session.metadata?.credit_type || session.metadata?.type || "ai_credits";

  if (creditsToAdd <= 0) {
    console.error(`[PAYMENT-VERIFICATION] Invalid credits amount: ${creditsToAdd}`);
    return { success: false, error: "Invalid credits amount" };
  }

  // 6. Record the verification attempt (or update existing pending)
  const verificationData = { stripe_session_id: sessionId,
    user_id: userId,
    credit_type: creditType,
    credits_amount: creditsToAdd,
    amount_paid: session.amount_total ? session.amount_total / 100 : 0,
    currency: session.currency || "eur",
    payment_status: "processing",
    metadata: session.metadata };

  if (existingVerification) {
    await supabaseAdmin
      .from("payment_verifications")
      .update(verificationData)
      .eq("id", existingVerification.id);
  } else {
    const { error: insertError } = await supabaseAdmin
      .from("payment_verifications")
      .insert(verificationData);

    if (insertError && insertError.code !== "23505") {
      // 23505 is unique violation - another process might have inserted
      console.error(`[PAYMENT-VERIFICATION] Failed to record verification:`, insertError);
    }
  }

  // 7. Add credits to the appropriate table
  const tableConfig = CREDIT_TABLE_CONFIG[creditType];
  if (!tableConfig) {
    console.error(`[PAYMENT-VERIFICATION] Unknown credit type: ${creditType}`);
    return { success: false, error: `Unknown credit type: ${creditType}` };
  }

  try {
    // Get current credits
    const { data: currentCredits } = await supabaseAdmin
      .from(tableConfig.tableName)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (currentCredits) { // Update existing record
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString() };
      updateData[tableConfig.creditsColumn] = (currentCredits[tableConfig.creditsColumn] || 0) + creditsToAdd;
      if (tableConfig.totalColumn !== tableConfig.creditsColumn) {
        updateData[tableConfig.totalColumn] = (currentCredits[tableConfig.totalColumn] || 0) + creditsToAdd;
      }

      const { error: updateError } = await supabaseAdmin
        .from(tableConfig.tableName)
        .update(updateData)
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }
    } else { // Create new record
      const insertData: Record<string, any> = {
        user_id: userId };
      insertData[tableConfig.creditsColumn] = creditsToAdd;
      if (tableConfig.totalColumn !== tableConfig.creditsColumn) {
        insertData[tableConfig.totalColumn] = creditsToAdd;
      }

      const { error: insertError } = await supabaseAdmin
        .from(tableConfig.tableName)
        .insert(insertData);

      if (insertError) {
        throw insertError;
      }
    }

    console.log(`[PAYMENT-VERIFICATION] Added ${creditsToAdd} ${creditType} to user ${userId}`);
  } catch (error) {
    console.error(`[PAYMENT-VERIFICATION] Failed to add credits:`, error);
    
    // Mark as failed
    await supabaseAdmin
      .from("payment_verifications")
      .update({ payment_status: "failed" })
      .eq("stripe_session_id", sessionId);

    return { success: false, error: "Failed to add credits" };
  }

  // 8. Mark as completed
  await supabaseAdmin
    .from("payment_verifications")
    .update({ payment_status: "completed",
      processed_at: new Date().toISOString() })
    .eq("stripe_session_id", sessionId);

  // 9. Create audit trail in transactions table
  try { await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        transaction_type: "credit_purchase",
        amount: session.amount_total ? session.amount_total / 100 : 0,
        commission_rate: 0,
        commission_amount: 0,
        seller_amount: 0,
        status: "completed",
        item_type: creditType,
        stripe_session_id: sessionId });
    console.log(`[PAYMENT-VERIFICATION] Audit trail created for session ${sessionId}`);
  } catch (auditError) {
    // Don't fail the whole process for audit logging issues
    console.error(`[PAYMENT-VERIFICATION] Failed to create audit trail:`, auditError);
  }

  return { success: true,
    alreadyProcessed: false,
    credits: creditsToAdd };
}

/**
 * Validates that a session belongs to a user and is paid
 * Use this for quick checks without processing credits
 */
export async function validatePaymentSession(
  sessionId: string,
  expectedUserId: string
): Promise<{ valid: boolean; session?: Stripe.Checkout.Session; error?: string }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { valid: false, error: "Payment not completed" };
    }

    if (session.metadata?.user_id !== expectedUserId) {
      return { valid: false, error: "Session does not belong to this user" };
    }

    return { valid: true, session };
  } catch (error) {
    return { valid: false, error: "Invalid session" };
  }
}
