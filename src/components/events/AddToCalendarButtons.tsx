import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadIcs, googleCalendarLink, type IcsEvent } from "@/lib/calendarExport";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  event: IcsEvent;
}

export const AddToCalendarButtons = ({ event }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Add To Calendar Buttons - How it works"} steps={[{ title: 'Open', desc: 'Access the Add To Calendar Buttons section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Add To Calendar Buttons.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
};
