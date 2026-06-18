import MonetagInFeedAd from "@/components/ads/MonetagInFeedAd";

const AdPreview = () => (
  <div className="min-h-screen bg-background p-6 flex items-center justify-center">
    <div className="w-full max-w-md">
      <MonetagInFeedAd slotIndex={1} />
    </div>
  </div>
);

export default AdPreview;
