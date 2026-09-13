import catHi from "@/assets/stickers/cat-hi.png.asset.json";
import dogLove from "@/assets/stickers/dog-love.png.asset.json";
import lolBlob from "@/assets/stickers/lol-blob.png.asset.json";
import unicorn from "@/assets/stickers/unicorn.png.asset.json";
import pawLike from "@/assets/stickers/paw-like.png.asset.json";
import partyPenguin from "@/assets/stickers/party-penguin.png.asset.json";
import sleepyBunny from "@/assets/stickers/sleepy-bunny.png.asset.json";
import sadKitten from "@/assets/stickers/sad-kitten.png.asset.json";

export interface UniqueSticker {
  id: string;
  name: string;
  url: string;
}

/** Original Unique sticker pack — kawaii animals & moods. */
export const UNIQUE_STICKERS: UniqueSticker[] = [
  { id: "cat-hi", name: "Hi Cat", url: catHi.url },
  { id: "dog-love", name: "Puppy Love", url: dogLove.url },
  { id: "lol-blob", name: "LOL", url: lolBlob.url },
  { id: "unicorn", name: "Magic Unicorn", url: unicorn.url },
  { id: "paw-like", name: "Paw Like", url: pawLike.url },
  { id: "party-penguin", name: "Party Penguin", url: partyPenguin.url },
  { id: "sleepy-bunny", name: "Sleepy Bunny", url: sleepyBunny.url },
  { id: "sad-kitten", name: "Sad Kitten", url: sadKitten.url },
];
