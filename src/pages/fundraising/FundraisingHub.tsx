import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Sparkles, 
  Shield, 
  PawPrint, 
  GraduationCap, 
  AlertTriangle,
  Star,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';

export default function FundraisingHub() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'medical',
      title: '🏥 Medical Fundraising',
      description: 'Pomoc s nákladmi na liečbu a zdravotnú starostlivosť',
      icon: Heart,
      fee: '6%',
      color: 'from-red-500 to-pink-500',
      route: '/fundraising/medical',
    },
    {
      id: 'dream',
      title: '✨ Dream Maker',
      description: 'Splňte si svoje sny - štúdium, cestovanie, startup',
      icon: Sparkles,
      fee: '7%',
      color: 'from-purple-500 to-indigo-500',
      route: '/fundraising/dream',
    },
    {
      id: 'hero',
      title: '🦸 Community Hero',
      description: 'Podpora lokálnych hrdinov a ich projektov',
      icon: Shield,
      fee: '5%',
      color: 'from-blue-500 to-cyan-500',
      route: '/fundraising/hero',
    },
    {
      id: 'pet',
      title: '🐾 Pet Rescue',
      description: 'Pomoc zvieratám v núdzi',
      icon: PawPrint,
      fee: '6%',
      color: 'from-green-500 to-emerald-500',
      route: '/fundraising/pet',
    },
    {
      id: 'student',
      title: '🎓 Student Support',
      description: 'Vzájomná pomoc študentov',
      icon: GraduationCap,
      fee: '5%',
      color: 'from-yellow-500 to-orange-500',
      route: '/fundraising/student',
    },
    {
      id: 'crisis',
      title: '🆘 Crisis Relief',
      description: 'Rýchla pomoc v krízových situáciách (24-48h)',
      icon: AlertTriangle,
      fee: '8%',
      color: 'from-red-600 to-red-400',
      route: '/fundraising/crisis',
    },
    {
      id: 'talent',
      title: '🎭 Talent Sponsorship',
      description: 'Podpora mladých talentov',
      icon: Star,
      fee: '10%',
      color: 'from-pink-500 to-rose-500',
      route: '/fundraising/talent',
    },
  ];

  const features = [
    {
      icon: CheckCircle,
      title: 'Overené kampane',
      description: 'Všetky kampane prechádzajú procesom overovania',
    },
    {
      icon: Shield,
      title: 'Bezpečné platby',
      description: 'Platby spracované cez Stripe s maximálnou ochranou',
    },
    {
      icon: TrendingUp,
      title: 'Transparentné poplatky',
      description: 'Presne viete, koľko ide na podporu a koľko na platformu',
    },
    {
      icon: Users,
      title: 'Komunita',
      description: 'Pridajte sa k tisíckam ľudí, ktorí si navzájom pomáhajú',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Fundraising Hub
          </h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Pomôžte si navzájom dosiahnuť ciele a splniť sny. 7 kategórií, tisíce príležitostí podporiť dobrú vec.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/fundraising/dashboard')}>
              Moje kampane
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
              Preskúmať kategórie
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Vyberte kategóriu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(category.route)}
              >
                <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color}`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">{category.fee} fee</span>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Zobraziť kampane
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Prečo nás vybrať?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">2,000+</div>
              <div className="text-lg text-muted-foreground">Aktívnych kampaní</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">500k€+</div>
              <div className="text-lg text-muted-foreground">Vyzbieraných</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-lg text-muted-foreground">Podporovateľov</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Pripravení začať?</h2>
          <p className="text-xl mb-8 opacity-90">
            Vytvorte svoju kampaň ešte dnes a získajte podporu od komunity
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/fundraising/medical/create')}>
              Vytvoriť kampaň
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              Dozvedieť sa viac
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
