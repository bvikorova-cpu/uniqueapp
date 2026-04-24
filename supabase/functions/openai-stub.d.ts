// Stub to satisfy @supabase/functions-js type reference to npm:openai.
// We don't actually use openai in any edge function (we route via Lovable AI gateway),
// but functions-js@2.104+ has an optional type reference that the Deno typechecker
// tries to resolve. This stub provides a minimal module so resolution succeeds.
declare module "npm:openai" {
  const openai: any;
  export = openai;
}
declare module "npm:openai@^4.52.5" {
  const openai: any;
  export = openai;
}
