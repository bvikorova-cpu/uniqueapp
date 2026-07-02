import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Bell, BellRing, MapPin, DollarSign, Home, Trash2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface Alert {
  id: string;
  location: string;
  type: string;
  maxPrice: string;
  minArea: string;
  enabled: boolean;
}

export const PropertyAlerts = ({ onBack }: Props) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ location: "", type: "", maxPrice: "", minArea: "" });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    priceDrops: true,
    newListings: true,
    openHouses: false,
  });

  const handleAddAlert = () => {
    if (!newAlert.location) {
      toast.error("Please enter a location");
      return;
    }
    setAlerts(prev => [...prev, { ...newAlert, id: Date.now().toString(), enabled: true }]);
    setNewAlert({ location: "", type: "", maxPrice: "", minArea: "" });
    setShowForm(false);
    toast.success("Alert created! You'll be notified of matching properties.");
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success("Alert removed");
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <>
      <FloatingHowItWorks title={"Property Alerts - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Alerts section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Alerts.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="backdrop-blur-xl bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            <BellRing className="w-6 h-6 text-amber-500" />
            Property Alerts
          </CardTitle>
          <p className="text-sm text-muted-foreground">Get notified when properties matching your criteria are listed</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Settings */}
          <Card className="bg-card/60 border-border/30">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Notification Preferences
              </h3>
              {[
                { key: "email", label: "Email Notifications", desc: "Receive alerts via email" },
                { key: "push", label: "Push Notifications", desc: "Browser push alerts" },
                { key: "priceDrops", label: "Price Drop Alerts", desc: "When saved properties drop in price" },
                { key: "newListings", label: "New Listing Alerts", desc: "When matching properties are listed" },
                { key: "openHouses", label: "Open House Alerts", desc: "Upcoming viewing events" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Active Alerts ({alerts.length})</h3>
              <Button size="sm" onClick={() => setShowForm(true)} className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Plus className="w-3 h-3 mr-1" /> New Alert
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Location *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 w-3 h-3 text-muted-foreground" />
                            <Input placeholder="City..." className="pl-7 h-9 text-sm" value={newAlert.location} onChange={e => setNewAlert({...newAlert, location: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Property Type</Label>
                          <Select value={newAlert.type} onValueChange={v => setNewAlert({...newAlert, type: v})}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Any" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Max Price (€)</Label>
                          <Input type="number" placeholder="200000" className="h-9 text-sm" value={newAlert.maxPrice} onChange={e => setNewAlert({...newAlert, maxPrice: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Min Area (m²)</Label>
                          <Input type="number" placeholder="50" className="h-9 text-sm" value={newAlert.minArea} onChange={e => setNewAlert({...newAlert, minArea: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddAlert}>Create Alert</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {alerts.length === 0 && !showForm ? (
              <Card className="bg-card/60 border-border/30">
                <CardContent className="p-8 text-center">
                  <BellRing className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                  <p className="text-xs text-muted-foreground">Create an alert to get notified of matching properties</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map(alert => (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className={`border-border/30 ${alert.enabled ? "bg-card/60" : "bg-card/30 opacity-60"}`}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sky-500" /> {alert.location}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {alert.type || "Any type"} • {alert.maxPrice ? `Max €${parseInt(alert.maxPrice).toLocaleString()}` : "Any price"} • {alert.minArea ? `${alert.minArea}+ m²` : "Any size"}
                          </p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveAlert(alert.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
