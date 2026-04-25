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
    name: "Brožúra SK (PDF)",
    description: "Slovenská verzia brožúry UNIQUE",
    url: "/downloads/brozura-SK.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brožúra EN (PDF)",
    description: "English version of UNIQUE brochure",
    url: "/downloads/brozura-EN.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brožúra HU (PDF)",
    description: "Magyar UNIQUE brosúra",
    url: "/downloads/brozura-HU.pdf",
    size: "4.7 MB",
    type: "pdf",
  },
  {
    name: "Brožúra SK (ZIP)",
    description: "Slovenská brožúra zabalená v ZIP",
    url: "/downloads/brozura-SK.zip",
    size: "4.0 MB",
    type: "zip",
  },
  {
    name: "Všetky jazyky (ZIP)",
    description: "SK + EN + HU brožúry v jednom ZIP archíve",
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
            Stiahnuť súbory
          </h1>
          <p className="text-muted-foreground text-lg">
            Klikni na „Stiahnuť" pre okamžité stiahnutie do zariadenia
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
                    Stiahnuť
                  </a>
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Tip: Ak sa súbor otvorí namiesto stiahnutia, podrž prst na tlačidle
          a vyber „Stiahnuť odkaz".
        </p>
      </div>
    </div>
  );
}
