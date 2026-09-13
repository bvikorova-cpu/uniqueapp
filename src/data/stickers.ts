import catHi from "@/assets/stickers/cat-hi.png.asset.json";
import dogLove from "@/assets/stickers/dog-love.png.asset.json";
import lolBlob from "@/assets/stickers/lol-blob.png.asset.json";
import unicorn from "@/assets/stickers/unicorn.png.asset.json";
import pawLike from "@/assets/stickers/paw-like.png.asset.json";
import partyPenguin from "@/assets/stickers/party-penguin.png.asset.json";
import sleepyBunny from "@/assets/stickers/sleepy-bunny.png.asset.json";
import sadKitten from "@/assets/stickers/sad-kitten.png.asset.json";

import autPumpkin from "@/assets/stickers/aut-pumpkin.png.asset.json";
import autGhost from "@/assets/stickers/aut-ghost.png.asset.json";
import autSquirrel from "@/assets/stickers/aut-squirrel.png.asset.json";
import autWitchCat from "@/assets/stickers/aut-witch-cat.png.asset.json";
import autLatte from "@/assets/stickers/aut-latte.png.asset.json";
import autHedgehog from "@/assets/stickers/aut-hedgehog.png.asset.json";
import autBat from "@/assets/stickers/aut-bat.png.asset.json";
import autCandy from "@/assets/stickers/aut-candy.png.asset.json";

import xmasTree from "@/assets/stickers/xmas-tree.png.asset.json";
import xmasSnowman from "@/assets/stickers/xmas-snowman.png.asset.json";
import xmasReindeer from "@/assets/stickers/xmas-reindeer.png.asset.json";
import xmasGift from "@/assets/stickers/xmas-gift.png.asset.json";
import xmasCocoa from "@/assets/stickers/xmas-cocoa.png.asset.json";
import xmasPenguin from "@/assets/stickers/xmas-penguin.png.asset.json";
import xmasGingerbread from "@/assets/stickers/xmas-gingerbread.png.asset.json";
import xmasSnowflake from "@/assets/stickers/xmas-snowflake.png.asset.json";

import loveHeart from "@/assets/stickers/love-heart.png.asset.json";
import loveHugBears from "@/assets/stickers/love-hug-bears.png.asset.json";
import loveKissCat from "@/assets/stickers/love-kiss-cat.png.asset.json";
import loveRoses from "@/assets/stickers/love-roses.png.asset.json";
import loveLetter from "@/assets/stickers/love-letter.png.asset.json";
import loveBunny from "@/assets/stickers/love-bunny.png.asset.json";
import loveBroken from "@/assets/stickers/love-broken.png.asset.json";
import loveBalloons from "@/assets/stickers/love-balloons.png.asset.json";

import funRofl from "@/assets/stickers/fun-rofl.png.asset.json";
import funShock from "@/assets/stickers/fun-shock.png.asset.json";
import funCool from "@/assets/stickers/fun-cool.png.asset.json";
import funShrug from "@/assets/stickers/fun-shrug.png.asset.json";
import funFacepalm from "@/assets/stickers/fun-facepalm.png.asset.json";
import funAwkward from "@/assets/stickers/fun-awkward.png.asset.json";
import funSideeye from "@/assets/stickers/fun-sideeye.png.asset.json";
import funSleep from "@/assets/stickers/fun-sleep.png.asset.json";

import taleFairy from "@/assets/stickers/tale-fairy.png.asset.json";
import taleDragon from "@/assets/stickers/tale-dragon.png.asset.json";
import taleCrown from "@/assets/stickers/tale-crown.png.asset.json";
import taleWizardOwl from "@/assets/stickers/tale-wizard-owl.png.asset.json";
import taleCastle from "@/assets/stickers/tale-castle.png.asset.json";
import taleMermaid from "@/assets/stickers/tale-mermaid.png.asset.json";
import talePotion from "@/assets/stickers/tale-potion.png.asset.json";
import taleFrogPrince from "@/assets/stickers/tale-frog-prince.png.asset.json";

import partyCake from "@/assets/stickers/party-cake.png.asset.json";
import partyPopper from "@/assets/stickers/party-popper.png.asset.json";
import partyBalloons from "@/assets/stickers/party-balloons.png.asset.json";
import partyCheers from "@/assets/stickers/party-cheers.png.asset.json";
import partyTrophy from "@/assets/stickers/party-trophy.png.asset.json";
import partyDisco from "@/assets/stickers/party-disco.png.asset.json";
import partyFireworks from "@/assets/stickers/party-fireworks.png.asset.json";
import partyGiftbag from "@/assets/stickers/party-giftbag.png.asset.json";

export interface UniqueSticker {
  id: string;
  name: string;
  url: string;
}

export interface StickerPack {
  id: string;
  name: string;
  emoji: string;
  stickers: UniqueSticker[];
}

