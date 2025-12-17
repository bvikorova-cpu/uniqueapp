// Static pet images mapping
import dragon from "@/assets/pets/dragon.png";
import unicorn from "@/assets/pets/unicorn.png";
import phoenix from "@/assets/pets/phoenix.png";
import griffin from "@/assets/pets/griffin.png";
import kitsune from "@/assets/pets/kitsune.png";
import parrot from "@/assets/pets/parrot.png";
import turtle from "@/assets/pets/turtle.png";
import puppy from "@/assets/pets/puppy.png";
import kitten from "@/assets/pets/kitten.png";
import bunny from "@/assets/pets/bunny.png";

export const petImages: Record<string, string> = {
  dragon,
  unicorn,
  phoenix,
  griffin,
  kitsune,
  parrot,
  turtle,
  puppy,
  kitten,
  bunny,
  hamster: bunny, // fallback
};
