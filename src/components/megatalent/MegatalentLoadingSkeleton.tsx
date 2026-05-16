const MegatalentLoadingSkeleton = () => (
  <div className="min-h-screen bg-background pt-20 pb-12">
    <div className="container mx-auto px-4 max-w-6xl space-y-6">
      <div className="h-64 rounded-2xl bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-yellow-500/10 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-card/60 border border-border/30 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-card/60 border border-border/30 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="h-96 rounded-xl bg-card/60 border border-border/30 animate-pulse lg:col-span-1" />
        <div className="lg:col-span-3 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-card/60 border border-border/30 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MegatalentLoadingSkeleton;
