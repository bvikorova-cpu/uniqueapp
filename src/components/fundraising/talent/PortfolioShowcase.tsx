import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image as ImageIcon, Play } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  images: string[];
  videoUrl?: string | null;
  portfolioUrl?: string | null;
}

export const PortfolioShowcase = ({ images, videoUrl, portfolioUrl }: Props) => {
  if ((!images || images.length === 0) && !videoUrl && !portfolioUrl) return null;

  return (
    <>
      <FloatingHowItWorks title={"Portfolio Showcase - How it works"} steps={[{ title: 'Open', desc: 'Access the Portfolio Showcase section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Portfolio Showcase.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Portfolio Showcase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {images && images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {images.map((src, i) => (
              <motion.a
                key={i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square rounded-lg overflow-hidden group relative"
              >
                <img src={src} alt={`Work ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </motion.a>
            ))}
          </div>
        )}

        {videoUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe
              src={videoUrl.replace("watch?v=", "embed/")}
              className="w-full h-full"
              allowFullScreen
              title="Performance"
            />
          </div>
        )}

        {portfolioUrl && (
          <Button variant="outline" className="w-full" asChild>
            <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" /> View full portfolio
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
    </>
  );
};
