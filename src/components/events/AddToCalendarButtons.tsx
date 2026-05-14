import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadIcs, googleCalendarLink, type IcsEvent } from "@/lib/calendarExport";

interface Props {
  event: IcsEvent;
}

export const AddToCalendarButtons = ({ event }: Props) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => downloadIcs(event)} className="gap-2">
        <Download className="h-4 w-4" />
        .ics
      </Button>
      <Button variant="outline" size="sm" asChild className="gap-2">
        <a href={googleCalendarLink(event)} target="_blank" rel="noreferrer">
          <Calendar className="h-4 w-4" />
          Google
        </a>
      </Button>
    </div>
  );
};
