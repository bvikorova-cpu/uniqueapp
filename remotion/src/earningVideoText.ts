export type EarningLang = "en" | "sk" | "hu";

export interface EarningSceneCopy {
  kicker: string;
  title: string;
  line: string;
  proof: string;
  images: string[];
  accent: string;
}

export interface EarningVideoCopy {
  headline: string;
  subhead: string;
  scenes: EarningSceneCopy[];
  closing: string;
  closingLine: string;
  voice: string;
}

const images = {
  stock: ["stocklibrary.jpg"],
  compete: ["megatalent.jpg", "eco.jpg"],
  sell: ["bazaar.jpg", "skillsmarketplace.jpg"],
  creator: ["unlockvideos.jpg", "influking.jpg"],
  community: ["socialgifts.jpg"],
  teach: ["tutorialcourses.jpg", "education.jpg"],
  invite: ["invitefriends.jpg"],
};

export const EARNING_COPY: Record<EarningLang, EarningVideoCopy> = {
  en: {
    headline: "MORE WAYS TO EARN",
    subhead: "Create. Compete. Sell. Grow.",
    voice: "earning-video/voice/en.mp3",
    closing: "YOUR TALENT HAS VALUE",
    closingLine: "Discover your way to earn on Unique.",
    scenes: [
      { kicker: "STOCK CONTENT", title: "CREATE ONCE. SELL AGAIN.", line: "Upload your original photos, videos and audio. Earn whenever another creator downloads your work.", proof: "70% CREATOR SHARE", images: images.stock, accent: "#56D6C9" },
      { kicker: "MEGATALENT", title: "TAKE THE STAGE.", line: "Enter with your talent, win community support and compete for the quarterly prize pool.", proof: "TALENT • VOTES • PRIZES", images: ["megatalent.jpg"], accent: "#F4C85A" },
      { kicker: "CHALLENGES", title: "PROGRESS CAN PAY.", line: "Join Eco and Health challenges, prove your progress and compete for the champion's share.", proof: "50% TO THE CHAMPION", images: ["eco.jpg", "health.jpg"], accent: "#62D989" },
      { kicker: "MARKETPLACES", title: "SELL WHAT YOU HAVE.", line: "List items in Bazaar or offer your skills. Choose direct contact or protected payment.", proof: "GOODS • SERVICES • ESCROW", images: images.sell, accent: "#FF7BA7" },
      { kicker: "CREATOR CONTENT", title: "TURN VIEWS INTO VALUE.", line: "Offer exclusive videos, subscriptions and tips. Build loyal fans and recurring creator income.", proof: "PPV • MEMBERSHIPS • TIPS", images: images.creator, accent: "#B78BFF" },
      { kicker: "UNIQUE GIFTS", title: "LET FANS SUPPORT YOU.", line: "Receive animated gifts in posts, chats and live moments, with eligible value paid in euros.", proof: "50% OF ELIGIBLE GIFTS", images: images.community, accent: "#FF6FAE" },
      { kicker: "COURSES & MUSIC", title: "SHARE WHAT YOU KNOW.", line: "Create courses, publish tutorials or release music. Earn through enrollments and streams.", proof: "KNOWLEDGE • MUSIC • ROYALTIES", images: images.teach, accent: "#6EA8FF" },
      { kicker: "INVITE FRIENDS", title: "GROW TOGETHER.", line: "Invite friends who start an eligible subscription and receive a recurring referral reward.", proof: "€5 PER ELIGIBLE FRIEND", images: images.invite, accent: "#FF9A62" },
    ],
  },
  sk: {
    headline: "VIAC MOŽNOSTÍ ZÁROBKU",
    subhead: "Tvor. Súťaž. Predávaj. Napreduj.",
    voice: "earning-video/voice/sk.mp3",
    closing: "TVOJ TALENT MÁ HODNOTU",
    closingLine: "Objav svoj spôsob zárobku na Unique.",
    scenes: [
      { kicker: "STOCK CONTENT", title: "VYTVOR RAZ. PREDÁVAJ OPAKOVANE.", line: "Nahraj vlastné fotky, videá a audio. Zarábaj, keď si tvoju tvorbu stiahne ďalší používateľ.", proof: "70 % PRE TVORCU", images: images.stock, accent: "#56D6C9" },
      { kicker: "MEGATALENT", title: "VSTÚP NA PÓDIUM.", line: "Ukáž svoj talent, získaj podporu komunity a súťaž o podiel zo štvrťročnej výhry.", proof: "TALENT • HLASY • VÝHRY", images: ["megatalent.jpg"], accent: "#F4C85A" },
      { kicker: "CHALLENGES", title: "POKROK SA MÔŽE VYPLATIŤ.", line: "Zapoj sa do Eco a Health výziev, dokáž svoj pokrok a súťaž o podiel pre víťaza.", proof: "50 % PRE VÍŤAZA", images: ["eco.jpg", "health.jpg"], accent: "#62D989" },
      { kicker: "MARKETPLACES", title: "PREDÁVAJ VECI AJ SLUŽBY.", line: "Ponúkni veci v Bazaare alebo svoje schopnosti. Vyber si priamy kontakt či chránenú platbu.", proof: "TOVAR • SLUŽBY • ESCROW", images: images.sell, accent: "#FF7BA7" },
      { kicker: "OBSAH TVORCOV", title: "PREMEŇ POZORNOSŤ NA HODNOTU.", line: "Ponúkni exkluzívne videá, predplatné a tipy. Buduj verných fanúšikov aj pravidelný príjem.", proof: "PPV • ČLENSTVÁ • TIPY", images: images.creator, accent: "#B78BFF" },
      { kicker: "UNIQUE GIFTS", title: "PODPORA OD FANÚŠIKOV.", line: "Prijímaj animované darčeky v príspevkoch, chatoch a živých momentoch s výplatou oprávnenej hodnoty v eurách.", proof: "50 % Z OPRÁVNENÝCH DARČEKOV", images: images.community, accent: "#FF6FAE" },
      { kicker: "KURZY A HUDBA", title: "ZÚROČ SVOJE VEDOMOSTI.", line: "Vytváraj kurzy, publikuj návody alebo hudbu. Zarábaj cez zápisy študentov a prehratia.", proof: "VEDOMOSTI • HUDBA • ROYALTY", images: images.teach, accent: "#6EA8FF" },
      { kicker: "POZVI PRIATEĽOV", title: "RASTITE SPOLOČNE.", line: "Pozvi priateľov, ktorí si aktivujú oprávnené predplatné, a získavaj opakovanú referral odmenu.", proof: "5 € ZA OPRÁVNENÉHO PRIATEĽA", images: images.invite, accent: "#FF9A62" },
    ],
  },
  hu: {
    headline: "TÖBB LEHETŐSÉG A KERESETRE",
    subhead: "Alkoss. Versenyezz. Adj el. Fejlődj.",
    voice: "earning-video/voice/hu.mp3",
    closing: "A TEHETSÉGED ÉRTÉK",
    closingLine: "Találd meg a saját bevételi utadat a Unique-on.",
    scenes: [
      { kicker: "STOCK CONTENT", title: "ALKOSD MEG EGYSZER. ADD EL ÚJRA.", line: "Tölts fel saját fotókat, videókat és hanganyagokat. Keress minden letöltéssel.", proof: "70% AZ ALKOTÓNAK", images: images.stock, accent: "#56D6C9" },
      { kicker: "MEGATALENT", title: "LÉPJ SZÍNPADRA.", line: "Mutasd meg a tehetséged, nyerd meg a közösség támogatását, és versenyezz a negyedéves nyereményért.", proof: "TEHETSÉG • SZAVAZAT • DÍJ", images: ["megatalent.jpg"], accent: "#F4C85A" },
      { kicker: "CHALLENGES", title: "A FEJLŐDÉS KIFIZETŐDHET.", line: "Csatlakozz az Eco és Health kihívásokhoz, igazold a fejlődésed, és versenyezz a győztes részesedéséért.", proof: "50% A GYŐZTESNEK", images: ["eco.jpg", "health.jpg"], accent: "#62D989" },
      { kicker: "MARKETPLACES", title: "ADJ EL TÁRGYAKAT ÉS TUDÁST.", line: "Hirdess a Bazaarban, vagy kínáld a képességeidet. Válassz közvetlen kapcsolatot vagy védett fizetést.", proof: "TERMÉK • SZOLGÁLTATÁS • ESCROW", images: images.sell, accent: "#FF7BA7" },
      { kicker: "ALKOTÓI TARTALOM", title: "A NÉZETTSÉG ÉRTÉKET TEREMT.", line: "Kínálj exkluzív videókat, előfizetést és borravalót. Építs hűséges közönséget és rendszeres bevételt.", proof: "PPV • TAGSÁG • BORRAVALÓ", images: images.creator, accent: "#B78BFF" },
      { kicker: "UNIQUE GIFTS", title: "FOGADD A RAJONGÓK TÁMOGATÁSÁT.", line: "Kapj animált ajándékokat posztokban, chatekben és élő pillanatokban, euróban kifizethető értékkel.", proof: "50% A JOGOSULT AJÁNDÉKOKBÓL", images: images.community, accent: "#FF6FAE" },
      { kicker: "KURZUSOK ÉS ZENE", title: "ADD TOVÁBB A TUDÁSOD.", line: "Készíts kurzusokat, oktatóanyagokat vagy zenét. Keress a beiratkozásokkal és lejátszásokkal.", proof: "TUDÁS • ZENE • JOGDÍJ", images: images.teach, accent: "#6EA8FF" },
      { kicker: "HÍVD MEG BARÁTAIDAT", title: "NÖVEKEDJETEK EGYÜTT.", line: "Hívd meg barátaidat, akik jogosult előfizetést indítanak, és kapj ismétlődő ajánlási jutalmat.", proof: "5 € JOGOSULT BARÁTONKÉNT", images: images.invite, accent: "#FF9A62" },
    ],
  },
};