import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Clock, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DesignConsultations() {
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | null>(null);

  const packages = [
    {
      duration: 30,
      price: 29,
      features: [
        "30-minútový video call",
        "Základné odporúčania",
        "Farebná paleta",
        "Zoznam nakupovania"
      ]
    },
    {
      duration: 60,
      price: 49,
      features: [
        "60-minútový video call",
        "Kompletný návrh miestnosti",
        "3D vizualizácia",
        "Farebná paleta + layout",
        "Detailný zoznam nakupovania",
        "7-dňová podpora"
      ],
      popular: true
    }
  ];

  const handleBookConsultation = (duration: 30 | 60, price: number) => {
    toast({
      title: "Rezervácia konzultácie",
      description: `Funkcia platby bude čoskoro dostupná. Cena: €${price}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Design Konzultácie</CardTitle>
              <CardDescription>
                Personalizované video konzultácie s interiérovými dizajnérmi
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.duration} className={pkg.popular ? "border-primary border-2" : ""}>
            {pkg.popular && (
              <div className="bg-primary text-primary-foreground text-center py-2 rounded-t-lg font-semibold">
                Najpopulárnejšie
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{pkg.duration} minút</CardTitle>
                  <CardDescription>Video konzultácia</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">€{pkg.price}</div>
                  <p className="text-sm text-muted-foreground">jednorazovo</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleBookConsultation(pkg.duration as 30 | 60, pkg.price)}
                className="w-full"
                variant={pkg.popular ? "default" : "outline"}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Rezervovať konzultáciu
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ako to funguje?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Vyberte balík</h4>
                <p className="text-sm text-muted-foreground">Zvoľte si dĺžku konzultácie podľa vašich potrieb</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Rezervujte termín</h4>
                <p className="text-sm text-muted-foreground">Vyberte si vhodný čas a zaplaťte online</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Video hovor</h4>
                <p className="text-sm text-muted-foreground">Konzultácia cez Zoom/Google Meet s dizajnérom</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Dostanete materiály</h4>
                <p className="text-sm text-muted-foreground">PDF s návrhom, farbami a zoznamom produktov</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
