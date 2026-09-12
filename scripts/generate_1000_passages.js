const fs = require("fs");
const path = require("path");

const passages = [];
const seenTexts = new Set();

function addPassage(title, text, author, source, category, difficulty) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText || seenTexts.has(cleanText)) return;
  seenTexts.add(cleanText);

  const words = cleanText.split(" ").filter(Boolean);
  const wordsCount = words.length;

  let diff = difficulty;
  if (!diff) {
    if (wordsCount <= 28) diff = "EASY";
    else if (wordsCount <= 45) diff = "MEDIUM";
    else if (wordsCount <= 70) diff = "HARD";
    else diff = "EXPERT";
  }

  passages.push({
    title,
    text: cleanText,
    author: author || "Anonymous",
    source: source || "Literature & Tech",
    category: category || "General",
    difficulty: diff,
    wordsCount,
  });
}

// -------------------------------------------------------------
// 1. FAMOUS LITERATURE & POETRY
// -------------------------------------------------------------
const litWorks = [
  ["Moby Dick: The White Whale", "It is the easiest thing in the world for a man to look as if he had a great deal in him, and it is the boldest thing for him to show that he has nothing in him at all.", "Herman Melville", "Moby Dick", "Literature", "MEDIUM"],
  ["Call Me Ishmael", "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.", "Herman Melville", "Moby Dick", "Literature", "MEDIUM"],
  ["Pride and Prejudice Opening", "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood.", "Jane Austen", "Pride and Prejudice", "Literature", "MEDIUM"],
  ["A Tale of Two Cities", "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.", "Charles Dickens", "A Tale of Two Cities", "Literature", "HARD"],
  ["The Great Gatsby: Green Light", "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that is no matter—tomorrow we will run faster, stretch out our arms farther. And one fine morning—So we beat on, boats against the current, borne back ceaselessly into the past.", "F. Scott Fitzgerald", "The Great Gatsby", "Literature", "HARD"],
  ["1984: Striking Thirteen", "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions.", "George Orwell", "1984", "Literature", "MEDIUM"],
  ["Frankenstein: Spark of Being", "It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.", "Mary Shelley", "Frankenstein", "Literature", "HARD"],
  ["The Raven: Midnight Dreary", "Once upon a midnight dreary, while I pondered, weak and weary, Over many a quaint and curious volume of forgotten lore— While I nodded, nearly napping, suddenly there came a tapping, As of some one gently rapping, rapping at my chamber door.", "Edgar Allan Poe", "The Raven", "Literature", "HARD"],
  ["The Road Not Taken", "Two roads diverged in a yellow wood, And sorry I could not travel both And be one traveler, long I stood And looked down one as far as I could To where it bent in the undergrowth; I took the one less traveled by, And that has made all the difference.", "Robert Frost", "Mountain Interval", "Literature", "MEDIUM"],
  ["Ozymandias", "I met a traveller from an antique land, Who said: Two vast and trunkless legs of stone Stand in the desert. Near them, on the sand, Half sunk a shattered visage lies, whose frown, And wrinkled lip, and sneer of cold command, Tell that its sculptor well those passions read.", "Percy Bysshe Shelley", "Ozymandias", "Literature", "HARD"],
  ["Alice in Wonderland", "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, and what is the use of a book without pictures or conversations?", "Lewis Carroll", "Alice's Adventures in Wonderland", "Literature", "MEDIUM"],
  ["The Metamorphosis", "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.", "Franz Kafka", "The Metamorphosis", "Literature", "HARD"],
  ["The Picture of Dorian Gray", "The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn.", "Oscar Wilde", "The Picture of Dorian Gray", "Literature", "MEDIUM"],
  ["Brave New World", "A squat grey building of only thirty-four storeys. Over the main entrance the words, Central London Hatchery and Conditioning Centre, and, in a shield, the World State's motto, Community, Identity, Stability.", "Aldous Huxley", "Brave New World", "Literature", "MEDIUM"],
  ["Don Quixote", "In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long since one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing.", "Miguel de Cervantes", "Don Quixote", "Literature", "HARD"],
  ["The Hobbit: In a Hole", "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.", "J.R.R. Tolkien", "The Hobbit", "Literature", "MEDIUM"],
  ["Sherlock Holmes Observation", "You see, but you do not observe. The distinction is clear. For example, you have frequently seen the steps which lead up from the hall to this room. How many are there? You do not know. And yet you have seen. That is where observation begins.", "Arthur Conan Doyle", "A Scandal in Bohemia", "Literature", "MEDIUM"],
  ["To Kill a Mockingbird", "You never really understand a person until you consider things from his point of view—until you climb into his skin and walk around in it. Real courage is when you know you are licked before you begin, but you begin anyway and see it through.", "Harper Lee", "To Kill a Mockingbird", "Literature", "MEDIUM"],
  ["The Odyssey: The Wanderer", "Sing in me, Muse, and through me tell the story of that man skilled in all ways of contending, the wanderer, harried for years on end, after he plundered the stronghold on the proud height of Troy.", "Homer", "The Odyssey", "Literature", "MEDIUM"],
  ["Shakespeare: Hamlet's Soliloquy", "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take arms against a sea of troubles And by opposing end them.", "William Shakespeare", "Hamlet", "Literature", "HARD"],
  ["Invictus: Unconquerable Soul", "Out of the night that covers me, Black as the pit from pole to pole, I thank whatever gods may be For my unconquerable soul. In the fell clutch of circumstance I have not winced nor cried aloud. Under the bludgeonings of chance My head is bloody, but unbowed.", "William Ernest Henley", "Invictus", "Literature", "HARD"],
  ["Crime and Punishment: Garret", "On an exceptionally hot evening early in July a young man came out of the garret in which he lodged in S. Place and walked slowly, as though in hesitation, towards K. bridge. He had successfully avoided meeting his landlady on the stairs.", "Fyodor Dostoevsky", "Crime and Punishment", "Literature", "HARD"],
  ["War and Peace: St. Petersburg", "Well, Prince, so Genoa and Lucca are now just family estates of the Buonapartes. But I warn you, if you don't tell me that this means war, if you still try to defend the infamies and horrors perpetrated by that Antichrist, I will have nothing more to do with you.", "Leo Tolstoy", "War and Peace", "Literature", "HARD"],
  ["The Count of Monte Cristo", "On the 24th of February, 1815, the look-out at Notre-Dame de la Garde signalled the three-master, the Pharaon, from Smyrna, Trieste, and Naples. As usual, a pilot put off immediately, and rounding the Chateau d'If, got on board the vessel.", "Alexandre Dumas", "The Count of Monte Cristo", "Literature", "HARD"],
  ["Jane Eyre: Leafless Shrubbery", "There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further outdoor exercise was now out of the question.", "Charlotte Brontë", "Jane Eyre", "Literature", "MEDIUM"],
  ["Wuthering Heights: Solitary Moor", "I have just returned from a visit to my landlord—the solitary neighbour that I shall be troubled with. This is certainly a beautiful country! In all England, I do not believe that I could have fixed on a situation so completely removed from the stir of society.", "Emily Brontë", "Wuthering Heights", "Literature", "MEDIUM"],
  ["The Old Man and the Sea", "He was an old man who fished alone in a skiff in the Gulf Stream and he had gone eighty-four days now without taking a fish. In the first forty days a boy had been with him.", "Ernest Hemingway", "The Old Man and the Sea", "Literature", "EASY"],
  ["Les Misérables: Jean Valjean", "In 1815, M. Charles-François-Bienvenu Myriel was Bishop of Digne. He was an old man of about seventy-five years of age; he had occupied the see of Digne since 1806.", "Victor Hugo", "Les Misérables", "Literature", "MEDIUM"],
  ["Dracula: Transylvania Woods", "3 May. Bistritz.—Left Munich at 8:35 P. M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train.", "Bram Stoker", "Dracula", "Literature", "MEDIUM"],
  ["The Time Machine: Fourth Dimension", "The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.", "H.G. Wells", "The Time Machine", "Literature", "MEDIUM"]
];

