import { Heart, Clock, Shield } from "lucide-react";

export function AnonymousDateHeader() {
  return (
    <div className="text-center space-y-4 mb-8">
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full">
          <Heart className="h-12 w-12 text-white" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
        Anonymous Date
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
        Find love without revealing your identity. Chat for 7 days before the big reveal!
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8 px-4">
        <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
          <Shield className="h-8 w-8 text-pink-500 mb-2" />
          <h3 className="font-semibold text-sm">Anonymous</h3>
          <p className="text-xs text-muted-foreground text-center">Your identity stays hidden</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
          <Clock className="h-8 w-8 text-purple-500 mb-2" />
          <h3 className="font-semibold text-sm">7 Days</h3>
          <p className="text-xs text-muted-foreground text-center">Get to know each other first</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
          <Heart className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="font-semibold text-sm">True Connection</h3>
          <p className="text-xs text-muted-foreground text-center">Focus on personality</p>
        </div>
      </div>
    </div>
  );
}