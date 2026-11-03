/*
 * Example scripts. The GTA 6 examples paraphrase the facts presented in
 * "GTA 6 in 5 Minutes: Everything Rockstar Actually Confirmed" (No Cap 6):
 * https://www.youtube.com/watch?v=F8pKy2S_ZvE
 */
(function (root) {
  "use strict";

  const GTA_EL = `@lang el
@theme sunset
@cast Τάκης, Λένα

# Η μεγάλη μέρα
> Ημερομηνία, αναβολές και ποιος το παίζει πρώτος.
Τάκης: Λένα, μάθαμε επιτέλους πότε βγαίνει το GTA 6;
Λένα [ok]: Ναι! Στις 19 Νοεμβρίου 2026, για PS5 και Xbox Series X και S. {19.11.2026}
Τάκης: Δηλαδή σε {{days}} μέρες από σήμερα! {σε {{days}} μέρες}
Λένα [rep]: Και μετά από δύο αναβολές. Πρώτα από το φθινόπωρο του 2025, μετά από τον Μάιο του 2026.
Τάκης: Ελπίζω να μην έρθει και τρίτη...
Λένα: Το launch trailer ξαναείπε 19 Νοεμβρίου. Καμία ένδειξη για νέα αναβολή.
Τάκης [rep]: Και ξεκλειδώνει τα μεσάνυχτα σε κάθε χώρα, οπότε πρώτη το παίζει η Νέα Ζηλανδία! {Νέα Ζηλανδία: 1η}
Λένα: Τυχεροί οι Κιβί!

# Το κουτί χωρίς δίσκο
> Φυσική έκδοση, preload, τιμές και Ultimate.
Τάκης: Εγώ θα πάρω τη φυσική έκδοση, να έχω το δισκάκι στο ράφι.
Λένα [ok]: Έκπληξη! Μέσα στο κουτί έχει κωδικό για download, όχι δίσκο. {ΚΩΔΙΚΟΣ, ΟΧΙ ΔΙΣΚΟΣ}
Τάκης: Σοβαρά; Τουλάχιστον μπορώ να το κατεβάσω νωρίς;
Λένα [ok]: Ναι. Preload από 12 Νοεμβρίου, μία εβδομάδα πριν. Και με το κουτί.
Τάκης: Πόσο κοστίζει;
Λένα [ok]: Η Standard 79,99 δολάρια και η Ultimate 99,99. {$79,99 · $99,99}
Τάκης: Κι αν μετανιώσω που δεν πήρα την Ultimate;
Λένα [ok]: Η αναβάθμιση πουλιέται χωριστά, γύρω στα 20 δολάρια, ακόμα και μετά την κυκλοφορία.
Τάκης [unc]: Και πόσα gigabyte θέλει;
Λένα: Η Rockstar δεν το έχει πει ακόμα. Άδειασε χώρο και περίμενε.

# Jason & Lucia στη Leonida
> Ήρωες, ιστορία, χάρτης και το συλλεκτικό των 399$.
Λένα [ok]: Είναι παιχνίδι για έναν παίκτη. Παίζεις με τον Jason και τη Lucia. {JASON + LUCIA}
Τάκης: Ένα εγκληματικό δίδυμο. Σαν εμάς!
Λένα: Εμείς κάνουμε βιντεάκια, Τάκη. Αυτοί μπλέκουν άσχημα όταν μια εύκολη δουλειά πάει στραβά.
Τάκης: Και πού γίνονται όλα αυτά;
Λένα [ok]: Στην πολιτεία Leonida, με τη Vice City, τα Keys και το Mount Kalaga. {LEONIDA}
Τάκης [ok]: Βγαίνει και συλλεκτικό κουτί 399 δολαρίων, με φιγούρα αλιγάτορα! {$399}
Λένα: Που δεν έχει μέσα το παιχνίδι.
Τάκης: ...Θα πάρω μόνο το παιχνίδι.
`;

  const GTA_EN = `@lang en
@theme night
@cast Tom, Lena

# Launch night
> Release date, delays and who plays first.
Tom: Lena, do we finally know when GTA 6 comes out?
Lena [ok]: Yes. November 19, 2026, on PS5 and Xbox Series X and S. {19.11.2026}
Tom: So that's {{days}} days from today! {{{days}} days to go}
Lena [rep]: After two delays. First from fall 2025, then from May 2026.
Tom: Please, no third one.
Lena: The launch trailer repeated November 19. No sign of another delay.
Tom [rep]: It unlocks at midnight in each region, so New Zealand plays first. {New Zealand: 1st}

# The box with no disc
> Physical edition, preload, prices and Ultimate.
Tom: I'm buying the physical copy. I want the disc on my shelf.
Lena [ok]: Surprise. The box holds a download code, not a disc. {CODE, NOT DISC}
Tom: Can I at least download it early?
Lena [ok]: Yes. Preload starts November 12, one week before launch.
Tom: How much?
Lena [ok]: 79.99 dollars for Standard, 99.99 for Ultimate. {$79.99 · $99.99}
Tom [unc]: And how big is the download?
Lena: Rockstar hasn't said yet. Clear some space and wait.

# Jason and Lucia
> Heroes, story and the map.
Lena [ok]: It's a single-player game. You play as Jason and Lucia. {JASON + LUCIA}
Tom: A criminal duo. Like us!
Lena: We make videos, Tom. They get in deep when an easy job goes wrong.
Tom: Where does it all happen?
Lena [ok]: In the state of Leonida, with Vice City, the Keys and Mount Kalaga. {LEONIDA}
`;

  const BLANK_EL = `@lang el
@theme studio
@cast Άννα, Νίκος

# Ο τίτλος του κλιπ σου
> Μία πρόταση για το τι λέει αυτό το κλιπ.
Άννα: Γεια! Εδώ γράφεις τι λέει ο πρώτος χαρακτήρας.
Νίκος [ok]: Κι εδώ ο δεύτερος. Το [ok] βάζει πράσινη ετικέτα.
Άννα [rep]: Το [rep] βάζει κίτρινη και το [unc] κόκκινη.
Νίκος: Ό,τι γράψεις σε άγκιστρα στο τέλος βγαίνει μεγάλο στην οθόνη. {ΜΕΓΑΛΟ ΚΕΙΜΕΝΟ}

# Δεύτερο κλιπ
Άννα: Κάθε γραμμή που ξεκινά με # φτιάχνει νέο κλιπ.
Νίκος: Η λέξη days μέσα σε διπλά άγκιστρα μετράει μέρες. Ως τις 19 Νοεμβρίου μένουν {{days}}.
`;

  const PRESETS = [
    { id: "gta-el", label: "GTA 6 · Ελληνικά", script: GTA_EL },
    { id: "gta-en", label: "GTA 6 · English", script: GTA_EN },
    { id: "blank-el", label: "Κενό πρότυπο / Blank template", script: BLANK_EL }
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = PRESETS;
  else root.EXPLAINER_PRESETS = PRESETS;
})(typeof window !== "undefined" ? window : globalThis);