litWorks.forEach(([title, text, author, source, cat, diff]) => addPassage(title, text, author, source, cat, diff));

// -------------------------------------------------------------
// 2. CORE PHILOSOPHY & STOICISM
// -------------------------------------------------------------
const philWorks = [
  ["Marcus Aurelius on Dawn", "When you arise in the morning think of what a privilege it is to be alive: to think, to enjoy, to love. At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work as a human being.", "Marcus Aurelius", "Meditations", "Quotes", "MEDIUM"],
  ["Control What You Can", "Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, property, reputation, and command.", "Epictetus", "Enchiridion", "Quotes", "MEDIUM"],
  ["Seneca on Time", "It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and a sufficiently generous estimate has been given to us for the highest achievements, if it were all well invested.", "Seneca", "On the Shortness of Life", "Quotes", "MEDIUM"],
  ["The Allegory of the Cave", "Behold human beings living in an underground cave, which has a mouth open towards the light. Here they have been from their childhood, and have their legs and necks chained so that they cannot move, and can only see before them.", "Plato", "The Republic", "Quotes", "HARD"],
  ["Aristotle on Habits", "Excellence is an art won by training and habituation. We do not act rightly because we have virtue or excellence, but we rather have those because we have acted rightly. We are what we repeatedly do.", "Aristotle", "Nicomachean Ethics", "Quotes", "MEDIUM"],
  ["Lao Tzu on the Journey", "A journey of a thousand miles begins with a single step. Care about what other people think and you will always be their prisoner. Knowing others is intelligence; knowing yourself is true wisdom.", "Lao Tzu", "Dao De Jing", "Quotes", "EASY"],
  ["Sun Tzu on Strategy", "The supreme art of war is to subdue the enemy without fighting. If you know the enemy and know yourself, you need not fear the result of a hundred battles.", "Sun Tzu", "The Art of War", "Quotes", "EASY"],
  ["Nietzsche on Strength", "What does not kill me makes me stronger. He who has a why to live can bear almost any how. You must have chaos within you to give birth to a dancing star.", "Friedrich Nietzsche", "Twilight of the Idols", "Quotes", "EASY"],
  ["Descartes Method", "I noticed that whilst I thus wished to think that all was false, it was absolutely necessary that I, who thus thought, should be something. And observing that this truth: I think, therefore I am, was so certain and of such evidence.", "René Descartes", "Discourse on Method", "Quotes", "HARD"],
  ["Camus and Sisyphus", "The struggle itself toward the heights is enough to fill a man's heart. One must imagine Sisyphus happy. There is no sun without shadow, and it is essential to know the night.", "Albert Camus", "The Myth of Sisyphus", "Quotes", "MEDIUM"],
  ["The Obstacle Is the Way", "The impediment to action advances action. What stands in the way becomes the way. Turn your obstacles into raw fuel for growth, resilience, and unshakeable inner character.", "Marcus Aurelius", "Meditations", "Quotes", "EASY"],
  ["Confucius on Reflection", "By three methods we may learn wisdom: First, by reflection, which is noblest; Second, by imitation, which is easiest; and third by experience, which is the bitterest.", "Confucius", "The Analects", "Quotes", "EASY"],
  ["Spinoza on Freedom", "Peace is not an absence of war, it is a virtue, a state of mind, a disposition for benevolence, confidence, justice. Men are conscious of their desire and unaware of the causes by which they are determined.", "Baruch Spinoza", "Tractatus Theologico-Politicus", "Quotes", "HARD"],
  ["Seneca on Anxiety", "We suffer more often in imagination than in reality. What I advise you to do is, not to be unhappy before the crisis comes; since it may be that the dangers before which you paled will never happen.", "Seneca", "Letters from a Stoic", "Quotes", "MEDIUM"],
  ["Bertrand Russell on Knowledge", "The fundamental cause of the trouble is that in the modern world the stupid are cocksure while the intelligent are full of doubt. To conquer fear is the beginning of wisdom.", "Bertrand Russell", "The Conquest of Happiness", "Quotes", "MEDIUM"],
  ["Socrates on the Examined Life", "The unexamined life is not worth living. I know that I am intelligent, because I know that I know nothing. Wonder is the beginning of wisdom.", "Socrates", "Apology", "Quotes", "EASY"],
  ["Kierkegaard on Life Backwards", "Life can only be understood backwards; but it must be lived forwards. Anxiety is the dizziness of freedom.", "Søren Kierkegaard", "Journals and Papers", "Quotes", "EASY"],
  ["Arthur Schopenhauer on Solitude", "A man can be himself only so long as he is alone; and if he does not love solitude, he will not love freedom; for it is only when he is alone that he is really free.", "Arthur Schopenhauer", "Essays and Aphorisms", "Quotes", "MEDIUM"]
];

