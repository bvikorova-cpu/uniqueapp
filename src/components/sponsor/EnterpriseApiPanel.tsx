import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Key, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  sponsor: { id: string };
}

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co"}/functions/v1/brand-sponsor-api`;

export function EnterpriseApiPanel({ sponsor }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const loadKey = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_my_brand_api_key" as any);
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      setApiKey(row?.api_key ?? null);
      setCreatedAt(row?.api_key_created_at ?? null);
    } catch (e: any) {
      console.error("get_my_brand_api_key failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKey(); }, []);

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success("Copied to clipboard");
  };

  const rotateKey = async () => {
    if (apiKey && !confirm("Rotate API key? The current key will stop working immediately.")) return;
    setRotating(true);
    try {
      const { data, error } = await supabase.rpc("rotate_my_brand_api_key" as any);
      if (error) throw error;
      setApiKey(data as string);
      setCreatedAt(new Date().toISOString());
      setRevealed(true);
      toast.success(apiKey ? "API key rotated" : "API key generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to rotate key");
    } finally {
      setRotating(false);
    }
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 12)}${"•".repeat(20)}${apiKey.slice(-4)}` : null;

  return (
    <>
      <Card className="bg-black/40 backdrop-blur-lg border-amber-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                Enterprise API Key
              </CardTitle>
              <CardDescription>
                Programmatic access to your sponsor analytics. Treat this key like a password.
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black border-0">
              Enterprise
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
          ) : apiKey ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-black/60 rounded-lg border border-white/10 font-mono text-sm">
                <code className="flex-1 break-all text-amber-200">
                  {revealed ? apiKey : maskedKey}
                </code>
                <Button size="icon" variant="ghost" onClick={() => setRevealed(!revealed)}>
                  {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => copy(apiKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {createdAt && (
                <p className="text-xs text-gray-400">
                  Created {new Date(createdAt).toLocaleString()}
                </p>
              )}
              <Button onClick={rotateKey} disabled={rotating} variant="outline" size="sm">
                {rotating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Rotate key
              </Button>
            </>
          ) : (
            <div className="p-4 bg-yellow-950/30 border border-yellow-500/30 rounded-lg text-sm text-yellow-200">
              Your API key was not provisioned yet. Click below to generate one.
              <div className="mt-3">
                <Button onClick={rotateKey} disabled={rotating}>
                  {rotating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                  Generate key
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-white">API Reference</CardTitle>
          <CardDescription>Base URL: <code className="text-purple-300 break-all">{BASE_URL}</code></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-white font-semibold mb-1">Authentication</p>
            <p className="text-gray-400">Send your key in the <code className="text-purple-300">X-API-Key</code> header on every request.</p>
          </div>

          {[
            { action: "me", desc: "Returns your sponsor profile and subscription status." },
            { action: "votes&days=30", desc: "Daily vote series for the last N days (max 90)." },
            { action: "rank", desc: "Your current rank among active approved sponsors." },
            { action: "competitors", desc: "Top 10 competitors in your category." },
          ].map((ep) => (
            <div key={ep.action} className="p-3 bg-black/60 rounded-lg border border-white/10">
              <div className="flex items-center justify-between gap-2 mb-1">
                <code className="text-green-400 text-xs break-all">GET {BASE_URL}?action={ep.action}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copy(`curl -H "X-API-Key: YOUR_KEY" "${BASE_URL}?action=${ep.action}"`)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-gray-400">{ep.desc}</p>
            </div>
          ))}

          <div className="p-3 bg-black/60 rounded-lg border border-white/10">
            <p className="text-white font-semibold mb-2">Example</p>
            <pre className="text-xs text-gray-300 overflow-x-auto">{`curl -H "X-API-Key: ${apiKey ?? "ba_live_..."}" \\
  "${BASE_URL}?action=votes&days=7"`}</pre>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
