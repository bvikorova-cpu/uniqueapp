import { Coffee as CoffeeIcon, MapPin, Users, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Coffee = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Coffee Check-ins & Reviews',
      description: 'Check in at cafes, rate coffee, share photos, and earn points',
      path: '/coffee/checkins'
    },
    {
      icon: Users,
      title: 'Coffee Buddy Matching',
      description: 'Find people with similar coffee preferences for cafe visits',
      path: '/coffee/buddy'
    },
    {
      icon: Trophy,
      title: 'Leaderboard & Badges',
      description: 'Compete with other coffee lovers and earn achievements',
      path: '/coffee/leaderboard'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '€0',
      features: [
        '3 buddy matches/month',
        'Basic check-ins',
        'Standard reviews',
        'Community access'
      ]
    },
    {
      name: 'Coffee Lover',
      price: '€4.99/mo',
      features: [
        'Unlimited buddy matches',
        'Priority matching',
        'Featured reviews',
        'Analytics dashboard',
        'Ad-free experience'
      ]
    },
    {
      name: 'Coffee Expert',
      price: '€9.99/mo',
      features: [
        'Everything in Coffee Lover',
        'Event organization',
        'Premium analytics',
        'Priority support',
        'Exclusive badges'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <CoffeeIcon className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Coffee Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover cafes, connect with coffee lovers, and share your passion for the perfect brew
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/coffee/checkins')}>
              Start Exploring
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/coffee/buddy')}>
              Find Coffee Buddies
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Features</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Join our vibrant coffee community and discover new ways to enjoy your favorite beverage
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(feature.path)}>
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="mb-4">{feature.description}</CardDescription>
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  {index === 0 && (
                    <>
                      <p>• Visit cafes and log your visits</p>
                      <p>• Rate coffee quality (1-5 stars)</p>
                      <p>• Upload photos of your drinks</p>
                      <p>• Write detailed reviews</p>
                      <p>• Earn points for every check-in</p>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <p>• Answer coffee preference quiz</p>
                      <p>• AI matches you with similar users</p>
                      <p>• View match compatibility scores</p>
                      <p>• Send coffee meetup invitations</p>
                      <p>• Chat and plan cafe visits together</p>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <p>• Compete on global leaderboard</p>
                      <p>• Unlock achievement badges</p>
                      <p>• Track your coffee statistics</p>
                      <p>• Compare with other members</p>
                      <p>• Earn rewards for activity</p>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Explore →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
        <p className="text-center text-muted-foreground mb-12">Choose the plan that fits your coffee lifestyle</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={index === 1 ? 'border-primary shadow-lg' : ''}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">{plan.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={index === 1 ? 'default' : 'outline'}>
                  {index === 0 ? 'Get Started' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-primary">500+</div>
            <div className="text-muted-foreground">Cafes Listed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">10K+</div>
            <div className="text-muted-foreground">Check-ins</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">5K+</div>
            <div className="text-muted-foreground">Reviews</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">2K+</div>
            <div className="text-muted-foreground">Coffee Buddies</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Coffee;
