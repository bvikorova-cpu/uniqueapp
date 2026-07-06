import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: userData, error: userErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userId = userData.user.id

    const body = await req.json().catch(() => ({}))
    const nodeId = typeof body?.nodeId === 'string' ? body.nodeId : null
    if (!nodeId) {
      return new Response(JSON.stringify({ error: 'nodeId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Load target node
    const { data: node, error: nodeErr } = await supabase
      .from('education_skill_tree_nodes')
      .select('id, parent_id, required_xp, subject')
      .eq('id', nodeId)
      .maybeSingle()
    if (nodeErr || !node) {
      return new Response(JSON.stringify({ error: 'Node not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate prerequisite completion
    if (node.parent_id) {
      const { data: parentProgress } = await supabase
        .from('education_user_skill_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('node_id', node.parent_id)
        .maybeSingle()
      if (!parentProgress || parentProgress.status !== 'completed') {
        return new Response(JSON.stringify({ error: 'Complete prerequisite skill first' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Upsert progress as unlocked
    const { data: existing } = await supabase
      .from('education_user_skill_progress')
      .select('id, status')
      .eq('user_id', userId)
      .eq('node_id', nodeId)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'locked') {
        await supabase
          .from('education_user_skill_progress')
          .update({ status: 'unlocked', updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      }
    } else {
      await supabase.from('education_user_skill_progress').insert({
        user_id: userId,
        node_id: nodeId,
        status: 'unlocked',
        mastery_score: 0,
      })
    }

    return new Response(JSON.stringify({ ok: true, status: 'unlocked' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
