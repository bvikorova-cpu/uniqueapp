import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Props {
  media: { url: string; type: 'image' | 'video' } | null;
  onClose: () => void;
}

const MegatalentExpandedMediaDialog = ({ media, onClose }: Props) => (
  <Dialog open={!!media} onOpenChange={onClose}>
    <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0">
      <div className="relative flex items-center justify-center bg-black/95">
        {media?.type === 'image' ? <img src={media.url} alt="Expanded" className="max-w-full max-h-[95vh] object-contain" /> : media?.type === 'video' ? <video src={media.url} controls autoPlay className="max-w-full max-h-[95vh]" /> : null}
      </div>
    </DialogContent>
  </Dialog>
);

export default MegatalentExpandedMediaDialog;