/** Original Unique sticker packs — all artwork created for Unique. */
export const STICKER_PACKS: StickerPack[] = [
  {
    id: "classic",
    name: "Unique Classics",
    emoji: "⭐",
    stickers: [
      { id: "cat-hi", name: "Hi Cat", url: catHi.url },
      { id: "dog-love", name: "Puppy Love", url: dogLove.url },
      { id: "lol-blob", name: "LOL", url: lolBlob.url },
      { id: "unicorn", name: "Magic Unicorn", url: unicorn.url },
      { id: "paw-like", name: "Paw Like", url: pawLike.url },
      { id: "party-penguin", name: "Party Penguin", url: partyPenguin.url },
      { id: "sleepy-bunny", name: "Sleepy Bunny", url: sleepyBunny.url },
      { id: "sad-kitten", name: "Sad Kitten", url: sadKitten.url },
    ],
  },
  {
    id: "autumn",
    name: "Autumn & Halloween",
    emoji: "🍂",
    stickers: [
      { id: "aut-pumpkin", name: "Happy Pumpkin", url: autPumpkin.url },
      { id: "aut-ghost", name: "Friendly Ghost", url: autGhost.url },
      { id: "aut-squirrel", name: "Acorn Squirrel", url: autSquirrel.url },
      { id: "aut-witch-cat", name: "Witch Cat", url: autWitchCat.url },
      { id: "aut-latte", name: "Autumn Latte", url: autLatte.url },
      { id: "aut-hedgehog", name: "Leaf Hedgehog", url: autHedgehog.url },
      { id: "aut-bat", name: "Little Bat", url: autBat.url },
      { id: "aut-candy", name: "Candy Bucket", url: autCandy.url },
    ],
  },
  {
    id: "winter",
    name: "Christmas & Winter",
    emoji: "🎄",
    stickers: [
      { id: "xmas-tree", name: "Christmas Tree", url: xmasTree.url },
      { id: "xmas-snowman", name: "Snowman", url: xmasSnowman.url },
      { id: "xmas-reindeer", name: "Baby Reindeer", url: xmasReindeer.url },
      { id: "xmas-gift", name: "Gift Box", url: xmasGift.url },
      { id: "xmas-cocoa", name: "Hot Cocoa", url: xmasCocoa.url },
      { id: "xmas-penguin", name: "Winter Penguin", url: xmasPenguin.url },
      { id: "xmas-gingerbread", name: "Gingerbread", url: xmasGingerbread.url },
      { id: "xmas-snowflake", name: "Snowflake", url: xmasSnowflake.url },
    ],
  },
  {
    id: "love",
    name: "Love & Romance",
    emoji: "💕",
    stickers: [
      { id: "love-heart", name: "Happy Heart", url: loveHeart.url },
      { id: "love-hug-bears", name: "Bear Hug", url: loveHugBears.url },
      { id: "love-kiss-cat", name: "Kiss Cat", url: loveKissCat.url },
      { id: "love-roses", name: "Roses", url: loveRoses.url },
      { id: "love-letter", name: "Love Letter", url: loveLetter.url },
      { id: "love-bunny", name: "Heart Bunny", url: loveBunny.url },
      { id: "love-broken", name: "Broken Heart", url: loveBroken.url },
      { id: "love-balloons", name: "Heart Balloons", url: loveBalloons.url },
    ],
  },
  {
    id: "reactions",
    name: "Funny Reactions",
    emoji: "😂",
    stickers: [
      { id: "fun-rofl", name: "ROFL", url: funRofl.url },
      { id: "fun-shock", name: "Shocked", url: funShock.url },
      { id: "fun-cool", name: "Too Cool", url: funCool.url },
      { id: "fun-shrug", name: "No Idea", url: funShrug.url },
      { id: "fun-facepalm", name: "Facepalm", url: funFacepalm.url },
      { id: "fun-awkward", name: "Awkward", url: funAwkward.url },
      { id: "fun-sideeye", name: "Side Eye", url: funSideeye.url },
      { id: "fun-sleep", name: "Zzz", url: funSleep.url },
    ],
  },
  {
    id: "fairytale",
    name: "Fairytale",
    emoji: "🧚",
    stickers: [
      { id: "tale-fairy", name: "Little Fairy", url: taleFairy.url },
      { id: "tale-dragon", name: "Baby Dragon", url: taleDragon.url },
      { id: "tale-crown", name: "Golden Crown", url: taleCrown.url },
      { id: "tale-wizard-owl", name: "Wizard Owl", url: taleWizardOwl.url },
      { id: "tale-castle", name: "Castle", url: taleCastle.url },
      { id: "tale-mermaid", name: "Mermaid", url: taleMermaid.url },
      { id: "tale-potion", name: "Magic Potion", url: talePotion.url },
      { id: "tale-frog-prince", name: "Frog Prince", url: taleFrogPrince.url },
    ],
  },
  {
    id: "party",
    name: "Party & Congrats",
    emoji: "🎉",
    stickers: [
      { id: "party-cake", name: "Birthday Cake", url: partyCake.url },
      { id: "party-popper", name: "Party Popper", url: partyPopper.url },
      { id: "party-balloons", name: "Balloons", url: partyBalloons.url },
      { id: "party-cheers", name: "Cheers", url: partyCheers.url },
      { id: "party-trophy", name: "Trophy", url: partyTrophy.url },
      { id: "party-disco", name: "Disco Ball", url: partyDisco.url },
      { id: "party-fireworks", name: "Fireworks", url: partyFireworks.url },
      { id: "party-giftbag", name: "Gift Bag", url: partyGiftbag.url },
    ],
  },
];

/** Flat list of every Unique sticker. */
export const UNIQUE_STICKERS: UniqueSticker[] = STICKER_PACKS.flatMap((p) => p.stickers);
