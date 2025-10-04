import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Zásady a podmienky používania
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Všeobecné ustanovenia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Tieto všeobecné obchodné podmienky upravujú vzťah medzi prevádzkovateľom platformy 
              a užívateľmi služieb poskytovaných na tejto stránke.
            </p>
            <p>
              Používaním týchto služieb vyjadrujete súhlas s týmito podmienkami.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Registrácia a užívateľský účet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Pre plné využívanie služieb je potrebná registrácia. Užívateľ je povinný 
              poskytnúť pravdivé a aktuálne údaje.
            </p>
            <p>
              Užívateľ je zodpovedný za zabezpečenie svojho účtu a hesla. Akékoľvek aktivity 
              vykonané z vášho účtu sú považované za vaše vlastné.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Pravidlá správania</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Užívateľ sa zaväzuje:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Nepoužívať platformu na nezákonné účely</li>
              <li>Neuverejňovať urážlivý, hanlivý alebo nevhodný obsah</li>
              <li>Rešpektovať práva iných užívateľov</li>
              <li>Nepodieľať sa na spame alebo podvodných aktivitách</li>
              <li>Neporušovať autorské práva a práva duševného vlastníctva</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Obsah a duševné vlastníctvo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Užívateľ si zachováva všetky práva k obsahu, ktorý nahráva na platformu. 
              Poskytnutím obsahu však udeľujete platforme licenciu na jeho zobrazenie a distribúciu.
            </p>
            <p>
              Platforma si vyhradzuje právo odstrániť akýkoľvek obsah, ktorý porušuje 
              tieto podmienky alebo platné zákony.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Platby a predplatné</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Niektoré služby môžu vyžadovať platbu. Ceny sú uvedené pri jednotlivých službách.
            </p>
            <p>
              Platby sú spracované prostredníctvom zabezpečených platobných brán. 
              Vrátenie peňazí sa riadi podmienkami uvedenými pri konkrétnej službe.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Ochrana osobných údajov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Spracovanie osobných údajov je v súlade s GDPR a platnými zákonmi o ochrane 
              osobných údajov.
            </p>
            <p>
              Vaše údaje používame len na poskytovanie služieb a ich zlepšovanie. 
              Podrobnosti nájdete v našich zásadách ochrany osobných údajov.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Obmedzenie zodpovednosti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Platforma poskytuje služby "tak ako sú" bez akýchkoľvek záruk. 
              Nenesieme zodpovednosť za:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Obsah vytvorený užívateľmi</li>
              <li>Technické problémy alebo výpadky služby</li>
              <li>Priame alebo nepriame škody vzniknuté používaním platformy</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Ukončenie účtu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Užívateľ môže kedykoľvek zrušiť svoj účet. Platforma si vyhradzuje právo 
              pozastaviť alebo zrušiť účty, ktoré porušujú tieto podmienky.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Zmeny podmienok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Platforma si vyhradzuje právo kedykoľvek upraviť tieto podmienky. 
              O zmenách budeme užívateľov informovať.
            </p>
            <p>
              Pokračovaním v používaní služieb po zmenách vyjadrujete súhlas s novými podmienkami.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              V prípade otázok týkajúcich sa týchto podmienok nás môžete kontaktovať 
              prostredníctvom kontaktného formulára na stránke.
            </p>
            <p className="text-sm text-muted-foreground mt-8">
              Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
