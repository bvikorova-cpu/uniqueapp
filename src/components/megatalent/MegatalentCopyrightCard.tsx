import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MegatalentCopyrightCard = () => (
  <Card className="mt-12 border-yellow-500/10 backdrop-blur-xl bg-card/80">
    <CardHeader><CardTitle className="text-xl">⚖️ Copyright Protection</CardTitle></CardHeader>
    <CardContent className="space-y-4 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">Important information for all MegaTalent contest participants:</p>
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">📸 Rights to Uploaded Content:</h3>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>By uploading a post, you confirm that you are the author or have the right to publish the content</li>
          <li>You must not upload others' photos, videos, or other protected content without permission</li>
          <li>The author of the post bears full responsibility for uploading others' content</li>
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">🛡️ Our Responsibilities:</h3>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>The MegaTalent platform serves only as a space for publishing content</li>
          <li>The platform operator is not responsible for content uploaded by users</li>
          <li>In case of copyright infringement, the content will be immediately removed</li>
          <li>We reserve the right to block users who violate the rules</li>
        </ul>
      </div>
      <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-destructive font-medium">🚨 Upload only your own original content. Copyright infringement may disqualify you from the contest and expose you to legal consequences.</p>
      </div>
    </CardContent>
  </Card>
);

export default MegatalentCopyrightCard;
