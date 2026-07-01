import { Download as DownloadIcon, FileText, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DownloadFile {
  name: string;
  description: string;
  url: string;
  size: string;
  type: "pdf" | "zip";
}

const files: DownloadFile[] = [
  {
    name: "Flyer — Visual Edition EN (PDF)",
    description: "2-page visual flyer: hero backgrounds + section image cards",
    url: "/downloads/unique-letak-visual-en-v1.pdf",
    size: "635 KB",
    type: "pdf",
  },
  {
    name: "Flyer — About the Platform EN (PDF)",
    description: "2-page A4 flyer: 14 worlds, 100+ tools",
    url: "/downloads/unique-letak-about-en-v1.pdf",
    size: "70 KB",
    type: "pdf",
  },
  {
    name: "Brochure SK (PDF)",
    description: "Slovak version of the UNIQUE brochure",
    url: "/downloads/brozura-SK.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brochure EN (PDF)",
    description: "English version of UNIQUE brochure",
    url: "/downloads/brozura-EN.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brochure HU (PDF)",
    description: "Hungarian UNIQUE brochure",
    url: "/downloads/brozura-HU.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brochure SK (ZIP)",
    description: "Slovak brochure packed in ZIP",
    url: "/downloads/brozura-SK.zip",
    size: "4.0 MB",
    type: "zip",
  },
  {
    name: "All languages (ZIP)",
    description: "SK + EN + HU brochures in one ZIP archive",
    url: "/downloads/brozury-vsetky-jazyky.zip",
    size: "12 MB",
    type: "zip",
  },
];

export default function Download() {

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Download files
          </h1>
          <p className="text-muted-foreground text-lg">
            Click on "Download" for immediate download to your device
          </p>
        </div>

        <div className="space-y-4">
          {files.map((file) => {
            const filename = file.url.split("/").pop() || "download";
            const Icon = file.type === "zip" ? Archive : FileText;
            return (
              <Card
                key={file.url}
                className="p-5 flex items-center gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{file.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {file.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{file.size}</p>
                </div>
                <Button asChild className="shrink-0" size="sm">
                  <a
                    href={file.url}
                    download={filename}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Tip: If the file opens instead of downloading, long-press the button
          and select "Download link".
        </p>
      </div>
    </div>
  );
}
