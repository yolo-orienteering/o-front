// Hardcoded Swiss O Magazine articles for the online-publishing test.
//
// This is a throw-away test fixture: the goal is to show how Swiss O Magazine
// print articles could be distributed inside o-mate as web teasers + reader
// views (incl. a paywall demo). No Directus / API model is involved on purpose.
//
// Images live in `public/magazine/` and were extracted from the print PDF
// (Swiss O Magazine 02–26).

export interface MagazineParagraph {
  kind: 'paragraph'
  html: string
  /** render an oversized initial letter (used for the article opener) */
  dropcap?: boolean
}

export interface MagazineHeading {
  kind: 'heading'
  text: string
  /** optional leading number badge (used for the alpine training tips) */
  num?: number
}

export interface MagazineFigure {
  kind: 'figure'
  src: string
  caption?: string
  credit?: string
}

export interface MagazinePullquote {
  kind: 'pullquote'
  text: string
}

export interface MagazineList {
  kind: 'list'
  title?: string
  items: { label?: string; text: string }[]
}

export interface MagazineInfobox {
  kind: 'infobox'
  title: string
  intro?: string
  items?: { label?: string; text: string }[]
}

export interface MagazineQA {
  kind: 'qa'
  q: string
  a: string
}

export interface MagazineExpert {
  kind: 'expert'
  name: string
  image: string
  html: string
}

export type MagazineBlock =
  | MagazineParagraph
  | MagazineHeading
  | MagazineFigure
  | MagazinePullquote
  | MagazineList
  | MagazineInfobox
  | MagazineQA
  | MagazineExpert

export interface MagazineArticle {
  slug: string
  /** small category label shown above the title, e.g. "Fokus · Sicherheit" */
  kicker: string
  title: string
  lead: string
  author: string
  /** ISO date string */
  date: string
  readingMinutes: number
  /** path under /public */
  hero: string
  heroCaption?: string
  heroCredit?: string
  /** premium articles show a paywall after `previewBlocks` blocks */
  premium: boolean
  previewBlocks: number
  blocks: MagazineBlock[]
}

