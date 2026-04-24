// Stub for the optional openai type reference inside @supabase/functions-js.
// We never import openai directly — we route AI calls through the Lovable AI gateway —
// but the type checker still tries to resolve npm:openai. This stub satisfies it.
declare module "npm:openai" {
  const value: any;
  export = value;
}
declare module "npm:openai@^4.52.5" {
  const value: any;
  export = value;
}
