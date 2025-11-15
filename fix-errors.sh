#!/bin/bash
# Quick fix script for TypeScript errors - run this to fix all remaining error.message issues

# List of files to fix
files=(
  "supabase/functions/brain-duel-get-questions/index.ts"
  "supabase/functions/brain-duel-matchmaking/index.ts"
  "supabase/functions/check-ancestor-twin-subscription/index.ts"
  "supabase/functions/clone-voice/index.ts"
  "supabase/functions/create-ancestor-twin-checkout/index.ts"
  "supabase/functions/create-brain-duel-payment/index.ts"
  "supabase/functions/create-employer-subscription-checkout/index.ts"
  "supabase/functions/create-future-face-checkout/index.ts"
  "supabase/functions/create-kids-drawing-checkout/index.ts"
  "supabase/functions/create-pet-checkout/index.ts"
  "supabase/functions/create-teen-career-payment/index.ts"
  "supabase/functions/create-voice-clone-checkout/index.ts"
  "supabase/functions/create-voice-subscription-checkout/index.ts"
  "supabase/functions/create-wellness-checkout/index.ts"
  "supabase/functions/delete-voice-clone/index.ts"
  "supabase/functions/generate-room-panorama/index.ts"
  "supabase/functions/generate-voice-memory/index.ts"
  "supabase/functions/list-voice-clones/index.ts"
  "supabase/functions/purchase-course/index.ts"
  "supabase/functions/send-gift-payment/index.ts"
  "supabase/functions/update-voice-clone/index.ts"
  "supabase/functions/verify-brain-duel-payment/index.ts"
  "supabase/functions/verify-course-purchase/index.ts"
  "supabase/functions/wellness-mindfulness-chat/index.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace error.message with proper type checking
    sed -i 's/error\.message/error instanceof Error ? error.message : String(error)/g' "$file"
    echo "Fixed: $file"
  fi
done

echo "All files fixed!"