export const magazineArticles: MagazineArticle[] = [
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'sicher-an-der-swiss-o-week',
    kicker: 'Fokus · Sicherheit in den Bergen',
    title: 'Sicher an der Swiss O Week',
    lead: 'Atemberaubende Aussicht, offenes Gelände und Abenteuer: OL in den Bergen fasziniert – und fordert. Ein Blick hinter die Kulissen der Swiss O Week zeigt, wie komplex Planung, Prävention und Krisenmanagement sind.',
    author: 'Annina Müller',
    date: '2026-05-28',
    readingMinutes: 7,
    hero: '/magazine/sicherheit-hero.jpg',
    heroCaption:
      'Das plötzliche Aufziehen von dicken Wolken ist in den Bergen nicht selten.',
    heroCredit: 'Foto: Swiss O Week 2023 Flims Laax',
    premium: false,
    previewBlocks: 99,
    blocks: [
      {
        kind: 'paragraph',
        dropcap: true,
        html: 'OL in den Bergen unterscheidet sich in vielerlei Hinsicht von Wettkämpfen in tieferen Lagen. Die Sicht ist weit, das Panorama oft beeindruckend. Dornen sucht man vergeblich, dafür gibt es Felsen und Steine, über die man stolpern kann. Man ist fernab vom Lärm der Stadt – aber ebenso von guten Strassen, Krankenhäusern und sicheren Unterständen. Es überrascht deshalb nicht, dass die Sicherheit bei der Organisation alpiner Wettkämpfe wie der Swiss O Week eine zentrale Rolle spielt.'
      },
      {
        kind: 'paragraph',
        html: 'In den Bergen kann viel passieren. Unebenes Gelände und Felsspalten führen häufig zu Missgeschicken und Verletzungen. Kühe auf den Alpweiden sind nicht immer nur eine Freude. Bergbahnen können plötzlich ihren Betrieb einstellen. Das grösste Sicherheitsrisiko ist jedoch das <strong>Wetter</strong>. Ein Wetterumschwung kann im alpinen Raum schnell eintreten – und wohl keine OL-Läuferin und kein OL-Läufer kennt nicht zumindest eine Schlechtwetter-Geschichte in den Bergen.'
      },
      {
        kind: 'paragraph',
        html: 'Diese Erfahrung bringt unter anderem Stephan Gürtler ins Team der Swiss O Week. Er ist seit der Austragung 2016 im Engadin verantwortlich für den Bereich Sicherheit. «Ich erinnere mich an diverse spektakuläre Laufabbrüche, aber auch an Verletzte, die wir sicher aus dem Gelände holen und mit ihren Angehörigen wiedervereinen konnten», erzählt Gürtler. Beruflich befasst er sich als Verantwortlicher einer spezialisierten Abteilung mit Sicherheitsfragen von Grossanlässen wie dem Eurovision Song Contest oder dem Eidgenössischen Schwingfest.'
      },
      {
        kind: 'paragraph',
        html: '«Zuerst führe ich immer eine Geländeanalyse durch. Dabei verbringe ich mehrere Tage im Gebiet der geplanten Etappen, um mir ein Bild über die Situation, die Geländekammern und mögliche Gefahren zu machen. Am Computer eruiere ich die genauen Hangneigungen und versteckten Wasserstollen, die Wasserläufe unvermittelt anschwellen lassen könnten», erläutert Gürtler. So entsteht ein Konzept, das einerseits einen sicheren Lauf erlaubt und andererseits Handlungsrichtlinien für den Ernstfall bietet.'
      },
      {
        kind: 'infobox',
        title: 'So trägst du zur Sicherheit bei einem alpinen OL bei',
        intro:
          'Als Bewohnende eines Alpenlandes neigen wir dazu, Sicherheitswarnungen zu unterschätzen. Auch unter 2000 m ü. M. können Wetterwechsel schnell auftreten. Mit guter Vorbereitung entlastest du auch die Helfenden und hältst Ressourcen für echte Notfälle frei.',
        items: [
          {
            label: 'Warme, wasserfeste Ersatzkleidung',
            text: 'Nimm sie mit, auch wenn im Tal die Sonne scheint. Im Ernstfall wirst du froh darum sein.'
          },
          {
            label: 'Trillerpfeife',
            text: 'Sie stört nicht beim Rennen – bei einem Sturz kannst du damit schnell auf dich aufmerksam machen.'
          },
          {
            label: 'Wasser',
            text: 'Bei heissen Temperaturen oder unerwartet längerer Laufzeit wirst du froh sein, genügend dabei zu haben.'
          }
        ]
      },
      {
        kind: 'heading',
        text: 'Das Worst-Case-Szenario als Planungsgrundlage'
      },
      {
        kind: 'paragraph',
        html: 'Das Thema ist bei der Vorbereitung omnipräsent. Die Logistik berechnet im Vorfeld, wie schnell der Abtransport für eine gewisse Personenanzahl möglich ist – die Teilnehmenden müssen ja nicht nur auf den Berg, sondern auch alle wieder sicher herunter. Je nach Bahnkapazität und Alternativen entscheidet die Infrastruktur, ob eine Etappe überhaupt durchführbar ist. Das Wettkampfteam wiederum diskutiert mit den Landbesitzern nebst dem Geländezugang auch das Kuh-Management.'
      },
      {
        kind: 'pullquote',
        text: '«Das Wichtigste ist, nicht von unerwarteten Ereignissen überrascht zu werden. Wenn wir im Voraus alle möglichen Situationen durchgehen, können wir rascher und effektiver reagieren.»'
      },
      {
        kind: 'paragraph',
        html: 'Trotz aller Vorbereitung ist auch Flexibilität gefragt. Anhand vorbereiteter Schemata können Etappen verschoben oder ausgetauscht werden. Für die SOW 2026 gibt es zwei komplett geplante und vormarkierte Ersatzetappen. Bisher kamen solche nur 2009 im Muotathal zum Zuge.'
      },
      {
        kind: 'figure',
        src: '/magazine/sicherheit-trail.jpg',
        caption:
          'Auch an der Swiss O Week 2026 wird die Trittsicherheit gefordert sein.',
        credit: 'Foto: Silvan Schletti'
      },
      {
        kind: 'heading',
        text: 'Digitale Kanäle erleichtern die Kommunikation'
      },
      {
        kind: 'paragraph',
        html: 'Zwei Tage vor der jeweiligen Etappe wird im OK ein erstes Mal über die Durchführung entschieden. Am Lauftag erfolgt der Morgenrapport im Krisenstab um circa sechs Uhr. Läuft alles wie geplant, wird 30 Minuten vor Start freigegeben. Dabei verlässt man sich nicht auf die Meteo-App, sondern bezieht einen eigenen Wetterdienst mit ein, der bei überraschenden Umschwüngen Alarm schlägt.'
      },
      {
        kind: 'paragraph',
        html: 'Kommt es zu einer Absage, ist präzise Kommunikation entscheidend. Läuferinnen und Läufer im Wettkampfzentrum sind rasch informiert; jene im Gelände sind schwieriger zu erreichen. Für Teilnehmende im Tal werden Informationen via SMS sowie über soziale Medien gestreut. Im Bedarfsfall kommt der Evakuationsplan zum Zug, etwa die Einweisung in Notunterstände.'
      },
      { kind: 'heading', text: 'Medizinische Betreuung' },
      {
        kind: 'paragraph',
        html: 'Medizinisches Personal befindet sich im Ziel und im Wettkampfgelände, in schwer zugänglichem Terrain sind zusätzlich Sanitätspatrouillen unterwegs. Weil die Lokalisierung von Verletzten schwierig sein kann, ist das Mitführen einer Trillerpfeife Pflicht. Bei grösseren Verletzungen wird direkt der Helikopter organisiert – Krankenwagen gelangen kaum ins Gelände. Helikoptertaugliches Wetter ist deshalb immer ein Aspekt bei der Freigabe einer Etappe.'
      },
      {
        kind: 'paragraph',
        html: 'Insgesamt passiert erstaunlich wenig: Bei der SOW 2023 gab es pro Etappe mit rund 4000 Starts «nur» 150 Konsultationen beim Sanitätsdienst – knapp 20 Verrenkungen, ebenso viele Prellungen, rund 40 kleine Verbände und pro Etappe eine Naht. Pro Etappe waren im Schnitt 0,3 Helikoptereinsätze nötig. Die geringen Fallzahlen deuten darauf hin, dass OL-Läuferinnen und -Läufer bis ins hohe Alter fit sind und sich kaum unnötigen Gefahren aussetzen.'
      },
      {
        kind: 'pullquote',
        text: '«Auf den ersten Blick erscheinen die Gelände voralpin und einfach, doch das täuscht.»'
      },
      {
        kind: 'infobox',
        title: 'Herausforderungen in der Zukunft',
        intro:
          'Grossanlässe wie die Swiss O Week werden zunehmend mit Anforderungen aus Natur- und Landschaftsschutz konfrontiert. Bewilligungsverfahren in Gebirgskantonen (VS, GR, BE) werden aufwändiger, nutzbare Flächen knapper – Flachmoore gelten heute als deutlich heikler als noch vor zehn Jahren. Umso wichtiger werden nachhaltige Planung, enge Zusammenarbeit mit Behörden und ein sensibler Umgang mit der Natur.'
      },
      { kind: 'heading', text: 'Bist du 2026 in Portes du Soleil dabei?' },
      {
        kind: 'paragraph',
        html: 'Für die kommende Swiss O Week in Portes du Soleil liegen Konzepte und Notfallszenarien bereit – entworfen in der Hoffnung, sie nie verwenden zu müssen. Drei Dinge unterscheiden die diesjährige Austragung: die französische Sprache, die Grenzüberschreitung mit drei Etappen in Frankreich und das trügerische voralpine Gelände. Die Anmeldung für die Leistungskategorien lief bis am 31. Mai 2026, jene für die Holiday- und Challenge-Kategorien bis am 30. Juni 2026.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'herzgesundheit-so-staerkst-du-deinen-motor',
    kicker: 'Medizin · Herzgesundheit',
    title: 'So stärkst du deinen Motor – aber aufgepasst!',
    lead: 'Ohne gesundes Herz kein Leistungssport. Worauf vor allem junge Athletinnen und Athleten achten sollten, welcher Trainingsumfang die Pumpe zu Höchstleistungen antreibt und warum nicht nur Ausdauertraining gut fürs Herz ist – erklärt mit Hilfe eines Experten.',
    author: 'Nik Walter',
    date: '2026-05-20',
    readingMinutes: 6,
    hero: '/magazine/herz-hero.jpg',
    heroCaption:
      'Jungen Menschen wird für eine optimale Herzgesundheit ein regelmässiger Herzcheck empfohlen.',
    heroCredit: 'Foto: iStockphoto.com / ipopba',
    premium: true,
    previewBlocks: 2,
    blocks: [
      {
        kind: 'paragraph',
        dropcap: true,
        html: '«Exercise is a pill», pflegt man zu sagen, oder auch: «Sport ist die beste Medizin». Und ja, diese Bonmots haben viel Wahres – Sport ist eigentlich gesund, und Menschen, die Sport treiben, sind ebenfalls eigentlich gesund. Doch es gibt auch das, was der Sportkardiologe Christian Schmied vom Herzzentrum Hirslanden das «Sport-Paradox» nennt.'
      },
      {
        kind: 'paragraph',
        html: 'Neben all den positiven Effekten von Bewegung gebe es auch negative, sagt er – vor allem bei einem «Zuviel an Sport». «Gerade Elite-Ausdauer-Athletinnen und -Athleten bewegen sich regelmässig in einem Bereich, der potenziell schädlich ist fürs Herz.» Wir liefern die Antworten auf die wichtigsten Fragen zur Herzgesundheit.'
      },
      {
        kind: 'qa',
        q: 'Worauf sollten Läuferinnen und Läufer generell achten?',
        a: 'Prinzipiell bringt es sehr viel, regelmässig Sport zu treiben. Wer dabei auf das Gewicht achtet, sich gesund ernährt und Stress vermeidet, vergrössert den Effekt deutlich. Die grössten Risiken sind laut Schmied «Rauchen, Übergewicht und Stress – sowie zu hohe Cholesterinwerte und Bluthochdruck». Auch zu wenig Bewegung steht auf der Liste der Risikofaktoren.'
      },
      {
        kind: 'qa',
        q: 'Braucht es regelmässige Routine-Untersuchungen? Und wer profitiert am meisten?',
        a: 'Christian Schmied rät vor allem jungen OL-Läuferinnen und -Läufern bis zum Alter von 30 bis 35 Jahren, sich alle ein bis zwei Jahre einem Herzcheck zu unterziehen. Dieser besteht aus einer kurzen Untersuchung mit spezifischen Fragen sowie einem EKG. «Das ist extrem günstig und zuverlässig.» Die grosse Stärke solcher Screenings sei es, angeborene Herzfehler zu entdecken – mit dem Ziel, einen plötzlichen Herztod zu verhindern. «Es geht keinesfalls um eine blinde Disqualifikation.»'
      },
      {
        kind: 'qa',
        q: 'Welche Trainingsformen sind besonders gut fürs Herz?',
        a: 'Lange galt Ausdauertraining als das Herz-Training schlechthin – «man nennt es ja auch ‹Kardio›». «Heute weiss man aber, dass auch Intervall- und Krafttrainings hoch effektiv sind für die Herzgesundheit.» Der Skelettmuskel ist hormonell betrachtet unser grösstes Organ; mehr Muskelmasse bedeutet mehr positive hormonelle Effekte. Schmied rät zu einer Mischung aus Ausdauer-, Intervall- und Krafttraining.'
      },
      {
        kind: 'pullquote',
        text: '«Man kann sich durch zu viel Sport Herzkrankheiten antrainieren. Das heisst aber nicht, dass man weniger Sport treiben soll.»'
      },
      {
        kind: 'qa',
        q: 'Kann man mit falschem oder zu viel Training dem Herzen schaden?',
        a: 'Je mehr man trainiert, desto stärker vergrössert sich tendenziell der Herzmuskel. Ein grösseres Herz ist zwar leistungsfähiger, doch ein vergrösserter Vorhof ist eine bekannte Erscheinung bei Ausdauersportlern – und je grösser der Vorhof, desto höher das Risiko für Vorhofflimmern, was wiederum Schlaganfall- und Herzschwäche-Risiko erhöht. Ab einem Trainingsumfang von acht bis zehn Stunden pro Woche sei ein regelmässiger sportkardiologischer Routinecheck wichtig.'
      },
      {
        kind: 'qa',
        q: 'Worauf müssen Herzpatientinnen achten?',
        a: '«Es gibt fast keine Herzkrankheit, bei der Sport keinen positiven Effekt hat», sagt Schmied. Einzige Ausnahme sei die arrhythmogene Kardiopathie. «Sport gehört zur Therapie.» Auch hier rät er zu einer Kombination aus Ausdauer-, Intervall- und Krafttraining – «aber immer mit der nötigen Vorsicht». Selbst statische Kraftübungen wie Planks oder Wandsitz können helfen, den Blutdruck langfristig zu senken.'
      },
      {
        kind: 'qa',
        q: 'Was gilt es bei Läufen in alpinen Regionen zu beachten?',
        a: 'Wer diesen Sommer an der Swiss O Week «Portes du Soleil» teilnimmt, dem rät Schmied, drei bis vier Tage früher anzureisen, damit sich der Körper an die Höhenlage anpassen kann. «Wer erst am ersten Wettkampftag anreist und gerade losläuft, ist deutlich weniger leistungsfähig.» Für OL in alpinen Regionen sieht Schmied ansonsten nur positive Effekte – «und das gilt auch für Herzpatienten».'
      },
      {
        kind: 'expert',
        name: 'Prof. Dr. med. Christian M. Schmied',
        image: '/magazine/herz-schmied.jpg',
        html: 'Facharzt für Allgemeine Innere Medizin und Kardiologie mit Schwerpunkt Sport- und Bewegungsmedizin am Herzzentrum der Hirslanden-Klinik in Zürich.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'top-flop-nationale-ol',
    kicker: 'Top & Flop · Nationale OL',
    title: 'Chirurgische Präzision – und ein geglückter Neustart',
    lead: 'Zwei Läufe vom nationalen Saisonauftakt: Wie der Lette Uldis Upitis die Langdistanz im Forst sezierte – und wie Lisa Hubmann nach zwei Fehlstarts in Utzigenwil noch auf Rang zwei lief.',
    author: 'Jonas Merz',
    date: '2026-04-30',
    readingMinutes: 5,
    hero: '/magazine/forst-map.jpg',
    heroCaption: '2. Nationaler OL – Karte Forst, Langdistanz.',
    heroCredit: 'Karte: OLG Bern',
    premium: false,
    previewBlocks: 99,
    blocks: [
      { kind: 'heading', text: 'Top: Erfolgreicher Zwischenstopp' },
      {
        kind: 'paragraph',
        dropcap: true,
        html: 'Eigentlich war Uldis Upitis nur auf der Durchreise. Der lettische Eliteläufer war auf dem Weg von Albertville, wo er den Winter verbracht hatte, zurück nach Lettland – und packte die Chance, in der Schweiz etwas Erfahrung im hiesigen Gelände zu sammeln. Beim ersten nationalen Weekend des Jahres gewann er die Langdistanz prompt mit über sechs Minuten Vorsprung.'
      },
      {
        kind: 'figure',
        src: '/magazine/upitis.jpg',
        caption:
          'Uldis Upitis setzte seinen Plan mit chirurgischer Präzision um.',
        credit: 'Foto: Silvan Schletti'
      },
      {
        kind: 'paragraph',
        html: 'Ein konkretes Bild des Geländes hatte er im Vorfeld keines – sein grösster Erfahrungsschatz war das Rennen vom Vortag. Dazu gehörte, dass er grüne Abschnitte vermeiden wollte und dass man auf Strassen und Pfaden manchmal weit vom Strich abweichen darf, um schnell zu sein. Upitis setzte den Plan mit solcher Genauigkeit um, dass seine Routen aussehen, als seien sie mit dem Skalpell in die Laufkarte geschnitten worden.'
      },
      {
        kind: 'paragraph',
        html: 'Schon bei Posten eins übernahm er das Zepter und trug es bis ins Ziel. Besonders gelungen sei die Verbindung zum 15. Posten: «Ich hatte die klare Vorstellung, alles Grüne zu vermeiden. Auf der Karte sah alles weiss und flach aus, deshalb habe ich mich für die direkte Variante entschieden.» Nur einmal geriet er kurz unter Druck, als ihn bei Posten 18 umgestürzte Bäume zum Geradeauslaufen zwangen und er kurz den Überblick verlor.'
      },
      {
        kind: 'pullquote',
        text: 'Auch eine Blinddarmoperation will solide durchgeführt sein, nicht nur der komplizierte Knochenbruch.'
      },
      {
        kind: 'paragraph',
        html: 'Bis ins Ziel baute er den Vorsprung auf den zweitplatzierten Deutschen Marek Pompe auf über sechs Minuten aus. Auch wenn der Lauf wohl nicht zu den technischsten in der Karriere des 28-Jährigen zählt: Der Zwischenstopp auf der Durchreise dürfte ihm einiges an Selbstvertrauen für die Saison in den baltischen Staaten mitgegeben haben.'
      },
      { kind: 'heading', text: 'Flop: Zurück zum Start' },
      {
        kind: 'paragraph',
        html: 'Der Saisonbeginn ist jener Moment, in dem das metaphorisch leere Blatt Papier zur Reinschrift bereitliegt. Lisa Hubmanns Wintertraining verlief reibungslos, die Vorfreude war gross. Bewusst Zeit in die Kartenarbeit investieren und so die Grundlage für einen sauberen Lauf legen, lautete der Plan der jungen Nordostschweizerin – beim ersten Nationalen OL der Saison in Utzigenwil.'
      },
      {
        kind: 'figure',
        src: '/magazine/utzigen-map.jpg',
        caption: '1. Nationaler OL – Karte Utzigenwil.',
        credit: 'Karte: OL Regio Burgdorf'
      },
      {
        kind: 'paragraph',
        html: 'Zum ersten Posten wollte sie nahe am Strich bleiben und den gelben Passagen folgen. Doch frisch gefallener Frühlingsschnee färbte die gelben Flächen weiss und sorgte für einen neuen Trampelpfad ab dem Start. Hubmann folgte dieser Spur, überquerte einen Weg – und erkannte am zweiten Weg, dass sie falsch gelaufen war. Beim Auffangen verwechselte sie eine Kurve und fand sich fast wieder am Ausgangspunkt ihrer Irrfahrt.'
      },
      {
        kind: 'figure',
        src: '/magazine/hubmann.jpg',
        caption:
          'Lisa Hubmann fing sich nach zwei Fehlern und lief noch auf Rang zwei.',
        credit: 'Foto: Silvan Schletti'
      },
      {
        kind: 'paragraph',
        html: 'Die Suchaktion kostete drei Minuten und erhöhte das Stresslevel. Der hastig gefasste Plan zum zweiten Posten lautete gleich – und ging erneut schief: zu früh nach links korrigiert, weitere eineinhalb Minuten verloren. Erschwerend zog die drei Minuten später gestartete D20-Läuferin Henriette Radzikowski an ihr vorbei.'
      },
      {
        kind: 'paragraph',
        html: 'Vor dem Stempeln des zweiten Postens blieb Hubmann kurz stehen und raffte sich neu auf. Und als wäre es so einfach wie das Anpflanzen von Kresse auf der Fensterbank, gelang ihr ab diesem Moment ein beinahe perfektes Rennen. 25 Positionen – vom letzten Zwischenrang bei Posten zwei bis auf Rang zwei hinter Sofie Bachmann im Ziel – machte sie noch gut.'
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'ol-im-alpinen-raum-training',
    kicker: 'Training & Technik · OL im alpinen Raum',
    title: 'Mit dem richtigen Training hoch hinaus',
    lead: 'Viel Steigung, anspruchsvolle Belaufbarkeit, weite Sicht: Wettkämpfe in alpinem Gelände bringen eigene Herausforderungen mit sich. Fünf Trainingstipps, wie OL in den Bergen sowohl zum Erfolg als auch zum Genuss wird.',
    author: 'Véronique Ruppenthal',
    date: '2026-05-12',
    readingMinutes: 6,
    hero: '/magazine/training-hero.jpg',
    heroCaption:
      'Den Blick gezielt in die Ferne richten und entfernte Geländekammern erkennen, unterstützt eine präzise Routenplanung.',
    heroCredit: 'Foto: Simon Buser',
    premium: false,
    previewBlocks: 99,
    blocks: [
      {
        kind: 'paragraph',
        dropcap: true,
        html: 'Der Wechsel zwischen schnellen Alpweiden, detaillierten Geländekammern und ruppigen Wäldchen, umgeben von verschneiten Berggipfeln, lässt Schweizer OL-Herzen höherschlagen. 2026 richtet sich das Augenmerk insbesondere auf die Swiss O Week in Portes du Soleil: Sechs Etappen zwischen 1500 und 2200 m ü. M. versprechen Alpin-OL vom Feinsten. Damit dabei nicht nur die Aussicht zum Genuss wird, lohnt sich etwas Vorbereitung. Nachfolgend fünf Haupt-Herausforderungen – und das passende Training dazu.'
      },
      { kind: 'heading', num: 1, text: 'Steigung' },
      {
        kind: 'paragraph',
        html: 'Da sich alpine Laufgebiete meist über einen Hang erstrecken, kommen mit der Bahnanlage in der Regel viele Steigungsmeter zusammen. Nicht selten sind lange Bergauf-Abschnitte am Stück zu absolvieren. Auch Downhill-Passagen dürfen nicht unterschätzt werden – ihre muskuläre Belastung wird oft übersehen.'
      },
      {
        kind: 'list',
        title: 'Trainingsideen',
        items: [
          {
            text: 'Spezifisches Krafttraining mit Fokus Beine und Rumpf (z. B. Step-ups, Ausfallschritt-Kniebeugen mit erhöhtem hinterem Fuss).'
          },
          {
            text: 'Berg-Intervalle und Hügelsprints (z. B. 4 × 4 Minuten intensiv oder 20 × 45 Sekunden Vollgas bergauf, mit lockerem Bergabjoggen).'
          },
          {
            text: 'In einen Dauerlauf Downhill-Abschnitte einbauen und diese zügig, aber kontrolliert absolvieren.'
          }
        ]
      },
      { kind: 'heading', num: 2, text: 'Belaufbarkeit' },
      {
        kind: 'paragraph',
        html: 'Über schnelle Wiesen allein rennt man selten. Oft ist der Boden ruppig: feuchte Erde, von Viehtritten durchsetzte Hänge, Stein- und Blockfelder, je nach Gebiet auch Sümpfe, Karren oder Schneefelder. Das erfordert aufmerksames und koordinativ bewusstes Laufen.'
      },
      {
        kind: 'list',
        title: 'Trainingsideen',
        items: [
          {
            text: 'Koordinationsübungen in den Dauerlauf einbauen (Lauf-ABC, Koordinationsleiter).'
          },
          { text: 'Rumpfkrafttraining, z. B. Plank-Variationen.' },
          {
            text: 'Fussgymnastik wie Einbeinstand auf instabiler Unterlage oder Zehenkrallen.'
          },
          { text: 'Intervalle oder Dauerläufe querfeldein.' }
        ]
      },
      { kind: 'heading', num: 3, text: 'Geländewechsel' },
      {
        kind: 'paragraph',
        html: 'Eine orientierungstechnische Herausforderung sind die häufig wechselnden Geländearten – oft gegensätzliche Extreme: Auf Passagen über offene Alpweiden folgen kurze Posten in detaillierten, mit Steinen übersäten Wäldchen. Nicht nur das Lauftempo, auch die O-Technik muss flexibel angepasst werden.'
      },
      {
        kind: 'list',
        title: 'Trainingsideen',
        items: [
          {
            text: 'Im OL-Training Geländewechsel erkennen und ein Ampelsystem anwenden (grün = voll rennen, orange = aufmerksam, rot = abbremsen und Karte lesen).'
          },
          {
            text: 'In der Vorbereitung bewusst machen, in welchen Geländekammern welche O-Technik wichtig ist.'
          }
        ]
      },
      { kind: 'heading', num: 4, text: 'Weite Sicht (O-technisch)' },
      {
        kind: 'paragraph',
        html: 'Die weite Sicht im offenen Gelände ist auch unterwegs hilfreich: Mit erhobenem Kopf lassen sich weit entfernte Geländeformen früh erkennen, was bei Planung und Umsetzung der Route Zeit spart. Vielleicht lässt sich sogar der nächste Postenstandort erspähen.'
      },
      {
        kind: 'list',
        title: 'Trainingsideen',
        items: [
          {
            text: 'Üben, den Kopf aktiv hochzuhalten und den Blick nach vorne zu nehmen (beim Weglaufen vom Posten zuerst nach vorne, nicht auf die Karte).'
          },
          {
            text: 'Kartenbild vereinfachen, markante Objekte erkennen und im Gelände zuordnen.'
          },
          {
            text: 'In der Vorbereitung Höhenkurven studieren und grobe Geländezüge verstehen.'
          }
        ]
      },
      { kind: 'heading', num: 5, text: 'Weite Sicht (mental)' },
      {
        kind: 'paragraph',
        html: 'Auch mental kann die weite Sicht fordern: Ein steiler Hang wirkt mühsamer, wenn der ganze Anstieg überblickbar ist, und am Horizont wird mitunter die Konkurrenz gesichtet. Umstände, die die eigene Leistung beeinflussen können.'
      },
      {
        kind: 'list',
        title: 'Trainingsideen',
        items: [
          {
            text: 'Ein «Drehbuch» schreiben, wie in verschiedenen Fällen reagiert wird (z. B. bei Gegnerkontakt Fokus auf die eigene Routenplanung).'
          },
          {
            text: 'Route oder Hang mental in kleinere Abschnitte unterteilen («bis zu diesem Stein, dann bis zum Weg»).'
          },
          {
            text: 'Positive Selbstgespräche üben («Ich weiss, dass ich es draufhabe»).'
          }
        ]
      },
      {
        kind: 'paragraph',
        html: 'Wer die verbleibende Zeit bis zum nächsten OL in den Bergen mit den richtigen Trainingsreizen nutzt, wird diesen physisch, kartentechnisch und mental nicht nur bewältigen, sondern auch mit Freude und bestenfalls Erfolg absolvieren.'
      }
    ]
  }
]

export function getMagazineArticle(slug: string): MagazineArticle | undefined {
  return magazineArticles.find((a) => a.slug === slug)
}
