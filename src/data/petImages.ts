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
import red_panda from "@/assets/pets/red_panda.png";
import fennec_fox from "@/assets/pets/fennec_fox.png";
import axolotl from "@/assets/pets/axolotl.png";
import quokka from "@/assets/pets/quokka.png";
import sugar_glider from "@/assets/pets/sugar_glider.png";
import toucan from "@/assets/pets/toucan.png";
import peacock from "@/assets/pets/peacock.png";
import penguin from "@/assets/pets/penguin.png";
import owl from "@/assets/pets/owl.png";
import cerberus from "@/assets/pets/cerberus.png";
import chameleon from "@/assets/pets/chameleon.png";
import gecko from "@/assets/pets/gecko.png";
import dolphin from "@/assets/pets/dolphin.png";
import sea_turtle from "@/assets/pets/sea_turtle.png";
import seahorse from "@/assets/pets/seahorse.png";
import butterfly from "@/assets/pets/butterfly.png";
import ladybug from "@/assets/pets/ladybug.png";
import sloth from "@/assets/pets/sloth.png";

export const petImages: Record<string, string> = { // Mythical
  dragon,
  unicorn,
  phoenix,
  griffin,
  kitsune,
  cerberus,
  
  // Classic pets
  puppy,
  kitten,
  bunny,
  dog: puppy,
  cat: kitten,
  rabbit: bunny,
  hamster: bunny,
  
  // Exotic mammals
  red_panda,
  fennec_fox,
  quokka,
  sugar_glider,
  sloth,
  
  // Birds
  parrot,
  toucan,
  peacock,
  penguin,
  owl,
  
  // Reptiles & Amphibians
  turtle,
  chameleon,
  gecko,
  axolotl,
  
  // Marine
  dolphin,
  sea_turtle,
  seahorse,
  
  // Insects
  butterfly,
  ladybug };
