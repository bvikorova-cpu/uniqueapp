export type WallGuideLang = "en" | "sk" | "hu";

export type ChapterCopy = {
  no: string;
  title: string;
  lead: string;
  bullets: string[];
};

export type WallGuideCopy = {
  badge: string;
  introTitle: string;
  introKicker: string;
  introLead: string;
  outroTitle: string;
  outroLead: string;
  chapters: ChapterCopy[];
};

export const WALLGUIDE_COPY: Record<WallGuideLang, WallGuideCopy> = {
  en: {
    badge: "WALL GUIDE",
    introTitle: "The Wall",
    introKicker: "COMPLETE STEP-BY-STEP GUIDE",
    introLead: "Post, react, earn XP — everything the Wall can do",
    outroTitle: "Your Wall is waiting",
    outroLead:
      "Share a post (+20 XP) · Comment (+10 XP) · Add a story (+15 XP) · Build your streak every day",
    chapters: [
      {
        no: "01 · LAYOUT",
        title: "Three columns, one feed",
        lead: "Open the Wall from the top menu. The screen is split into three working areas.",
        bullets: [
          "Left: your profile card, composer, privacy & Creator Studio",
          "Middle: hero, search, stories, filters and the post feed",
          "Right: theme colors, Watch & Earn XP, friends, streak, trending",
        ],
      },
      {
        no: "02 · CREATE A POST",
        title: "Share your first post",
        lead: "Type in “What’s on your mind?”, attach media, choose who can see it, then hit Share Post.",
        bullets: [
          "Add to post: photo, video, feeling, location, tag friends",
          "Extras: AI helper, 24h expiry, poll, event, background",
          "Audience selector: Public, Friends or Close Friends",
          "Share Post gives you +20 XP",
        ],
      },
      {
        no: "03 · STORIES & NOTES",
        title: "Stories and 24h notes",
        lead: "Above the feed you have two fast formats that disappear after 24 hours.",
        bullets: [
          "Your Story: photo or video, text sits at the bottom, likes + comments",
          "24h notes: a short thought your friends see for one day",
          "Selected background is highlighted while you create",
          "Stories give +15 XP",
        ],
      },
      {
        no: "04 · FILTERS",
        title: "Choose what you see",
        lead: "The filter row rebuilds the feed instantly — no reload needed.",
        bullets: [
          "For You: personalised by the interests you picked in onboarding",
          "Follow / Friends: only people you follow or your friends",
          "Trending & Latest: hottest posts vs. newest posts",
          "Verified only: posts from verified members",
        ],
      },
      {
        no: "05 · POST ACTIONS",
        title: "React, comment, gift, save",
        lead: "Every post carries the same action bar under the content.",
        bullets: [
          "React: hold for the full emoji reaction picker",
          "Comment: your comments can be edited or deleted anytime",
          "Gift: send a paid Unique gift — the creator keeps 50%",
          "Bookmark: save the post to read later",
        ],
      },
      {
        no: "06 · LONG POSTS",
        title: "Show more, follow, report",
        lead: "Long texts are collapsed — Show more opens the full post, Show less closes it again.",
        bullets: [
          "Gold ring = Verified Founder or VIP member",
          "Follow / Unfollow right from the post",
          "Report sends the post to moderation",
          "Names always show the real profile name",
        ],
      },
      {
        no: "07 · VIDEOS",
        title: "Wall videos & stories tab",
        lead: "The Videos tab is the short-video side of the Wall — upload from the same page.",
        bullets: [
          "Open Videos from the Wall tab row",
          "Upload Video for your own short clip",
          "Feeds load 10 videos at a time for speed",
          "Nudity and adult content is removed automatically",
        ],
      },
      {
        no: "08 · SAVED",
        title: "Everything you bookmarked",
        lead: "Saved collects every post you bookmarked, so nothing good gets lost in the feed.",
        bullets: [
          "Open from More → Saved",
          "Remove a bookmark to clear the list",
          "Works for text, photo and video posts",
        ],
      },
      {
        no: "09 · FRIENDS",
        title: "Friends & requests",
        lead: "The Friends tab manages your whole network in one place.",
        bullets: [
          "All friends, incoming and outgoing requests",
          "Search: type one letter and suggestions appear",
          "Close Friends is a private circle for sensitive posts",
          "Accepted requests land in your bell notifications",
        ],
      },
      {
        no: "10 · MESSAGES",
        title: "Direct messages",
        lead: "Messages opens the messenger — private chats with your friends.",
        bullets: [
          "Text, media and gift messages",
          "Mute a conversation whenever you need quiet",
          "Unread counter sits in the top bar",
        ],
      },
      {
        no: "11 · XP & REWARDS",
        title: "Earn while you scroll",
        lead: "The right column turns activity into XP, levels and streaks.",
        bullets: [
          "Watch & Earn XP: 15s ad = +1 XP, unlimited",
          "Post +20 · Comment +10 · Story +15",
          "Daily streak resets if you skip a day",
          "Theme colors instantly restyle your whole Wall",
        ],
      },
    ],
  },

  sk: {
    badge: "SPRIEVODCA WALL",
    introTitle: "The Wall",
    introKicker: "KOMPLETNÝ SPRIEVODCA KROK ZA KROKOM",
    introLead: "Pridávaj, reaguj, získavaj XP — všetko, čo Wall dokáže",
    outroTitle: "Tvoj Wall čaká",
    outroLead:
      "Pridaj post (+20 XP) · Komentuj (+10 XP) · Pridaj story (+15 XP) · Buduj si sériu každý deň",
    chapters: [
      {
        no: "01 · ROZLOŽENIE",
        title: "Tri stĺpce, jeden feed",
        lead: "Wall otvoríš z horného menu. Obrazovka je rozdelená na tri pracovné časti.",
        bullets: [
          "Vľavo: profilová karta, tvorba postu, súkromie a Creator Studio",
          "V strede: hero, vyhľadávanie, stories, filtre a feed s postami",
          "Vpravo: farby témy, Watch & Earn XP, priatelia, séria, trendy",
        ],
      },
      {
        no: "02 · NOVÝ POST",
        title: "Zdieľaj svoj prvý post",
        lead: "Napíš do „What’s on your mind?“, pridaj médiá, vyber, kto to uvidí, a klikni na Share Post.",
        bullets: [
          "Pridaj k postu: foto, video, náladu, miesto, označ priateľov",
          "Naviac: AI pomocník, platnosť 24 h, hlasovanie, event, pozadie",
          "Výber publika: verejné, priatelia alebo Close Friends",
          "Za zdieľanie postu získaš +20 XP",
        ],
      },
      {
        no: "03 · STORIES A POZNÁMKY",
        title: "Stories a 24-hodinové poznámky",
        lead: "Nad feedom máš dva rýchle formáty, ktoré po 24 hodinách zmiznú.",
        bullets: [
          "Your Story: foto alebo video, text je dole, lajky + komentáre",
          "24 h poznámky: krátka myšlienka na jeden deň pre priateľov",
          "Vybrané pozadie je počas tvorby zvýraznené",
          "Story ti dá +15 XP",
        ],
      },
      {
        no: "04 · FILTRE",
        title: "Vyber si, čo vidíš",
        lead: "Riadok s filtrami prestaví feed okamžite — bez načítania stránky.",
        bullets: [
          "For You: personalizované podľa tvojich záujmov",
          "Follow / Friends: iba tí, ktorých sleduješ, alebo priatelia",
          "Trending a Latest: najhorúcejšie verzus najnovšie posty",
          "Verified only: posty od overených členov",
        ],
      },
      {
        no: "05 · AKCIE PRI POSTE",
        title: "Reaguj, komentuj, daruj, ulož",
        lead: "Každý post má pod obsahom rovnaký panel akcií.",
        bullets: [
          "Reakcia: podrž pre celý výber emoji reakcií",
          "Komentár: vlastné komentáre môžeš kedykoľvek upraviť či zmazať",
          "Darček: pošli platený Unique darček — tvorca dostane 50 %",
          "Záložka: ulož si post na neskôr",
        ],
      },
      {
        no: "06 · DLHÉ POSTY",
        title: "Show more, sledovanie, nahlásenie",
        lead: "Dlhé texty sú zbalené — Show more otvorí celý post, Show less ho zatvorí.",
        bullets: [
          "Zlatý prsteň = Verified Founder alebo VIP člen",
          "Sledovať / prestať sledovať priamo z postu",
          "Report pošle post na moderáciu",
          "Mená vždy zobrazujú skutočné menu z profilu",
        ],
      },
      {
        no: "07 · VIDEÁ",
        title: "Videá na Wall",
        lead: "Záložka Videos je krátkovideo časť Wall — nahrávaš z tej istej stránky.",
        bullets: [
          "Videos otvoríš z riadka záložiek na Wall",
          "Upload Video pre tvoj vlastný krátky klip",
          "Feed načítava po 10 videí kvôli rýchlosti",
          "Nahota a obsah pre dospelých sa odstraňuje automaticky",
        ],
      },
      {
        no: "08 · ULOŽENÉ",
        title: "Všetko, čo si si uložil",
        lead: "Saved zbiera každý post so záložkou, aby sa nič dobré nestratilo.",
        bullets: [
          "Otvor cez More → Saved",
          "Odobraním záložky post zo zoznamu zmizne",
          "Funguje pre text, foto aj video posty",
        ],
      },
      {
        no: "09 · PRIATELIA",
        title: "Priatelia a žiadosti",
        lead: "Záložka Friends spravuje celú tvoju sieť na jednom mieste.",
        bullets: [
          "Všetci priatelia, prijaté aj odoslané žiadosti",
          "Hľadanie: napíš jedno písmeno a objavia sa návrhy",
          "Close Friends je súkromný kruh pre osobnejšie posty",
          "Prijaté žiadosti prídu do notifikácií pri zvončeku",
        ],
      },
      {
        no: "10 · SPRÁVY",
        title: "Priame správy",
        lead: "Messages otvorí messenger — súkromné chaty s priateľmi.",
        bullets: [
          "Text, médiá aj darčekové správy",
          "Konverzáciu môžeš kedykoľvek zmlčať",
          "Počítadlo neprečítaných je v hornej lište",
        ],
      },
      {
        no: "11 · XP A ODMENY",
        title: "Získavaj počas skrolovania",
        lead: "Pravý stĺpec mení aktivitu na XP, úrovne a série.",
        bullets: [
          "Watch & Earn XP: 15 s reklama = +1 XP, bez limitu",
          "Post +20 · Komentár +10 · Story +15",
          "Denná séria sa resetuje, ak vynecháš deň",
          "Farby témy okamžite prefarbia celý tvoj Wall",
        ],
      },
    ],
  },

  hu: {
    badge: "WALL ÚTMUTATÓ",
    introTitle: "The Wall",
    introKicker: "TELJES, LÉPÉSENKÉNTI ÚTMUTATÓ",
    introLead: "Posztolj, reagálj, szerezz XP-t — minden, amit a Wall tud",
    outroTitle: "A Wallod vár rád",
    outroLead:
      "Poszt megosztása (+20 XP) · Hozzászólás (+10 XP) · Story (+15 XP) · Építsd a sorozatod minden nap",
    chapters: [
      {
        no: "01 · FELÉPÍTÉS",
        title: "Három hasáb, egy feed",
        lead: "A Wallt a felső menüből nyitod meg. A képernyő három munkaterületre oszlik.",
        bullets: [
          "Bal: profilkártya, poszt szerkesztő, adatvédelem és Creator Studio",
          "Közép: hero, kereső, storyk, szűrők és a poszt feed",
          "Jobb: téma színek, Watch & Earn XP, barátok, sorozat, trendek",
        ],
      },
      {
        no: "02 · ÚJ POSZT",
        title: "Oszd meg az első posztod",
        lead: "Írj a „What’s on your mind?” mezőbe, csatolj médiát, válaszd ki, ki láthatja, majd Share Post.",
        bullets: [
          "Hozzáadás: fotó, videó, érzés, helyszín, barátok jelölése",
          "Extrák: AI segítő, 24 órás lejárat, szavazás, esemény, háttér",
          "Közönség: nyilvános, barátok vagy Close Friends",
          "A poszt megosztása +20 XP-t ad",
        ],
      },
      {
        no: "03 · STORYK ÉS JEGYZETEK",
        title: "Storyk és 24 órás jegyzetek",
        lead: "A feed felett két gyors formátum van, amelyek 24 óra után eltűnnek.",
        bullets: [
          "Your Story: fotó vagy videó, a szöveg alul, like + hozzászólás",
          "24 órás jegyzet: rövid gondolat egy napra a barátoknak",
          "A kiválasztott háttér létrehozás közben kiemelve látszik",
          "A story +15 XP-t ad",
        ],
      },
      {
        no: "04 · SZŰRŐK",
        title: "Válaszd ki, mit látsz",
        lead: "A szűrősor azonnal újraépíti a feedet — újratöltés nélkül.",
        bullets: [
          "For You: az érdeklődésed alapján személyre szabva",
          "Follow / Friends: csak akiket követsz, vagy a barátaid",
          "Trending és Latest: legnépszerűbb vs. legfrissebb posztok",
          "Verified only: csak hitelesített tagok posztjai",
        ],
      },
      {
        no: "05 · POSZT MŰVELETEK",
        title: "Reagálj, kommentelj, ajándékozz, ments",
        lead: "Minden poszt alatt ugyanaz a műveletsáv található.",
        bullets: [
          "Reakció: tartsd nyomva a teljes emoji választóhoz",
          "Hozzászólás: a sajátodat bármikor szerkeszted vagy törlöd",
          "Ajándék: fizetett Unique ajándék — az alkotó 50%-ot kap",
          "Könyvjelző: mentsd el a posztot későbbre",
        ],
      },
      {
        no: "06 · HOSSZÚ POSZTOK",
        title: "Show more, követés, jelentés",
        lead: "A hosszú szöveg össze van csukva — a Show more kinyitja, a Show less bezárja.",
        bullets: [
          "Arany karika = Verified Founder vagy VIP tag",
          "Követés / követés leállítása közvetlenül a posztból",
          "A Report moderációra küldi a posztot",
          "A nevek mindig a valódi profilnevet mutatják",
        ],
      },
      {
        no: "07 · VIDEÓK",
        title: "Wall videók",
        lead: "A Videos fül a Wall rövidvideós része — ugyanarról az oldalról tölthetsz fel.",
        bullets: [
          "A Videos a Wall fülsorából nyílik",
          "Upload Video a saját rövid klipedhez",
          "A feed 10 videót tölt be egyszerre a gyorsaság miatt",
          "A meztelenség és felnőtt tartalom automatikusan törlődik",
        ],
      },
      {
        no: "08 · MENTETTEK",
        title: "Minden, amit elmentettél",
        lead: "A Saved összegyűjti a könyvjelzős posztokat, hogy semmi jó ne veszjen el.",
        bullets: [
          "Megnyitás: More → Saved",
          "A könyvjelző eltávolítása törli a listáról",
          "Szöveges, fotós és videós posztokkal is működik",
        ],
      },
      {
        no: "09 · BARÁTOK",
        title: "Barátok és kérések",
        lead: "A Friends fül egy helyen kezeli a teljes hálózatod.",
        bullets: [
          "Összes barát, beérkező és kimenő kérések",
          "Keresés: írj be egy betűt és jönnek a javaslatok",
          "A Close Friends privát kör az érzékenyebb posztokhoz",
          "Az elfogadott kérések a csengő értesítéseibe kerülnek",
        ],
      },
      {
        no: "10 · ÜZENETEK",
        title: "Privát üzenetek",
        lead: "A Messages megnyitja a messengert — privát csevegés a barátaiddal.",
        bullets: [
          "Szöveg, média és ajándék üzenetek",
          "Egy beszélgetést bármikor lenémíthatsz",
          "Az olvasatlan számláló a felső sávban van",
        ],
      },
      {
        no: "11 · XP ÉS JUTALMAK",
        title: "Szerezz XP-t görgetés közben",
        lead: "A jobb hasáb az aktivitást XP-vé, szintekké és sorozatokká váltja.",
        bullets: [
          "Watch & Earn XP: 15 s reklám = +1 XP, korlátlanul",
          "Poszt +20 · Hozzászólás +10 · Story +15",
          "A napi sorozat nullázódik, ha kihagysz egy napot",
          "A téma színei azonnal átszínezik az egész Wallt",
        ],
      },
    ],
  },
};