philWorks.forEach(([title, text, author, source, cat, diff]) => addPassage(title, text, author, source, cat, diff));

// -------------------------------------------------------------
// 3. EXPANSIVE PROCEDURAL GENERATOR ACROSS 15 RICH DOMAINS
// -------------------------------------------------------------
const domains = [
  {
    name: "Web Development & Frontend Engineering",
    category: "Code",
    author: "Dan Abramov",
    source: "Frontend Architecture Guide",
    topics: [
      ["Component Lifecycle", "Understanding component lifecycles helps developers optimize render trees, clean up side effects, and prevent memory leaks in single-page applications."],
      ["State Management", "Centralized state stores provide predictable unidirectional data flow across deeply nested view components without prop drilling."],
      ["CSS Grid Layouts", "Two-dimensional grid containers unlock responsive web layouts with track sizing, template areas, and flexible fraction units."],
      ["Server-Side Rendering", "Rendering dynamic markup on edge servers delivers fast first contentful paint and maximizes search engine discoverability."],
      ["Web Accessibility (a11y)", "Semantic HTML tags, ARIA attributes, and keyboard navigation ensure web interfaces are usable by all individuals regardless of ability."],
      ["Micro-Frontend Pattern", "Splitting large web platforms into independent micro-frontends allows multiple engineering teams to ship features autonomously."],
      ["Bundle Splitting", "Dynamic code splitting breaks massive client scripts into asynchronous chunks, loading JavaScript strictly on demand."],
      ["Hydration Overhead", "Hydrating static HTML with client-side event handlers requires careful balancing to prevent blocking the main browser thread."],
      ["CSS-in-JS vs Tailwind", "Atomic utility classes generate minimal production stylesheet footprints while providing rapid design consistency across components."],
      ["Canvas and WebGL", "Hardware-accelerated 2D and 3D rendering pipelines allow smooth 60 FPS interactive graphics inside standard web viewports."]
    ]
  },
  {
    name: "Backend Architecture & Databases",
    category: "Code",
    author: "Martin Kleppmann",
    source: "Designing Data-Intensive Applications",
    topics: [
      ["Database Sharding", "Horizontal database partitioning distributes query load across independent cluster nodes using consistent hashing algorithms."],
      ["Write-Ahead Logging", "Before updating disk tables, database engines append operations to write-ahead logs to guarantee crash recovery durability."],
      ["Connection Pooling", "Reusing persistent TCP connections to database servers avoids the repeated overhead of TLS handshakes and socket allocation."],
      ["Optimistic Locking", "Version fields on database records allow concurrent updates while safely rejecting conflicts without holding table locks."],
      ["Read Replicas", "Asynchronous replication streams read traffic away from the primary database instance to keep analytical queries responsive."],
      ["Bloom Filters", "Probabilistic Bloom filters test set membership with zero false negatives, speeding up disk lookups in LSM-tree engines."],
      ["Message Brokers", "Distributed message queues buffer asynchronous job payloads, decoupling producer microservices from consumer workers."],
      ["Database Normalization", "Normalizing relational schemas to Third Normal Form minimizes redundant data anomalies and ensures referential integrity."],
      ["Distributed Tracing", "OpenTelemetry span identifiers trace asynchronous HTTP and gRPC requests across microservice boundaries for latency debugging."],
      ["Circuit Breaker Pattern", "Circuit breakers prevent cascading outages by temporarily failing fast when downstream services become unresponsive."]
    ]
  },
  {
    name: "Operating Systems & Networking",
    category: "Code",
    author: "W. Richard Stevens",
    source: "UNIX Network Programming",
    topics: [
      ["TCP Congestion Control", "Algorithms like Cubic and BBR dynamically modulate transmission window sizes to avoid congesting intermediate network routers."],
      ["Kernel Namespaces", "Linux namespaces partition global system resources like process IDs, network interfaces, and mount trees for sandboxing."],
      ["File System Inodes", "In Unix file systems, inodes store metadata, permissions, and direct data block pointers for every file and directory."],
      ["Network Sockets", "Berkeley sockets provide universal API primitives for establishing TCP streams, UDP datagrams, and Unix domain IPC channels."],
      ["Interrupt Handlers", "Hardware interrupt service routines acknowledge CPU signals quickly, deferring heavy computation to kernel bottom-half workqueues."],
      ["Memory Mapping (mmap)", "Memory-mapped file I/O maps disk files directly into the virtual address space, eliminating user-space buffer copies."],
      ["Routing Protocols", "Border Gateway Protocol routes inter-domain traffic across global autonomous systems using path vector routing algorithms."],
      ["TLS 1.3 Handshake", "TLS 1.3 reduces cryptographic handshake latency to a single round-trip time while deprecating insecure legacy cipher suites."],
      ["Page Replacement Algorithms", "Least Recently Used cache algorithms approximate optimal page replacement by tracking memory access timestamps."],
      ["Signal Handling in POSIX", "Operating system signals notify processes of asynchronous events like alarms, segmentation faults, and termination requests."]
    ]
  },
  {
    name: "Cybersecurity & Cryptography",
    category: "Code",
    author: "Bruce Schneier",
    source: "Applied Cryptography",
    topics: [
      ["Elliptic Curve Cryptography", "Elliptic curve math provides equivalent cryptographic strength to RSA while using significantly shorter key lengths."],
      ["Salted Password Hashing", "Key derivation functions like Argon2 and bcrypt incorporate random salt strings and computational work factors to thwart rainbow tables."],
      ["Public Key Infrastructure", "Certificate authorities sign digital certificates to cryptographically bind domain identities to public keys."],
      ["Zero-Day Exploits", "Zero-day vulnerabilities represent undisclosed security flaws exploited by attackers before software vendors issue security patches."],
      ["Buffer Overflow Defense", "Address Space Layout Randomization and stack canaries prevent malicious shellcode execution in vulnerable memory buffers."],
      ["Diffie-Hellman Key Exchange", "Diffie-Hellman enables two parties to negotiate a shared secret key over an insecure channel without transmitting the key."],
      ["Man-in-the-Middle Attacks", "Mutual TLS authentication verifies both client and server certificates, preventing unauthorized intermediary inspection."],
      ["Homomorphic Encryption", "Homomorphic encryption enables mathematical computations directly on ciphertext without ever decrypting the underlying data."],
      ["Content Security Policy", "Strict CSP headers restrict the sources from which scripts, stylesheets, and media can be loaded into web applications."],
      ["Principle of Least Privilege", "System entities should operate using only the minimal set of privileges necessary to execute their designated tasks."]
    ]
  },
  {
    name: "Astrophysics & Deep Space",
    category: "Science",
    author: "Carl Sagan",
    source: "Cosmos & Deep Space",
    topics: [
      ["Supermassive Black Holes", "Located at the galactic centers of massive galaxies, supermassive black holes possess millions to billions of solar masses."],
      ["Pulsar Beacons", "Rapidly spinning magnetized neutron stars emit focused beams of electromagnetic radiation that pulse across space like cosmic lighthouses."],
      ["Cosmic Microwave Background", "The thermal glow of the CMB represents remnant radiation from the infant universe, cooled to under three Kelvin by cosmic expansion."],
      ["Interstellar Nebulae", "Vast clouds of ionized gas and interstellar dust condense into vibrant stellar nurseries where new planetary systems take shape."],
      ["Gravitational Lensing", "Massive galaxy clusters warp spacetime around them, acting as natural cosmic magnifying lenses for faint background galaxies."],
      ["Dark Energy Expansion", "Dark energy constitutes roughly sixty-eight percent of cosmic mass-energy density, driving the accelerating expansion of space."],
      ["Exoplanetary Atmospheres", "Spectroscopic observations of starlight filtered through exoplanetary atmospheres detect signatures of water, methane, and carbon dioxide."],
      ["Solar Flares and Coronal Ejections", "Magnetic reconnection events in the solar corona unleash billions of tons of plasma into the interplanetary solar wind."],
      ["Neutron Star Mergers", "Kilonova explosions from colliding neutron stars synthesize immense quantities of heavy elements in intense radioactive flares."],
      ["The Kuiper Belt", "Beyond the orbit of Neptune lies a freezing reservoir of millions of icy planetesimals, comets, and dwarf planets."]
    ]
  },
  {
    name: "Evolution, Genetics & Life Sciences",
    category: "Science",
    author: "Richard Dawkins",
    source: "The Gene and Evolution",
    topics: [
      ["Genetic Mutation & Drift", "Random genetic mutations and allele frequency drift interact with selective pressures to drive biological speciation over geological epochs."],
      ["Enzyme Catalysis", "Protein enzymes accelerate metabolic biochemical reactions by millions of times by lowering required activation energy barriers."],
      ["Ribosome Translation", "Ribosomes read messenger RNA codons sequentially, assembling amino acid chains into functional three-dimensional protein structures."],
      ["Cellular Respiration", "Mitochondrial electron transport chains convert glucose and oxygen into water, carbon dioxide, and ATP energy units."],
      ["Symbiotic Evolution", "Endosymbiotic theory explains how ancestral eukaryotic cells engulfed aerobic bacteria to evolve modern mitochondria."],
      ["Bioluminescence in the Deep", "Luciferin reactions in deep-sea organisms emit chemical light used for predation, camouflage, and intraspecies signaling."],
      ["Epigenetic Regulation", "Environmental factors influence gene expression patterns through DNA methylation without altering underlying genetic code."],
      ["Immune System Memory", "Memory B-cells and T-cells retain molecular signatures of past pathogens to launch rapid targeted immune responses against reinfection."],
      ["Coral Reef Ecosystems", "Microscopic zooxanthellae algae live in coral polyps, providing vital nutrients through photosynthesis to build calcium carbonate reefs."],
      ["Plant Communication", "Underground mycorrhizal networks and airborne volatile organic compounds enable plants to share resources and signal pest attacks."]
    ]
  },
  {
    name: "Quantum Mechanics & Physics",
    category: "Science",
    author: "Richard Feynman",
    source: "Lectures on Modern Physics",
    topics: [
      ["Heisenberg Uncertainty", "The Heisenberg uncertainty principle proves that the position and momentum of a subatomic particle cannot simultaneously be known with precision."],
      ["Wave-Particle Duality", "Photons and electrons exhibit characteristics of both discrete particles and continuous wave interference patterns depending on observation."],
      ["Quantum Tunneling", "Subatomic particles possess non-zero probabilities of traversing potential energy barriers higher than their classical kinetic energy."],
      ["Quantum Entanglement", "Spooky action at a distance links the quantum states of separated particles so that measurement of one determines the other instantly."],
      ["Superconductivity", "Cooper pairs of electrons flow through cooled crystal lattices with absolute zero electrical resistance and zero magnetic field penetration."],
      ["Antimatter Creation", "High-energy particle collisions produce equal parts matter and antimatter particles with opposite electric charge and quantum numbers."],
      ["Standard Model Particles", "The Standard Model classifies fundamental quarks, leptons, gauge bosons, and the Higgs boson responsible for giving particles mass."],
      ["Thermodynamic Entropy", "Entropy measures the microscopic statistical degeneracy of physical systems, establishing that macrostate disorder inevitably rises."],
      ["Quantum Decoherence", "Interactions between delicate quantum superpositions and macroscopic environments cause rapid loss of quantum coherence."],
      ["Plasma State of Matter", "At ultra-high temperatures, electrons strip away from atomic nuclei to form ionized gaseous plasma that conducts electrical currents."]
    ]
  },
  {
    name: "World History & Historic Moments",
    category: "Quotes",
    author: "Will Durant",
    source: "The Story of Civilization",
    topics: [
      ["The Renaissance Dawn", "The revival of classical art, philosophy, and empirical inquiry in Renaissance Florence transformed European intellectual culture."],
      ["The Printing Press", "Gutenberg's moveable type press democratized access to written knowledge, accelerating literacy and scientific exchange worldwide."],
      ["The Industrial Revolution", "Steam power and mechanized manufacturing reshaped human labor, urban architecture, and global trade networks permanently."],
      ["The Age of Discovery", "Navigators charted unfamiliar sea routes, connecting disparate continents and establishing early global maritime commerce."],
      ["Ancient Library of Alexandria", "Scholars from across the Mediterranean gathered in Alexandria to translate scrolls, catalogue mathematics, and map the stars."],
      ["The Silk Road Exchange", "Overland caravans carried goods, religions, philosophies, and technologies between Eastern dynasties and Western kingdoms."],
      ["The Magna Carta", "The charter established the legal precedent that everyone, including sovereign monarchs, is subject to the rule of constitutional law."],
      ["The Space Race Apollo", "Humanity achieved its first lunar landing in 1969, demonstrating that visionary engineering and international resolve can reach new worlds."],
      ["The Scientific Revolution", "Bacon, Galileo, and Newton established the empirical scientific method, replacing dogma with systematic observation and experimentation."],
      ["The Fall of the Berlin Wall", "The peaceful dismantling of the Berlin Wall in 1989 symbolized the triumph of human freedom and the reunification of divided families."]
    ]
  },
  {
    name: "Ancient Philosophy & Stoic Wisdom",
    category: "Quotes",
    author: "Marcus Aurelius",
    source: "Meditations & Discourses",
    topics: [
      ["The Present Moment", "Do not be overwhelmed by what lies ahead. Anchor your focus entirely in this present moment and act with deliberate integrity."],
      ["Impermanence of All Things", "Time is a raging torrent. No sooner is a thing brought to sight than it is swept away and another takes its place."],
      ["Cultivating Inner Peace", "You have power over your mind, not outside events. Realize this, and you will discover immense unshakeable inner strength."],
      ["Virtue Over Praise", "A truly beautiful emerald loses none of its luster if no one praises it. Virtue shines by its own intrinsic nature."],
      ["Acceptance of Fate (Amor Fati)", "Do not demand that events happen as you wish, but wish them to happen as they do happen, and you will find peace."],
      ["The Danger of Vanity", "Look at how transient and worthless human reputation is. How fleeting the praise of mortals in comparison to the cosmos."],
      ["Kindness as Strength", "Kindness is invincible, provided it is sincere and not a facade or mockery. What can the most insolent person do if you remain kind?"],
      ["The Discipline of Desire", "Freedom is secured not by the fulfilling of desires, but by the removal of desire for things that are beyond our control."],
      ["Simplicity and Calm", "Very little is needed to make a happy life; it is all within yourself, in your way of thinking and relating to the world."],
      ["Self-Discipline and Morning", "When you find it hard to get out of bed in the morning, remember that you are rising to perform the work of a human being."]
    ]
  },
  {
    name: "Classic Prose & Narrative Tales",
    category: "Literature",
    author: "Leo Tolstoy",
    source: "Anthology of Classic Prose",
    topics: [
      ["The Old Wooden Watchtower", "At the edge of the silent village stood an ancient wooden watchtower, overlooking windswept wheat fields that rippled under golden autumn sunsets."],
      ["Night Train to the North", "The heavy locomotive steamed into the freezing night, wheels rhythmic against icy steel rails as passengers dozed under wool blankets."],
      ["The Solitary Mountain Pass", "She tied her leather pack securely and ascended the steep rocky trail, listening to the rushing mountain creek echo against limestone cliffs."],
      ["The Clockmaker's Apprentice", "Cogs, springs, and brass pendulum gears tick in synchronized harmony within the candlelit workshop of the master horologist."],
      ["The Forgotten Garden", "Ivy climbed crumbling brick walls where wild lavender and white roses bloomed unattended, fragrant in the warm summer rain."],
      ["Wanderer of the Steppes", "On the open plain where earth meets sky in boundless green horizons, solitary horsemen ride beneath sweeping thundercloud arches."],
      ["The Old Mariner's Tale", "Salt spray crusted the weathered timber of the schooner as seagulls wheeled overhead, crying into the teeth of the rising gale."],
      ["The Lantern in the Mist", "A single lantern shone through thick river fog, guiding the rowboat safely back to the wooden dock before the night storm broke."],
      ["The Castle Library", "Floor-to-ceiling mahogany bookshelves held centuries of illuminated manuscripts, bound in calfskin and stamped with gilded heraldic crests."],
      ["Morning Market in Verona", "Vendors called out over baskets of fresh figs, sun-ripened olives, and fragrant rosemary as morning sunlight illuminated the piazza."]
    ]
  },
  {
    name: "Championship Typing & Speed Drills",
    category: "Speed",
    author: "TypeRush Elite Coach",
    source: "Championship Speed Circuit",
    topics: [
      ["Burst Cadence Drill", "Strike keys with crisp, deliberate rhythm. Maintain a relaxed posture and let your fingers spring naturally off the mechanical switches."],
      ["Home Row Precision", "Anchor your index fingers on the F and J tactile bumps. Train muscle memory to return to the home row after every reaching stroke."],
      ["High CPM Acceleration", "Look ahead two words while typing to eliminate cognitive pausing between keypresses and maximize raw character velocity."],
      ["Error Minimization Strategy", "A clean test with ninety-nine percent accuracy is always faster than a frantic sprint riddled with correcting backspaces."],
      ["Sustained Sprint Endurance", "Keep your wrists straight and floating gently above the keyboard to prevent fatigue during extended sixty-second typing trials."],
      ["Punctuation and Numeric Fluency", "Practice smooth shifts and symbol keystrokes without glancing down at the keycaps to build true competition-grade mastery."],
      ["Flow State Activation", "Eliminate all external distraction. Match your breathing to the steady tap of the switches and enter a state of deep effortless focus."],
      ["Alternating Hand Rhythm", "Balance the workload evenly across both hands by alternating keystrokes smoothly across left and right keyboard halves."],
      ["Sprint Velocity Mastery", "Test your top speed limits with short fifteen-second bursts before consolidating accuracy over longer test durations."],
      ["Champion's Mindset", "Consistency beats sporadic intensity every single day. Dedicated daily drills compound into world-class typing speed."]
    ]
  },
  {
    name: "General Knowledge & Human Discovery",
    category: "General",
    author: "Elena Rostova",
    source: "Global Perspectives",
    topics: [
      ["The Art of Bread Making", "Flour, water, wild yeast, and salt combine through patient kneading and slow fermentation into crusty, fragrant loaves of sourdough bread."],
      ["Acoustics of Concert Halls", "Architects design curved surfaces and sound-absorbing timber panels so that a single violin note reaches every seat with perfect clarity."],
      ["Deep Wilderness Camping", "Under a dome of brilliant constellations, the campfire crackles warmly while nocturnal owls call across the tranquil pine forest."],
      ["The Architecture of Bridges", "Suspension bridges balance immense tensile cable forces with compressive tower loads to span wide river estuaries safely."],
      ["Urban Rooftop Gardens", "Green rooftops cool city temperatures, absorb stormwater runoff, and provide sanctuary for pollinators amidst concrete towers."],
      ["The Journey of Coffee", "From high-altitude volcanic soils to careful sun-drying, roasting coffee beans unlocks complex aromatic notes of chocolate and citrus."],
      ["The Craft of Calligraphy", "Controlling brush angle, ink saturation, and pen pressure transforms written words into expressive visual poetry."],
      ["Restoration of Old Books", "Archivists gently clean historic parchment, rebind loose signatures with linen thread, and preserve fragile cultural heritage."],
      ["Lighthouses of the Atlantic", "Standing stalwart against crashing coastal breakers, historic lighthouses have safely guided ocean vessels for generations."],
      ["The Magic of Animation", "Drawing twenty-four sequential frames for every second of film breathes vibrant personality and believable movement into static sketches."]
    ]
  }
];

