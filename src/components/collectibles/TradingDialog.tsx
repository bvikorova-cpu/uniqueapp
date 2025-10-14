import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users } from 'lucide-react';

interface TradingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBadges: any[];
  userAvatars: any[];
  userThemes: any[];
  badges: any[];
  avatars: any[];
  themes: any[];
  onSubmitTrade: (trade: TradeOffer) => void;
}

export interface TradeOffer {
  receiverEmail: string;
  offeredType: 'badge' | 'avatar' | 'theme' | 'credits' | null;
  offeredId: string | null;
  offeredCredits: number;
  requestedType: 'badge' | 'avatar' | 'theme' | 'credits' | null;
  requestedId: string | null;
  requestedCredits: number;
  message: string;
}

export function TradingDialog({
  open,
  onOpenChange,
  userBadges,
  userAvatars,
  userThemes,
  badges,
  avatars,
  themes,
  onSubmitTrade
}: TradingDialogProps) {
  const [receiverEmail, setReceiverEmail] = useState('');
  const [offeredType, setOfferedType] = useState<'badge' | 'avatar' | 'theme' | 'credits' | null>(null);
  const [offeredId, setOfferedId] = useState<string | null>(null);
  const [offeredCredits, setOfferedCredits] = useState(0);
  const [requestedType, setRequestedType] = useState<'badge' | 'avatar' | 'theme' | 'credits' | null>(null);
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const [requestedCredits, setRequestedCredits] = useState(0);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!receiverEmail) return;
    if (!offeredType && !requestedType) return;

    onSubmitTrade({
      receiverEmail,
      offeredType,
      offeredId,
      offeredCredits,
      requestedType,
      requestedId,
      requestedCredits,
      message
    });

    // Reset form
    setReceiverEmail('');
    setOfferedType(null);
    setOfferedId(null);
    setOfferedCredits(0);
    setRequestedType(null);
    setRequestedId(null);
    setRequestedCredits(0);
    setMessage('');
  };

  const getAvailableItems = (type: string) => {
    switch (type) {
      case 'badge':
        return userBadges.map(ub => {
          const badge = badges.find(b => b.id === ub.badge_id);
          return badge ? { id: badge.id, name: badge.name, icon: badge.icon } : null;
        }).filter(Boolean);
      case 'avatar':
        return userAvatars.map(ua => {
          const avatar = avatars.find(a => a.id === ua.avatar_id);
          return avatar ? { id: avatar.id, name: avatar.name } : null;
        }).filter(Boolean);
      case 'theme':
        return userThemes.map(ut => {
          const theme = themes.find(t => t.id === ut.theme_id);
          return theme ? { id: theme.id, name: theme.name } : null;
        }).filter(Boolean);
      default:
        return [];
    }
  };

  const getAllItems = (type: string) => {
    switch (type) {
      case 'badge':
        return badges.map(b => ({ id: b.id, name: b.name, icon: b.icon }));
      case 'avatar':
        return avatars.map(a => ({ id: a.id, name: a.name }));
      case 'theme':
        return themes.map(t => ({ id: t.id, name: t.name }));
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Vytvor Trade Ponuku
          </DialogTitle>
          <DialogDescription>
            Vytvor trade ponuku pre iného používateľa. Vymeň kolekcie alebo kredity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receiver Email */}
          <div className="space-y-2">
            <Label htmlFor="receiver-email">Email príjemcu</Label>
            <Input
              id="receiver-email"
              type="email"
              placeholder="user@example.com"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
            />
          </div>

          {/* What You Offer */}
          <div className="space-y-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Čo ponúkaš
            </h3>
            
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select value={offeredType || ''} onValueChange={(value: any) => {
                setOfferedType(value);
                setOfferedId(null);
                setOfferedCredits(0);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyber typ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="badge">Badge</SelectItem>
                  <SelectItem value="avatar">Avatar</SelectItem>
                  <SelectItem value="theme">Theme</SelectItem>
                  <SelectItem value="credits">Kredity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {offeredType === 'credits' ? (
              <div className="space-y-2">
                <Label>Počet kreditov</Label>
                <Input
                  type="number"
                  min="1"
                  value={offeredCredits}
                  onChange={(e) => setOfferedCredits(parseInt(e.target.value) || 0)}
                />
              </div>
            ) : offeredType && (
              <div className="space-y-2">
                <Label>Vyber položku</Label>
                <Select value={offeredId || ''} onValueChange={setOfferedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyber položku..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableItems(offeredType).map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.icon && `${item.icon} `}{item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* What You Want */}
          <div className="space-y-3 p-4 rounded-lg border border-muted bg-muted/50">
            <h3 className="font-semibold text-lg">Čo žiadaš</h3>
            
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select value={requestedType || ''} onValueChange={(value: any) => {
                setRequestedType(value);
                setRequestedId(null);
                setRequestedCredits(0);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyber typ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="badge">Badge</SelectItem>
                  <SelectItem value="avatar">Avatar</SelectItem>
                  <SelectItem value="theme">Theme</SelectItem>
                  <SelectItem value="credits">Kredity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {requestedType === 'credits' ? (
              <div className="space-y-2">
                <Label>Počet kreditov</Label>
                <Input
                  type="number"
                  min="1"
                  value={requestedCredits}
                  onChange={(e) => setRequestedCredits(parseInt(e.target.value) || 0)}
                />
              </div>
            ) : requestedType && (
              <div className="space-y-2">
                <Label>Vyber položku</Label>
                <Select value={requestedId || ''} onValueChange={setRequestedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyber položku..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllItems(requestedType).map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.icon && `${item.icon} `}{item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Správa (nepovinné)</Label>
            <Textarea
              id="message"
              placeholder="Pridaj správu k trade ponuke..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušiť
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!receiverEmail || (!offeredType && !requestedType)}
          >
            Odoslať Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}