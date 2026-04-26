import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Award, Calendar, Clock, Trophy, Trash2 } from "lucide-react";
import { useUserCertificates, useDeleteCertificate } from "@/hooks/useCertificates";
import { CastleCertificate } from "@/components/fairy-castles/CastleCertificate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CertificateGallery() {
  const navigate = useNavigate();
  const { certificates, isLoading } = useUserCertificates();
  const deleteCertificate = useDeleteCertificate();
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = (certificateId: string) => {
    setCertificateToDelete(certificateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (certificateToDelete) {
      deleteCertificate.mutate(certificateToDelete);
      setDeleteDialogOpen(false);
      setCertificateToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/kids-channel/fairy-castles")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Castles
        </Button>

        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full">
            <Award className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              My Certificates
            </h1>
            <p className="text-muted-foreground">
              Your collection of magical achievements
            </p>
          </div>
        </div>

        {/* Stats */}
        {certificates && certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tours</p>
                  <p className="text-2xl font-bold">{certificates.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Milestones</p>
                  <p className="text-2xl font-bold">
                    {certificates.reduce((sum, cert) => sum + (cert.unlocked_milestones?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold">
                    {formatTime(certificates.reduce((sum, cert) => sum + cert.completion_time_ms, 0))}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Certificates Grid */}
      <div className="max-w-6xl mx-auto">
        {!certificates || certificates.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
            <div className="mb-4">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete castle tours to earn your first certificate!
              </p>
              <Button onClick={() => navigate("/kids-channel/fairy-castles")}>
                Explore Castles
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate: any) => (
              <Card
                key={certificate.id}
                className="group overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Certificate Preview */}
                <div
                  onClick={() => setSelectedCertificate(certificate)}
                  className="relative aspect-[4/3] bg-gradient-to-br from-amber-100 via-white to-purple-100 p-6 flex flex-col items-center justify-center border-b-4 border-amber-300"
                >
                  <div className="text-center">
                    <Award className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-bold text-lg line-clamp-2 text-foreground">
                      {certificate.castle?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Certificate of Achievement
                    </p>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-foreground font-semibold">Click to view</p>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(certificate.completed_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatTime(certificate.completion_time_ms)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {certificate.unlocked_milestones?.length || 0} Milestones
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => setSelectedCertificate(certificate)}
                      className="flex-1"
                      size="sm"
                    >
                      View & Share
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(certificate.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Viewer */}
      {selectedCertificate && (
        <CastleCertificate
          castleName={selectedCertificate.castle?.name || ""}
          completionTime={selectedCertificate.completion_time_ms}
          unlockedMilestones={selectedCertificate.unlocked_milestones || []}
          totalRooms={selectedCertificate.total_rooms}
          isVisible={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certificate?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this certificate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