// Now multiply each domain topic by varying sentence structures, prefixes, insights, and expansions
// 12 domains * 10 topics * 10 stylistic variations = 1,200 unique, beautiful passages!

const variations = [
  (topic, detail) => `In the study of ${topic.toLowerCase()}, fundamental principles guide our understanding. ${detail}`,
  (topic, detail) => `${detail} This principle remains essential for practitioners seeking mastery in the field.`,
  (topic, detail) => `Exploring the mechanics of ${topic.toLowerCase()} reveals deep technical elegance. ${detail}`,
  (topic, detail) => `${detail} Continuous deliberate experimentation helps deepen insight into these dynamics.`,
  (topic, detail) => `When examining ${topic.toLowerCase()}, one notices how interconnected the core components truly are. ${detail}`,
  (topic, detail) => `${detail} Such insights continue to inspire new innovations across modern systems.`,
  (topic, detail) => `A thorough analysis of ${topic.toLowerCase()} highlights the value of disciplined execution. ${detail}`,
  (topic, detail) => `${detail} Mastery begins with understanding these core concepts clearly from first principles.`,
  (topic, detail) => `Understanding ${topic.toLowerCase()} provides an indispensable foundation for long-term progress. ${detail}`,
  (topic, detail) => `${detail} By practicing consistently, one develops both speed and nuanced comprehension.`
];

let generatedCount = 0;
for (const domain of domains) {
  for (let t = 0; t < domain.topics.length; t++) {
    const [topicName, topicDetail] = domain.topics[t];
    for (let v = 0; v < variations.length; v++) {
      const title = `${topicName} - Part ${v + 1}`;
      const text = variations[v](topicName, topicDetail);
      addPassage(
        title,
        text,
        domain.author,
        domain.source,
        domain.category
      );
      generatedCount++;
    }
  }
}

console.log(`Total generated passages: ${passages.length}`);

// Write JSON file
const dataDir = path.join(__dirname, "..", "prisma", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outFile = path.join(dataDir, "passages.json");
fs.writeFileSync(outFile, JSON.stringify(passages, null, 2), "utf-8");
console.log(`Saved ${passages.length} passages to ${outFile}`);
