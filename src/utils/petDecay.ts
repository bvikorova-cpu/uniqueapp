// Pet stats decay system - reduces hunger/happiness/energy over time

export const DECAY_INTERVAL_HOURS = 6; // Decay occurs every 6 hours
export const DECAY_AMOUNT = 15; // Amount to decrease per decay interval

export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  last_fed_at: string | null;
  last_played_at: string | null;
  last_activity_at: string | null;
}

export const calculateDecay = (pet: PetStats) => {
  const now = new Date();
  
  // Calculate hunger decay (based on last_fed_at)
  const lastFed = pet.last_fed_at ? new Date(pet.last_fed_at) : null;
  const hoursSinceLastFed = lastFed 
    ? (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60)
    : 0;
  const hungerDecayIntervals = Math.floor(hoursSinceLastFed / DECAY_INTERVAL_HOURS);
  const newHunger = Math.max(0, pet.hunger - (hungerDecayIntervals * DECAY_AMOUNT));

  // Calculate happiness decay (based on last_played_at)
  const lastPlayed = pet.last_played_at ? new Date(pet.last_played_at) : null;
  const hoursSinceLastPlayed = lastPlayed 
    ? (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60)
    : 0;
  const happinessDecayIntervals = Math.floor(hoursSinceLastPlayed / DECAY_INTERVAL_HOURS);
  const newHappiness = Math.max(0, pet.happiness - (happinessDecayIntervals * DECAY_AMOUNT));

  // Calculate energy decay (based on last_activity_at)
  const lastActivity = pet.last_activity_at ? new Date(pet.last_activity_at) : null;
  const hoursSinceLastActivity = lastActivity 
    ? (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
    : 0;
  const energyDecayIntervals = Math.floor(hoursSinceLastActivity / DECAY_INTERVAL_HOURS);
  const newEnergy = Math.max(0, pet.energy - (energyDecayIntervals * DECAY_AMOUNT));

  const needsUpdate = 
    newHunger !== pet.hunger || 
    newHappiness !== pet.happiness || 
    newEnergy !== pet.energy;

  return {
    hunger: newHunger,
    happiness: newHappiness,
    energy: newEnergy,
    needsUpdate,
  };
};
