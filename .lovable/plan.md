# IQ Platform — rozpis batchov 66 → 150

Aktuálne hotovo: **65 batchov** (17 mini-tools + dashboard + puzzle pack 61-65).
Cieľ: dotiahnuť IQ Platformu na **150 batchov** = kompletný kognitívny + sociálny + AI ekosystém.

Každý batch = 1 nový komponent / feature / hook (drobný, izolovaný, s `localStorage` alebo Supabase persistenciou).

---

## 🎮 Blok A — Puzzle & Logic Pack (66-80) — 15 batchov

66. **IQMinesweeper** — 6×6 mriežka, best time
67. **IQLightsOut** — 4×4 toggle puzzle, min moves
68. **IQMastermind** — 4-color code breaker, attempts
69. **IQBlockSlide** — Klotski-style, min moves
70. **IQNonogram5** — 5×5 picross, best time
71. **IQKakuro4** — 4×4 sum puzzle
72. **IQFlowConnect** — spoj farebné body
73. **IQPipesRotate** — otoč potrubia, best time
74. **IQMagicSquare** — 3×3 sum=15
75. **IQKnightTour** — šachový jazdec puzzle
76. **IQRiverCrossing** — vlk/koza/kapusta
77. **IQNQueens4** — 4-queens puzzle
78. **IQTangram** — 7-piece skladanie
79. **IQMazeRunner** — generated maze, best time
80. **IQPuzzleSummary** — agregácia 66-79 do dashboardu

## 🧠 Blok B — Memory & Attention (81-95) — 15 batchov

81. **IQAudioMemory** — zapamätaj tóny
82. **IQColorRecall** — sekvencia farieb
83. **IQFaceMemory** — match tváre
84. **IQMapMemory** — zapamätaj polohu pinov
85. **IQSpotDifference** — 2 obrázky, nájdi rozdiely
86. **IQAttentionGrid** — nájdi cieľ medzi distraktormi
87. **IQDualTask** — 2 úlohy súčasne
88. **IQDivideAttention** — sleduj 2 streamy
89. **IQVisualSearch** — Where's Waldo style
90. **IQChangeBlind** — flicker paradigm
91. **IQTrailMaking** — A1-B2-C3 spoj
92. **IQDigitSymbol** — symbol → číslo
93. **IQBackwardCount** — odpočítavaj v hlave
94. **IQGoNoGo** — reaguj len na ciele
95. **IQAttentionSummary** — agregácia 81-94

## 🔢 Blok C — Math & Logic Advanced (96-110) — 15 batchov

96. **IQFractions** — porovnaj zlomky
97. **IQEquations** — vyrieš x
98. **IQSequenceMath** — Fibonacci-style
99. **IQPrimeSpot** — vyber prvočísla
100. **IQGeometry** — uhly, plochy
101. **IQProbability** — kockové úlohy
102. **IQVennLogic** — 3-set Venn
103. **IQSyllogism** — formálna logika
104. **IQMatrixReasoning** — Raven-style 3×3
105. **IQAnalogies** — A:B :: C:?
106. **IQClassification** — odlišný prvok zo 6
107. **IQCodeBreak** — Caesar/substitučná šifra
108. **IQBinaryConvert** — dec ↔ bin
109. **IQHexConvert** — dec ↔ hex
110. **IQMathSummary** — agregácia 96-109

## 👥 Blok D — Social & Multiplayer (111-125) — 15 batchov

111. **IQDuelInvite** — pošli challenge linkom
112. **IQDuelLobby** — realtime lobby (Supabase channel)
113. **IQDuelMatch** — 1v1 quick test
114. **IQDuelHistory** — moje súboje
115. **IQClanCreate** — vytvor IQ klan
116. **IQClanLeaderboard** — top členovia
117. **IQClanWar** — klan vs klan týždenná súťaž
118. **IQGlobalChat** — kanál pre IQ hráčov
119. **IQReplaySharing** — zdieľaj graf testu
120. **IQMentorMatch** — spoj high-IQ s learnerom
121. **IQStudyGroup** — vytvor študijnú skupinu
122. **IQEventCalendar** — globálne IQ eventy
123. **IQTournamentBracket** — single-elim turnaj
124. **IQSpectator** — sleduj live duel
125. **IQSocialSummary** — agregácia 111-124

## 🤖 Blok E — AI Coaching (126-140) — 15 batchov

126. **IQAICoach** — Lovable AI dáva rady (3 kredity)
127. **IQWeakAreaScan** — AI nájde slabiny (5 kreditov)
128. **IQTrainingPlan** — 7-dňový plán (5 kreditov)
129. **IQDailyChallenge** — AI generuje úlohu (3 kredity)
130. **IQExplainSolution** — AI rozoberie chybu (3 kredity)
131. **IQConceptExplain** — vysvetli koncept (3 kredity)
132. **IQMotivationBot** — denná správa (3 kredity)
133. **IQProgressNarrative** — AI zhrnie tvoj progres (5 kreditov)
134. **IQPredictedScore** — AI predpoveď IQ (5 kreditov)
135. **IQCareerMatch** — IQ profil → kariéry (5 kreditov)
136. **IQLearningStyle** — detekcia štýlu (3 kredity)
137. **IQVoiceCoach** — TTS coaching (5 kreditov)
138. **IQDreamGoal** — nastav dlhodobý cieľ + AI tracking
139. **IQAIChatTutor** — voľný chat o IQ témach (3 kredity/správa)
140. **IQAISummary** — agregácia 126-139

## 🏆 Blok F — Certifikáty, Pro & Finalizácia (141-150) — 10 batchov

141. **IQCertificateGen** — PDF certifikát s IQ score
142. **IQCertificateShare** — zdieľaj na LinkedIn
143. **IQVerifyBadge** — verejne overiteľný badge (QR)
144. **IQProTier** — paid premium nástroje (€9.99/mes)
145. **IQAchievementShowcase** — odznaky na profile
146. **IQYearlyReport** — výročný PDF report
147. **IQDataExport** — CSV/JSON export všetkých dát
148. **IQAccessibility** — high contrast + screen reader pass
149. **IQOnboardingTour** — guided tour pre nových
150. **IQGrandSummary** — master dashboard cez všetky 6 blokov + roadmap badge

---

## 📊 Sumár

| Blok | Batche | Téma |
|------|--------|------|
| A | 66-80 | Puzzle & Logic (15) |
| B | 81-95 | Memory & Attention (15) |
| C | 96-110 | Math & Logic Advanced (15) |
| D | 111-125 | Social & Multiplayer (15) |
| E | 126-140 | AI Coaching (15) |
| F | 141-150 | Pro & Finalizácia (10) |
| **Spolu** | **85 nových** | **66 → 150** |

## ⚙️ Tempo

- Pokračujem **po 5 batchov** (rovnako ako doteraz) → **17 ďalších kôl** "pokračuj" do dosiahnutia 150
- Bloky A-C = čisto frontend + localStorage (rýchle)
- Blok D = Supabase realtime + nová tabuľka `iq_duels`, `iq_clans` (1 migrácia na začiatku bloku)
- Blok E = Lovable AI Gateway (3-5 kreditov/call podľa pravidiel projektu)
- Blok F = PDF generation + Stripe wiring pre Pro tier

## ✅ Po schválení
Pokračujem **batchmi 66-70** (Minesweeper, LightsOut, Mastermind, BlockSlide, Nonogram).
