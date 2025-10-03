import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Phone, AlertTriangle, Droplet, Flame, Bone, Wind, Zap, Activity } from "lucide-react";

const FirstAid = () => {
  const emergencyContacts = [
    { name: "Záchranná zdravotná služba", number: "155", icon: Heart },
    { name: "Hasiči", number: "150", icon: Flame },
    { name: "Polícia", number: "158", icon: AlertTriangle },
    { name: "Tiesňová linka", number: "112", icon: Phone },
  ];

  const firstAidCategories = [
    {
      id: "cpr",
      title: "Kardiopulmonálna resuscitácia (KPR)",
      icon: Heart,
      color: "text-red-500",
      steps: [
        "Skontrolujte miesto – uistite sa, že je bezpečné",
        "Skontrolujte vedomie – potriasť a nahlas osloviť",
        "Zavolajte 155 alebo 112",
        "Otvorte dýchacie cesty – zakloňte hlavu, zdvihnite bradu",
        "Skontrolujte dýchanie – max 10 sekúnd",
        "30 stlačení hrudníka – stred hrudnej kosti, hĺbka 5-6 cm, rýchlosť 100-120/min",
        "2 vdychy – každý trvá 1 sekundu",
        "Pokračujte v cykle 30:2 až do príchodu záchranky",
      ],
      warning: "Ak máte k dispozícii AED (automatický externý defibrilátor), použite ho čo najskôr podľa pokynov prístroja.",
    },
    {
      id: "choking",
      title: "Zadusenie (upchatá dýchacia cesta)",
      icon: Wind,
      color: "text-blue-500",
      steps: [
        "Spýtajte sa: 'Dusíte sa?' Ak nemôže hovoriť, je to vážne",
        "Povzbuďte ku kašľu, ak dokáže kašľať",
        "Ak nemôže kašľať alebo dýchať:",
        "• 5 úderov medzi lopatky – zhora nadol",
        "• 5 stlačení brucha (Heimlichov manéver) – päsť nad pupok, prudké stlačenia smerom hore",
        "Striedajte 5 úderov a 5 stlačení",
        "Ak stratí vedomie, začnite KPR",
        "Zavolajte 155",
      ],
      warning: "Pri tehotných ženách a malých deťoch používajte upravenou techniku.",
    },
    {
      id: "bleeding",
      title: "Krvácanie",
      icon: Droplet,
      color: "text-red-600",
      steps: [
        "Oblečte si rukavice (ak sú k dispozícii)",
        "Priamy tlak – stlačte ranu čistým obväzom alebo látkou",
        "Udržujte tlak aspoň 10 minút",
        "Ak krv presiakne, pridajte ďalší obväz (neodstraňujte prvý)",
        "Zdvihnite zranenú časť nad úroveň srdca (ak nie je zlomenina)",
        "Pri silnom krvácaní – tlak na artériu medzi ranou a srdcom",
        "Zavolajte 155 pri masívnom krvácaní",
        "Nikdy neodstraňujte zapichnuté predmety – stabilizujte ich",
      ],
      warning: "Ak krv striekala alebo ide o amputáciu, použite turniket iba ako poslednú možnosť.",
    },
    {
      id: "burns",
      title: "Popáleniny",
      icon: Flame,
      color: "text-orange-500",
      steps: [
        "Zastavte horenie – odstráňte zdroj tepla",
        "Odstráňte šperky a voľné oblečenie (nie prilepené)",
        "Chlaďte popáleninu vlažnou (nie studenou) vodou – 10-20 minút",
        "Prikryte čistou, nepriľnavou látkou",
        "Nedávajte ľad, masť, maslo ani zubná pasta",
        "Pri veľkých popáleninách zavolajte 155",
        "Sledujte príznaky šoku",
      ],
      warning: "Stupeň popáleniny: 1. stupeň – začervenanie; 2. stupeň – pľuzgiere; 3. stupeň – zuhoľnatenie kože (vždy k lekárovi).",
    },
    {
      id: "fractures",
      title: "Zlomeniny a vykĺbenia",
      icon: Bone,
      color: "text-purple-500",
      steps: [
        "Nepohybujte zraneným – ak nie je nevyhnutné",
        "Stabilizujte zranenú časť v pozícii, v akej ju našli",
        "Použite dlahy – môžu to byť palice, noviny, vankúše",
        "Imobilizujte kĺby nad a pod zlomeninou",
        "Priložte studený obklad (ľad v látke) na 20 minút",
        "Sledujte prekrvenie – farba, citlivosť, pulz",
        "Zavolajte 155 alebo transportujte k lekárovi",
      ],
      warning: "Nikdy sa nepokúšajte narovnať zlomenú kosť alebo vrátiť vykĺbený kĺb!",
    },
    {
      id: "shock",
      title: "Šok",
      icon: Zap,
      color: "text-yellow-500",
      steps: [
        "Položte osobu na chrbát",
        "Zdvihnite nohy do výšky 30 cm (ak nie je zranenie hlavy, krku alebo chrbtice)",
        "Udržujte v teple – prikryte dekou",
        "Uvoľnite tesné oblečenie",
        "Nepodávajte jedlo ani nápoje",
        "Sledujte dýchanie a pulz",
        "Zavolajte 155 okamžite",
        "Ukľudňujte osobu",
      ],
      warning: "Príznaky šoku: bledá kožа, studený pot, rýchly pulz, plytké dýchanie, zmätenosť.",
    },
    {
      id: "stroke",
      title: "Mozgová mŕtvica (CMP)",
      icon: Activity,
      color: "text-pink-500",
      steps: [
        "Test FAST:",
        "• F (Face) – Tvár: Požiadajte o úsmev, nesúmernosť?",
        "• A (Arms) – Ruky: Zdvihnúť obe ruky, jedna klesá?",
        "• S (Speech) – Reč: Povedať vetu, nejasná reč?",
        "• T (Time) – Čas: Zavolajte 155 OKAMŽITE!",
        "Položte na chrbát s mierne zdvihnutou hlavou",
        "Nepodávajte jedlo, nápoje ani lieky",
        "Sledujte životné funkcie",
        "Poznačte si čas začiatku príznakov",
      ],
      warning: "Každá minúta je kritická! Čím skôr sa začne liečba, tým lepšia prognóza.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-red-500 text-white">
            <Heart className="h-4 w-4 mr-1" />
            Prvá pomoc
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Prvá pomoc
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kompletný sprievodca poskytovaním prvej pomoci v núdzových situáciách
          </p>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-8 border-red-500 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700 dark:text-red-400 text-lg font-bold">
            V prípade núdze VŽDY najprv zavolajte 155 alebo 112!
          </AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-300">
            Tieto informácie slúžia ako pomocník, ale nenahrádzajú odbornú lekársku starostlivosť.
          </AlertDescription>
        </Alert>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <Card key={contact.number} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle className="text-sm">{contact.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href={`tel:${contact.number}`} className="text-3xl font-bold text-red-500 hover:text-red-600">
                    {contact.number}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* First Aid Categories */}
        <Tabs defaultValue="cpr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-8">
            {firstAidCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex-col h-auto py-3">
                  <Icon className={`h-5 w-5 mb-1 ${category.color}`} />
                  <span className="text-xs">{category.title.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {firstAidCategories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsContent key={category.id} value={category.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{category.title}</CardTitle>
                        <CardDescription>Postupujte podľa uvedených krokov</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Steps */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Postup:</h3>
                      <ol className="space-y-2">
                        {category.steps.map((step, index) => (
                          <li key={index} className={`flex gap-3 ${step.startsWith("•") ? "ml-4" : ""}`}>
                            {!step.startsWith("•") && (
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                            )}
                            <span className="flex-1 pt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Warning */}
                    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <AlertTitle className="text-yellow-700 dark:text-yellow-400">Dôležité!</AlertTitle>
                      <AlertDescription className="text-yellow-600 dark:text-yellow-300">
                        {category.warning}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Additional Information */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Často kladené otázky</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Čo mám robiť, ak si nie som istý diagnózou?</AccordionTrigger>
                <AccordionContent>
                  Vždy zavolajte 155 alebo 112. Operátori vás prevedú situáciou a poskytnú vám presné pokyny.
                  Lepšie je volať zbytočne ako neskoro.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Ako poznám, či je niekto v šoku?</AccordionTrigger>
                <AccordionContent>
                  Príznaky šoku zahŕňajú: bledú a studenú pokožku, studený pot, slabý a rýchly pulz, 
                  rýchle a plytké dýchanie, slabosť, zmätenosť, úzkosť a nevoľnosť.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Môžem byť žalovaný za poskytnutie prvej pomoci?</AccordionTrigger>
                <AccordionContent>
                  Na Slovensku platí, že ak konáte v dobrej viere a snažíte sa pomôcť v núdzovej situácii, 
                  ste chránený zákonom. Neposkytnutie pomoci je trestné.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Čo by som mal mať v lekárničke prvej pomoci?</AccordionTrigger>
                <AccordionContent>
                  Základná lekárnička by mala obsahovať: sterilné gázy, obväzy rôznych veľkostí, náplasti, 
                  elastické obväzy, nožnice, rukavice, dezinfekciu, trojuholníkový šál, pinzetu, 
                  teploměr a zoznam tiesňových telefónnych čísel.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Ako často by som mal absolvovať kurz prvej pomoci?</AccordionTrigger>
                <AccordionContent>
                  Odporúča sa opakovať kurz prvej pomoci každé 2-3 roky, pretože postupy sa môžu meniť 
                  a pravidelné opakovanie pomáha udržať zručnosti v pamäti.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="mt-8">
          <AlertDescription className="text-center">
            <strong>Upozornenie:</strong> Tieto informácie sú určené len na vzdelávacie účely a 
            nenahrádzajú formálny výcvik prvej pomoci ani odbornú lekársku starostlivosť. 
            V prípade akejkoľvek núdze vždy kontaktujte záchranné služby.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default FirstAid;