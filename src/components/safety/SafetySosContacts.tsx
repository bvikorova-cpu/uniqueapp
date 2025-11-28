import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone, Globe, MessageCircle, Search, ExternalLink, Heart } from "lucide-react";
import { useState } from "react";

const emergencyContacts = [
  {
    region: "International",
    contacts: [
      { name: "Emergency Services", number: "911 (US) / 112 (EU) / 999 (UK)", type: "emergency", description: "For immediate danger" },
      { name: "Crisis Text Line", number: "Text HOME to 741741", type: "text", description: "24/7 text-based support (US, UK, Canada, Ireland)" },
      { name: "International Association for Suicide Prevention", url: "https://www.iasp.info/resources/Crisis_Centres", type: "web", description: "Find crisis centers worldwide" },
    ]
  },
  {
    region: "United States",
    flag: "🇺🇸",
    contacts: [
      { name: "National Suicide Prevention Lifeline", number: "988", type: "phone", description: "24/7 crisis support" },
      { name: "Childhelp National Child Abuse Hotline", number: "1-800-422-4453", type: "phone", description: "24/7 abuse reporting and support" },
      { name: "STOMP Out Bullying HelpChat", url: "https://www.stompoutbullying.org/get-help", type: "web", description: "Live chat for bullying victims" },
      { name: "Trevor Project (LGBTQ+)", number: "1-866-488-7386", type: "phone", description: "24/7 LGBTQ+ youth crisis line" },
    ]
  },
  {
    region: "United Kingdom",
    flag: "🇬🇧",
    contacts: [
      { name: "Childline", number: "0800 1111", type: "phone", description: "Free confidential support for under 19s" },
      { name: "Samaritans", number: "116 123", type: "phone", description: "24/7 emotional support" },
      { name: "Anti-Bullying Alliance", url: "https://anti-bullyingalliance.org.uk", type: "web", description: "Resources and support" },
      { name: "NSPCC Helpline", number: "0808 800 5000", type: "phone", description: "For adults concerned about a child" },
    ]
  },
  {
    region: "Canada",
    flag: "🇨🇦",
    contacts: [
      { name: "Kids Help Phone", number: "1-800-668-6868", type: "phone", description: "24/7 support for young people" },
      { name: "Crisis Services Canada", number: "1-833-456-4566", type: "phone", description: "Suicide prevention" },
      { name: "PREVNet", url: "https://www.prevnet.ca", type: "web", description: "Bullying prevention resources" },
    ]
  },
  {
    region: "Australia",
    flag: "🇦🇺",
    contacts: [
      { name: "Kids Helpline", number: "1800 55 1800", type: "phone", description: "24/7 for young people 5-25" },
      { name: "eSafety Commissioner", url: "https://www.esafety.gov.au", type: "web", description: "Report cyberbullying" },
      { name: "Lifeline Australia", number: "13 11 14", type: "phone", description: "24/7 crisis support" },
    ]
  },
  {
    region: "Europe",
    flag: "🇪🇺",
    contacts: [
      { name: "Child Helpline International", url: "https://www.childhelplineinternational.org", type: "web", description: "Find helplines in your country" },
      { name: "EU Kids Online", url: "http://www.lse.ac.uk/media-and-communications/research/research-projects/eu-kids-online", type: "web", description: "Research and resources" },
      { name: "116 111 (Harmonized number)", number: "116 111", type: "phone", description: "Child helpline in many EU countries" },
    ]
  },
  {
    region: "Asia Pacific",
    flag: "🌏",
    contacts: [
      { name: "Befrienders Worldwide", url: "https://www.befrienders.org", type: "web", description: "Find support centers globally" },
      { name: "Singapore - Samaritans of Singapore", number: "1800-221-4444", type: "phone", description: "24-hour hotline" },
      { name: "Japan - TELL", number: "03-5774-0992", type: "phone", description: "English-language support" },
      { name: "India - iCall", number: "9152987821", type: "phone", description: "Psychosocial helpline" },
    ]
  }
];

const SafetySosContacts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = emergencyContacts.filter(region => 
    region.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "phone": return <Phone className="h-4 w-4" />;
      case "text": return <MessageCircle className="h-4 w-4" />;
      case "web": return <Globe className="h-4 w-4" />;
      case "emergency": return <Heart className="h-4 w-4 text-destructive" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "phone": return <Badge variant="default">Call</Badge>;
      case "text": return <Badge variant="secondary">Text</Badge>;
      case "web": return <Badge variant="outline">Website</Badge>;
      case "emergency": return <Badge variant="destructive">Emergency</Badge>;
      default: return <Badge>Contact</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-destructive">If you are in immediate danger, call emergency services NOW</h2>
            <p className="text-lg font-semibold">911 (USA) | 112 (Europe) | 999 (UK) | 000 (Australia)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            SOS Contacts - Global Helplines
          </CardTitle>
          <CardDescription>
            Find crisis support and helplines in your region. All services are confidential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by country or service name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredContacts.map((region) => (
          <Card key={region.region}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {region.flag && <span className="text-xl">{region.flag}</span>}
                {region.region}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {region.contacts.map((contact, index) => (
                  <div key={index} className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getTypeIcon(contact.type)}</div>
                      <div>
                        <p className="font-semibold">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.description}</p>
                        {contact.number && (
                          <p className="text-sm font-mono mt-1">{contact.number}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeBadge(contact.type)}
                      {contact.url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={contact.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit
                          </a>
                        </Button>
                      ) : contact.number && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}>
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Missing your region */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Globe className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="font-semibold">Can't find your region?</p>
            <p className="text-sm text-muted-foreground">
              Visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">findahelpline.com</a> for 
              a comprehensive global directory of mental health helplines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetySosContacts;
