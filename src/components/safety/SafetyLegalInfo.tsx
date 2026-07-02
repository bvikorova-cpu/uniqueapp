import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Scale, Globe, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const legalInfo = [
  {
    country: "United States",
    flag: "🇺🇸",
    laws: [
      {
        title: "Federal Laws",
        content: "While no federal law directly addresses bullying, civil rights laws cover harassment based on race, color, national origin, sex, disability, or religion. Title IX covers sexual harassment in schools."
      },
      {
        title: "State Laws",
        content: "All 50 states have anti-bullying laws. Most require schools to have anti-bullying policies. Many states have cyberbullying laws with criminal penalties."
      },
      {
        title: "Your Rights",
        content: "Right to a safe school environment, right to report without retaliation, right to accommodations if bullying affects learning."
      }
    ],
    resources: [
      { name: "StopBullying.gov", url: "https://www.stopbullying.gov" },
      { name: "US Department of Education", url: "https://www.ed.gov" }
    ]
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    laws: [
      {
        title: "Education Act 2002",
        content: "Schools must have policies to prevent bullying. Headteachers can discipline pupils for bullying outside school."
      },
      {
        title: "Malicious Communications Act 1988",
        content: "Covers cyberbullying - sending electronic communications intended to cause distress is a criminal offense."
      },
      {
        title: "Your Rights",
        content: "Right to complain to school governors, right to involve local authority if school doesn't act."
      }
    ],
    resources: [
      { name: "Anti-Bullying Alliance", url: "https://anti-bullyingalliance.org.uk" },
      { name: "Childline UK", url: "https://www.childline.org.uk" }
    ]
  },
  {
    country: "European Union",
    flag: "🇪🇺",
    laws: [
      {
        title: "Charter of Fundamental Rights",
        content: "Article 24 protects children's wellbeing. Member states must ensure protection from violence and abuse."
      },
      {
        title: "GDPR Protections",
        content: "Right to erasure of personal data can be used against cyberbullying content. Platforms must remove illegal content."
      },
      {
        title: "National Laws",
        content: "Each EU country has specific anti-bullying legislation. Many have criminal penalties for severe bullying."
      }
    ],
    resources: [
      { name: "EU Kids Online", url: "https://www.lse.ac.uk/media-and-communications/research/research-projects/eu-kids-online" },
      { name: "Better Internet for Kids", url: "https://www.betterinternetforkids.eu" }
    ]
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    laws: [
      {
        title: "Criminal Code",
        content: "Criminal harassment (264), uttering threats (264.1), and defamatory libel can apply to bullying. Cyberbullying can be prosecuted under these laws."
      },
      {
        title: "Provincial Education Acts",
        content: "All provinces have anti-bullying legislation requiring schools to have prevention programs and reporting mechanisms."
      },
      {
        title: "Your Rights",
        content: "Right to safe learning environment, right to report to police if criminal, right to human rights complaint if discrimination-based."
      }
    ],
    resources: [
      { name: "PREVNet", url: "https://www.prevnet.ca" },
      { name: "Kids Help Phone", url: "https://kidshelpphone.ca" }
    ]
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    laws: [
      {
        title: "Online Safety Act 2021",
        content: "eSafety Commissioner can order removal of cyberbullying content within 24 hours. Civil penalties for non-compliance."
      },
      {
        title: "State Education Laws",
        content: "All states require schools to have anti-bullying policies. Some have mandatory reporting requirements."
      },
      {
        title: "Your Rights",
        content: "Right to report to eSafety Commissioner, right to safe workplace under Work Health and Safety Act."
      }
    ],
    resources: [
      { name: "eSafety Commissioner", url: "https://www.esafety.gov.au" },
      { name: "Bullying. No Way!", url: "https://bullyingnoway.gov.au" }
    ]
  }
];

const SafetyLegalInfo = () => {
  return (
    <>
      <FloatingHowItWorks title={"Safety Legal Info - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Legal Info section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Legal Info.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Legal Information by Country
          </CardTitle>
          <CardDescription>
            Know your rights. Understanding the law can help you take appropriate action against bullying.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-400">Legal Disclaimer</p>
              <p className="text-sm text-muted-foreground">
                This information is for educational purposes only and does not constitute legal advice. 
                Laws change frequently. Always consult a qualified legal professional for specific situations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {legalInfo.map((country) => (
          <Card key={country.country}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{country.flag}</span>
                {country.country}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {country.laws.map((law, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {law.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{law.content}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Globe className="h-4 w-4" /> Official Resources
                </p>
                <div className="flex flex-wrap gap-2">
                  {country.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {resource.name}
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Universal Rights */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Universal Rights Under International Law
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">UN Convention on Rights of the Child</h4>
              <p className="text-sm text-muted-foreground">
                Article 19: Protection from all forms of violence, injury, abuse, and maltreatment.
                Article 28: Right to education in a manner consistent with human dignity.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Universal Declaration of Human Rights</h4>
              <p className="text-sm text-muted-foreground">
                Article 1: All humans are born free and equal in dignity.
                Article 3: Right to life, liberty, and security of person.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default SafetyLegalInfo;
