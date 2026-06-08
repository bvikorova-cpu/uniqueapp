import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy, Mail, MessageSquare, Clock, Zap, CheckCircle2 } from "lucide-react";

interface Props { sponsorId: string; }

const PRIORITY_EMAIL = "priority@uniqueapp.fun";

export function AccountManagerPanel({ sponsorId: _sponsorId }: Props) {
  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-purple-400" />
            Priority Support
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-0 ml-2">
              Enterprise
            </Badge>
          </CardTitle>
          <CardDescription>
            Skip the queue. Your tickets are handled first, with a guaranteed response from our team within 4 business hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-white">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-purple-500/20">
              <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">4h response SLA</div>
                <div className="text-xs text-gray-400">Mon–Fri, 9:00–18:00 CET</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Priority queue</div>
                <div className="text-xs text-gray-400">Handled before standard tickets</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-purple-500/20">
              <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Direct escalation</div>
                <div className="text-xs text-gray-400">Straight to engineering when needed</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
              <a href={`mailto:${PRIORITY_EMAIL}?subject=Priority%20Support%20Request`}>
                <Mail className="h-4 w-4 mr-2" /> Email priority support
              </a>
            </Button>
            <Button asChild variant="outline" className="border-purple-500/50 text-white hover:bg-purple-500/10">
              <a href="/support">
                <MessageSquare className="h-4 w-4 mr-2" /> Open support chat
              </a>
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Include your sponsor ID in the email subject for fastest routing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
