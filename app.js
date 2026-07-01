const form = document.querySelector("#tripForm");
const builder = document.querySelector("#builder");
const result = document.querySelector("#result");
const destinationInput = document.querySelector("#destination");
const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");
const wishListInput = document.querySelector("#wishList");
const dateError = document.querySelector("#dateError");
const preferenceError = document.querySelector("#preferenceError");
const suggestionBoard = document.querySelector("#suggestionBoard");
const selectionCount = document.querySelector("#selectionCount");

const destinationCatalogs = [
  {
    match: /tokyo|japan/i,
    banner: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=82",
    zones: [
      { name: "Asakusa & Ueno", icon: "⛩️", keywords: ["asakusa", "ueno", "taito", "senso", "nakamise"] },
      { name: "Shibuya & Harajuku", icon: "🌆", keywords: ["shibuya", "harajuku", "aoyama", "jingumae", "omotesando", "meiji"] },
      { name: "Ginza & Central Tokyo", icon: "🗼", keywords: ["ginza", "chuo", "chūō", "tsukiji", "marunouchi", "imperial", "tokyo station"] },
      { name: "Tokyo Bay & Minato", icon: "🌉", keywords: ["tokyo bay", "odaiba", "minato", "teamlab", "nishiazabu", "tokyo tower", "zojoji"] },
      { name: "Akihabara & East Tokyo", icon: "🎮", keywords: ["akihabara", "chiyoda", "electronics", "anime", "ueno"] }
    ],
    attractions: [
      place("Sensō-ji and Nakamise-dori", "Asakusa", "Begin at Kaminarimon, explore the temple grounds, then browse the historic shopping street."),
      place("Meiji Jingu and Harajuku", "Shibuya", "Pair the wooded shrine approach with Takeshita Street and Omotesando."),
      place("Shibuya Crossing and Shibuya Sky", "Shibuya", "See the crossing at street level, then reserve a skyline time slot near sunset."),
      place("Tsukiji Outer Market", "Chūō", "Go early for seafood, tamagoyaki, and compact market lanes."),
      place("Tokyo National Museum and Ueno Park", "Ueno", "Allow several hours for Japanese art, history, and a park walk."),
      place("teamLab Planets and Odaiba waterfront", "Tokyo Bay", "Reserve the immersive museum, then continue to the bay for evening views."),
      place("Imperial Palace East Gardens", "Marunouchi", "Walk the gardens and finish around Tokyo Station’s restored red-brick frontage."),
      place("Tokyo Tower and Zojoji Temple", "Minato", "Combine a classic observation landmark with the neighboring temple grounds.")
    ],
    food: {
      breakfast: [
        place("Tsukiji Outer Market", "Chūō", "A lively maze of seafood, produce, and specialty counters best visited early.", { address: "4 Chome Tsukiji, Chuo City, Tokyo 104-0045", rating: "4.2", order: "Tamagoyaki, tuna donburi, grilled scallops, or seasonal sashimi" }),
        place("Onigiri Asakusa Yadoroku", "Asakusa", "A tiny, traditional counter devoted to carefully made rice balls.", { address: "3 Chome-9-10 Asakusa, Taito City, Tokyo 111-0032", rating: "4.3", order: "Salmon, kombu, or ume onigiri with miso soup" }),
        place("Pelican Café", "Asakusa", "A relaxed café showcasing the neighborhood bakery’s famous bread.", { address: "2 Chome-5-3 Kotobuki, Taito City, Tokyo 111-0042", rating: "4.1", order: "Charcoal toast, ham cutlet sandwich, and coffee" })
      ],
      lunch: [
        place("Uobei Shibuya Dogenzaka", "Shibuya", "Fast, approachable sushi delivered directly to your seat by express lane.", { address: "2 Chome-29-11 Dogenzaka, Shibuya, Tokyo 150-0043", rating: "4.3", order: "Tuna, salmon, seared nigiri, and seasonal specials" }),
        place("Afuri Harajuku", "Harajuku", "A modern ramen stop known for fragrant citrus-forward broth.", { address: "1 Chome-1-7 Jingumae, Shibuya, Tokyo 150-0001", rating: "4.3", order: "Yuzu shio ramen or yuzu ratanmen" }),
        place("Maisen Aoyama", "Aoyama", "A Tokyo tonkatsu institution in a memorable converted bathhouse.", { address: "4 Chome-8-5 Jingumae, Shibuya, Tokyo 150-0001", rating: "4.4", order: "Kurobuta pork loin or tenderloin tonkatsu set" })
      ],
      dinner: [
        place("Gonpachi Nishi-Azabu", "Minato", "A theatrical, high-energy izakaya with a broad menu for groups.", { address: "1 Chome-13-11 Nishiazabu, Minato City, Tokyo 106-0031", rating: "4.1", order: "Yakitori, handmade soba, and assorted tempura" }),
        place("Sushi no Midori Ginza", "Ginza", "Generous, well-known sushi sets; expect queues and check reservations.", { address: "7 Chome-2 Ginza, Chuo City, Tokyo 104-0061", rating: "4.3", order: "Chef’s nigiri set, fatty tuna, and conger eel" }),
        place("Omoide Yokocho", "Shinjuku", "An atmospheric lane of tiny independent yakitori and noodle counters.", { address: "1 Chome-2 Nishishinjuku, Shinjuku City, Tokyo 160-0023", rating: "4.1", order: "Yakitori assortment, motsuyaki, and a cold beer" })
      ]
    },
    shopping: [
      place("Ginza", "Chūō", "Tokyo’s polished retail district: begin at the Ginza 4-chome crossing, compare historic department stores, then browse stationery and basement food halls.", { address: "Ginza 4-chome Crossing, Chuo City, Tokyo 104-0061", bestFor: "Luxury flagships, Japanese stationery, beauty, and gourmet gifts" }),
      place("Shibuya and Harajuku", "Shibuya", "A fashion circuit linking Shibuya’s vertical malls with Cat Street, Takeshita Street, and Omotesando design stores.", { address: "Shibuya Station to Jingumae, Shibuya City, Tokyo", bestFor: "Youth fashion, sneakers, vintage clothing, and character goods" }),
      place("Akihabara", "Chiyoda", "Explore Chuo-dori and its side streets for electronics megastores, specialist hobby floors, arcades, and collectibles.", { address: "Akihabara Station, Sotokanda, Chiyoda City, Tokyo 101-0021", bestFor: "Electronics, anime, games, models, and retro technology" })
    ]
  },
  {
    match: /paris|france/i,
    banner: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=82",
    attractions: [
      place("Eiffel Tower and Champ de Mars", "7th arrondissement", "Reserve timed entry or enjoy the best ground-level views from Trocadéro."),
      place("Louvre Museum", "1st arrondissement", "Book ahead and choose a focused collection route rather than attempting every gallery."),
      place("Île de la Cité and Sainte-Chapelle", "Central Paris", "Pair stained glass with a Seine walk and views of Notre-Dame."),
      place("Montmartre and Sacré-Cœur", "18th arrondissement", "Climb through village-like streets and stay for the city panorama."),
      place("Musée d’Orsay", "7th arrondissement", "See Impressionist highlights inside the landmark former railway station."),
      place("Le Marais", "3rd–4th arrondissements", "Mix historic lanes, Place des Vosges, galleries, and cafés."),
      place("Luxembourg Gardens and the Latin Quarter", "5th–6th arrondissements", "A relaxed garden start followed by bookshops and old university streets."),
      place("Arc de Triomphe and Champs-Élysées", "8th arrondissement", "Climb for a geometric city view, then walk the avenue.")
    ],
    food: {
      breakfast: [place("Du Pain et des Idées", "10th arrondissement", "Celebrated pastries and escargot-shaped viennoiseries."), place("Café de Flore", "Saint-Germain", "Classic café breakfast in a storied setting."), place("Holybelly", "10th arrondissement", "Popular modern breakfast plates and coffee.")],
      lunch: [place("L’As du Fallafel", "Le Marais", "Famous falafel pita; expect a lively queue."), place("Bouillon Chartier", "9th arrondissement", "Historic, value-minded French classics."), place("Breizh Café", "Le Marais", "Highly regarded Breton crêpes and galettes.")],
      dinner: [place("Le Relais de l’Entrecôte", "Saint-Germain", "Known for steak-frites and its signature sauce."), place("Chez Janou", "Le Marais", "Provençal dishes and an energetic neighborhood atmosphere."), place("Bistrot Paul Bert", "11th arrondissement", "A classic Paris bistro experience; reserve ahead.")]
    },
    shopping: [place("Galeries Lafayette Haussmann", "9th arrondissement", "Fashion, beauty, gourmet gifts, and a celebrated glass dome."), place("Le Marais", "3rd–4th arrondissements", "Independent boutiques, vintage shops, design, and French labels."), place("Marché aux Puces de Saint-Ouen", "Saint-Ouen", "A vast antiques and vintage market best explored with time.")]
  },
  {
    match: /london|england|united kingdom|\buk\b/i,
    banner: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=82",
    attractions: [
      place("Westminster Abbey and Big Ben", "Westminster", "Start early, tour the abbey, and walk the Thames toward the London Eye."),
      place("Tower of London and Tower Bridge", "Tower Hill", "Allow a half day for the Crown Jewels, walls, and riverside views."),
      place("British Museum", "Bloomsbury", "Choose priority galleries and pair the visit with nearby literary streets."),
      place("Buckingham Palace and St James’s Park", "Westminster", "Check ceremonial schedules and continue through the royal parks."),
      place("Tate Modern and the South Bank", "Bankside", "Combine modern art, Millennium Bridge, and a riverside evening walk."),
      place("Borough Market and Southwark Cathedral", "London Bridge", "Visit hungry, sample market traders, then explore the historic riverfront."),
      place("Notting Hill and Portobello Road", "West London", "Colorful streets, antiques, independent shops, and café stops."),
      place("Greenwich", "Southeast London", "Take the river route for the observatory, park views, and maritime history.")
    ],
    food: {
      breakfast: [place("Dishoom Covent Garden", "Covent Garden", "Popular Bombay-inspired breakfast; the bacon naan is a signature."), place("The Wolseley", "Mayfair", "Grand European-style breakfast and polished service."), place("Regency Café", "Westminster", "A classic no-frills English breakfast institution.")],
      lunch: [place("Borough Market", "Southwark", "Choose among renowned street-food and produce traders."), place("Padella", "London Bridge", "Popular handmade pasta; join the queue early."), place("Flat Iron", "Soho", "Approachable steak in a central, casual setting.")],
      dinner: [place("Dishoom Shoreditch", "Shoreditch", "Atmospheric Bombay café dishes made for sharing."), place("Hawksmoor Seven Dials", "Covent Garden", "British steakhouse favorite; reserve ahead."), place("The Mayflower", "Rotherhithe", "Historic Thames-side pub with traditional British dishes.")]
    },
    shopping: [place("Oxford Street and Regent Street", "West End", "Major flagships, department stores, and classic central London retail."), place("Covent Garden", "West End", "Beauty, fashion, market stalls, and design-led boutiques."), place("Camden Market", "Camden", "Alternative fashion, crafts, vintage goods, and global street food.")]
  },
  {
    match: /new york|nyc|manhattan/i,
    banner: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1800&q=82",
    attractions: [
      place("Statue of Liberty and Ellis Island", "New York Harbor", "Reserve ferry tickets and begin early to make time for both islands."),
      place("Central Park and The Metropolitan Museum of Art", "Upper East Side", "Pair a scenic park route with a focused Met collection plan."),
      place("Times Square and a Broadway show", "Midtown", "See the lights briefly, then make the theater performance the centerpiece."),
      place("High Line and Chelsea Market", "West Side", "Walk the elevated park and stop for food before continuing toward Hudson Yards."),
      place("9/11 Memorial and One World Observatory", "Lower Manhattan", "Leave reflective time at the memorial and reserve the observatory."),
      place("Brooklyn Bridge and DUMBO", "Brooklyn", "Walk toward Brooklyn for skyline views, waterfront parks, and cobblestone streets."),
      place("Museum of Modern Art", "Midtown", "Focus on modern-art icons, then explore Rockefeller Center nearby."),
      place("Greenwich Village and Washington Square", "Downtown", "Wander brownstone streets, music history, cafés, and independent shops.")
    ],
    food: {
      breakfast: [place("Russ & Daughters Café", "Lower East Side", "Bagels, smoked fish, and New York appetizing traditions."), place("Daily Provisions", "Multiple locations", "Excellent breakfast sandwiches, pastries, and crullers."), place("Clinton St. Baking Company", "Lower East Side", "Famous pancakes and classic brunch plates.")],
      lunch: [place("Katz’s Delicatessen", "Lower East Side", "Iconic pastrami sandwiches and old-school deli atmosphere."), place("Los Tacos No. 1", "Chelsea Market", "Popular adobada and carne asada tacos."), place("Joe’s Pizza", "Greenwich Village", "A classic quick New York slice.")],
      dinner: [place("Gramercy Tavern", "Flatiron", "Celebrated seasonal American cooking; reserve ahead."), place("Keen’s Steakhouse", "Midtown", "Historic steakhouse known for mutton chop and old New York character."), place("Via Carota", "West Village", "Beloved Italian neighborhood cooking with frequent waits.")]
    },
    shopping: [place("Fifth Avenue", "Midtown", "Landmark flagships, luxury retail, and department stores."), place("SoHo", "Lower Manhattan", "Fashion flagships, design shops, and cobblestone streets."), place("Chelsea Market and Artists & Fleas", "Chelsea", "Food gifts, local makers, art, and independent vendors.")]
  },
  {
    match: /rome|italy/i,
    banner: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1800&q=82",
    attractions: [
      place("Colosseum and Roman Forum", "Centro Storico", "Reserve timed entry and allow a half day for the archaeological core."),
      place("Vatican Museums and St Peter’s Basilica", "Vatican City", "Book the earliest practical museum slot and dress for basilica entry."),
      place("Pantheon and Piazza Navona", "Centro Storico", "Connect two classics through atmospheric lanes and fountains."),
      place("Trevi Fountain and Spanish Steps", "Central Rome", "Visit early or late to avoid peak crowds."),
      place("Trastevere", "West bank", "Explore lanes, churches, and a long Roman dinner."),
      place("Borghese Gallery and Villa Borghese", "Pinciano", "Reserve the museum’s fixed entry and follow with a park walk."),
      place("Appian Way and the Catacombs", "Southeast Rome", "Rent a bicycle or take a guided route through ancient countryside."),
      place("Capitoline Museums", "Capitoline Hill", "See classical sculpture and one of the best Forum viewpoints.")
    ],
    food: {
      breakfast: [place("Sant’Eustachio Il Caffè", "Pantheon", "Espresso and a cornetto near the historic center."), place("Roscioli Caffè", "Campo de’ Fiori", "Pastries, coffee, and excellent savory breakfast options."), place("Pasticceria Regoli", "Esquilino", "Traditional Roman pastries and maritozzi.")],
      lunch: [place("Pizzarium Bonci", "Vatican area", "Renowned pizza al taglio with rotating toppings."), place("Forno Campo de’ Fiori", "Centro Storico", "Roman bakery slices and simple market-area lunch."), place("Trapizzino", "Trastevere", "Roman stews tucked into triangular pizza pockets.")],
      dinner: [place("Da Enzo al 29", "Trastevere", "Popular Roman classics; arrive before opening and expect a queue."), place("Flavio al Velavevodetto", "Testaccio", "Traditional carbonara, amatriciana, and cacio e pepe."), place("Armando al Pantheon", "Pantheon", "Historic Roman trattoria; reservations are essential.")]
    },
    shopping: [place("Via del Corso", "Central Rome", "Accessible fashion brands along a major historic route."), place("Via dei Condotti", "Spanish Steps", "Rome’s best-known luxury shopping street."), place("Porta Portese Market", "Trastevere", "Large Sunday market for vintage goods, clothing, and curiosities.")]
  },
  {
    match: /lisbon|portugal/i,
    banner: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1800&q=82",
    attractions: [
      place("Belém Tower and Jerónimos Monastery", "Belém", "Reserve the monastery and combine both landmarks with the riverfront."),
      place("Alfama and São Jorge Castle", "Historic center", "Climb through old lanes, viewpoints, and tiled façades."),
      place("Praça do Comércio and Baixa", "Baixa", "Walk the grand riverfront square, Rua Augusta, and downtown grid."),
      place("Sintra day trip", "Sintra", "Book Pena Palace early and limit the day to two major sights."),
      place("Tram 28 route and Graça viewpoints", "Central hills", "Ride outside peak hours and use the route to connect hilltop neighborhoods."),
      place("LX Factory", "Alcântara", "Creative shops, restaurants, street art, and the famous bookshop."),
      place("Calouste Gulbenkian Museum", "Avenidas Novas", "An excellent art collection surrounded by peaceful gardens."),
      place("Time Out Market and Cais do Sodré", "Mercado da Ribeira", "Sample Lisbon flavors, then walk the waterfront at sunset.")
    ],
    food: {
      breakfast: [place("Pastéis de Belém", "Belém", "The classic custard tart near the monastery."), place("Manteigaria", "Chiado", "Warm pastéis de nata made throughout the day."), place("Dear Breakfast", "Multiple locations", "Popular modern brunch and coffee.")],
      lunch: [place("Time Out Market", "Cais do Sodré", "Many prominent Lisbon kitchens in one convenient hall."), place("O Trevo", "Chiado", "Famous bifana pork sandwiches."), place("Cervejaria Ramiro", "Intendente", "Celebrated seafood; reserve or expect a wait.")],
      dinner: [place("Taberna da Rua das Flores", "Chiado", "Creative Portuguese small plates with limited seating."), place("Prado", "Baixa", "Seasonal Portuguese cooking in a stylish room."), place("A Cevicheria", "Príncipe Real", "Popular seafood-focused menu with Portuguese-Peruvian influence.")]
    },
    shopping: [place("A Vida Portuguesa", "Chiado", "Well-designed traditional Portuguese household goods and gifts."), place("Feira da Ladra", "Alfama", "Lisbon’s famous flea market for antiques and curiosities."), place("Embaixada", "Príncipe Real", "Portuguese designers and concept stores inside a landmark palace.")]
  }
];

let trip = null;
let activeDay = 0;
let activeTab = "home";
let weatherRenderVersion = 0;
const liveWeatherCache = new Map();
const selectedSuggestions = new Map();
const suggestionImageCache = new Map();
let suggestionLookup = new Map();
let suggestionDestination = "";

const today = new Date();
const defaultStart = new Date(today.getFullYear(), today.getMonth() + 1, 8);
const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 13);
startDateInput.value = toInputDate(defaultStart);
endDateInput.value = toInputDate(defaultEnd);

function goToPreferencesStep() {
  if (!destinationInput.value.trim()) {
    destinationInput.reportValidity();
    return;
  }
  if (!startDateInput.value || !endDateInput.value) {
    (startDateInput.value ? endDateInput : startDateInput).reportValidity();
    return;
  }
  const start = parseDate(startDateInput.value);
  const end = parseDate(endDateInput.value);
  if (end < start) {
    dateError.textContent = "Departure needs to be after arrival.";
    endDateInput.focus();
    return;
  }
  dateError.textContent = "";
  const nextDestination = destinationInput.value.trim();
  const previousDestination = (suggestionDestination || (trip && trip.destination) || "").trim().toLowerCase();
  if (previousDestination && previousDestination !== nextDestination.toLowerCase()) {
    selectedSuggestions.clear();
    wishListInput.value = "";
    preferenceError.textContent = "";
  }
  renderSuggestionPicker(nextDestination);
  showFormStep(2);
}
window.xTravelNextStep = goToPreferencesStep;
document.querySelector("#nextStepButton").addEventListener("click", goToPreferencesStep);

document.querySelector("#backStepButton").addEventListener("click", () => showFormStep(1));
document.querySelector("#detailsStepButton").addEventListener("click", () => {
  if (!selectedSuggestions.size && !wishListInput.value.trim()) {
    preferenceError.textContent = "Choose at least one suggestion or tell us what interests you.";
    wishListInput.focus();
    return;
  }
  preferenceError.textContent = "";
  showFormStep(3);
});
document.querySelector("#detailsBackButton").addEventListener("click", () => showFormStep(2));
document.querySelector("#clearSelectionsButton").addEventListener("click", () => {
  selectedSuggestions.clear();
  suggestionBoard.querySelectorAll(".suggestion-bubble").forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
  });
  updateSelectionCount();
});
document.querySelector("#surpriseMeButton").addEventListener("click", () => {
  const start = parseDate(startDateInput.value);
  const end = parseDate(endDateInput.value);
  const tripDays = Math.min(Math.max(daysBetween(start, end) + 1, 1), 14);
  const selectionTargets = {
    see: Math.min(Math.max(tripDays, 3), 6),
    eat: Math.min(Math.max(Math.ceil(tripDays * .75), 3), 6),
    shop: Math.min(Math.max(Math.ceil(tripDays / 2), 2), 4)
  };
  selectedSuggestions.clear();
  Object.entries(selectionTargets).forEach(([category, count]) => {
    const choices = [...suggestionLookup.values()].filter((item) => item.category === category);
    for (let index = choices.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [choices[index], choices[randomIndex]] = [choices[randomIndex], choices[index]];
    }
    choices.slice(0, count).forEach((item) => selectedSuggestions.set(item.key, item));
  });
  suggestionBoard.querySelectorAll(".suggestion-bubble").forEach((button) => {
    const selected = selectedSuggestions.has(button.dataset.suggestionKey);
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  preferenceError.textContent = "";
  updateSelectionCount();
  selectionCount.textContent = `${selectedSuggestions.size} selected for you`;
  showFormStep(3);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const start = parseDate(startDateInput.value);
  const end = parseDate(endDateInput.value);
  if (end < start) {
    dateError.textContent = "Departure needs to be after arrival.";
    endDateInput.focus();
    return;
  }
  dateError.textContent = "";
  if (!selectedSuggestions.size && !wishListInput.value.trim()) {
    preferenceError.textContent = "Choose at least one suggestion or tell us what interests you.";
    wishListInput.focus();
    return;
  }
  preferenceError.textContent = "";
  const selections = [...selectedSuggestions.values()];
  const preferences = getTripPreferences();
  trip = buildTrip(destinationInput.value.trim(), start, end, wishListInput.value.trim(), selections, preferences);
  activeDay = 0;
  activeTab = "home";
  builder.hidden = true;
  result.hidden = false;
  document.body.classList.add("trip-mode");
  renderTrip();
  switchAppTab("home");
  safeStorageSet("x-travel-guide-trip", JSON.stringify({ destination: destinationInput.value, start: startDateInput.value, end: endDateInput.value, wishes: wishListInput.value, selections, preferences }));
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#editTripButton").addEventListener("click", showBuilder);
document.querySelector("#newTripButton").addEventListener("click", () => {
  safeStorageRemove("x-travel-guide-trip");
  safeStorageRemove("roam-trip");
  form.reset();
  selectedSuggestions.clear();
  suggestionDestination = "";
  startDateInput.value = toInputDate(defaultStart);
  endDateInput.value = toInputDate(defaultEnd);
  showBuilder();
  destinationInput.focus();
});
document.querySelector("#printButton").addEventListener("click", () => window.print());
document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => switchAppTab(button.dataset.tab)));
document.querySelectorAll("[data-open-tab]").forEach((button) => button.addEventListener("click", () => switchAppTab(button.dataset.openTab)));

function showBuilder() {
  result.hidden = true;
  builder.hidden = false;
  document.body.classList.remove("trip-mode");
  showFormStep(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showFormStep(stepNumber) {
  builder.classList.toggle("builder-wide", stepNumber > 1);
  document.querySelectorAll("[data-form-step]").forEach((step) => {
    const active = Number(step.dataset.formStep) === stepNumber;
    step.hidden = !active;
    step.classList.toggle("active", active);
  });
  document.querySelectorAll(".form-progress span").forEach((bar, index) => bar.classList.toggle("active", index < stepNumber));
  document.querySelector("#formStepTitle").textContent = ["", "Trip basics", "Places & preferences", "Trip style"][stepNumber];
  document.querySelector("#formStepCount").textContent = `Step ${stepNumber} of 3`;
  if (stepNumber === 2) document.querySelector(".suggestion-intro").scrollIntoView({ block: "nearest" });
}

function getTripPreferences() {
  return {
    pace: document.querySelector("#tripPace").value,
    party: document.querySelector("#tripParty").value,
    start: document.querySelector("#dayStart").value,
    evening: document.querySelector("#eveningStyle").value,
    transport: document.querySelector("#transportStyle").value,
    budget: document.querySelector("#tripBudget").value,
    notes: document.querySelector("#mobilityNotes").value.trim()
  };
}

function setTripPreferences(preferences = {}) {
  const fields = { tripPace: "pace", tripParty: "party", dayStart: "start", eveningStyle: "evening", transportStyle: "transport", tripBudget: "budget", mobilityNotes: "notes" };
  Object.entries(fields).forEach(([id, key]) => { if (preferences[key]) document.querySelector(`#${id}`).value = preferences[key]; });
}

function renderSuggestionPicker(destination) {
  const normalizedDestination = destination.toLowerCase();
  if (suggestionDestination && suggestionDestination !== normalizedDestination) selectedSuggestions.clear();
  suggestionDestination = normalizedDestination;
  document.querySelector("#suggestionDestination").textContent = destination;
  const groups = createSuggestionGroups(destination);
  suggestionLookup = new Map(groups.flatMap((group) => group.items.map((suggestion) => [suggestion.key, suggestion])));
  suggestionBoard.innerHTML = "";

  groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "suggestion-group";
    section.innerHTML = `<div class="suggestion-group-heading"><span aria-hidden="true">${group.icon}</span><h3>${group.label}</h3><small>${group.items.length} ideas</small></div>`;
    const bubbles = document.createElement("div");
    bubbles.className = "suggestion-bubbles suggestion-card-list";
    group.items.forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `suggestion-bubble${selectedSuggestions.has(suggestion.key) ? " selected" : ""}`;
      const meta = suggestion.category === "eat"
        ? [suggestion.cuisine || "Local and regional cuisine", suggestion.rating ? `Google rating: ${suggestion.rating}` : "Google rating: view live"]
        : suggestion.category === "shop"
          ? [suggestion.area, suggestion.bestFor || "Popular local shopping"]
          : [suggestion.area, "Popular place to see"];
      button.innerHTML = `<img class="suggestion-card-image" src="${escapeHtml(suggestion.image || suggestionImagePlaceholder(suggestion))}" alt="${escapeHtml(`${suggestion.name} in ${destination}`)}" loading="lazy"><span class="suggestion-card-body"><span class="suggestion-card-top"><strong>${escapeHtml(suggestion.name)}</strong><span class="suggestion-check">✓</span></span><span class="suggestion-card-meta">${meta.filter(Boolean).map(escapeHtml).join(" · ")}</span><span class="suggestion-card-detail">${escapeHtml(suggestion.detail)}</span><a class="suggestion-map-link" href="${googleMapsSearchUrl(`${suggestion.name} ${destination}`)}" target="_blank" rel="noopener noreferrer">View live details on Google Maps ↗</a></span>`;
      hydrateSuggestionImage(button.querySelector(".suggestion-card-image"), suggestion, destination);
      button.dataset.suggestionKey = suggestion.key;
      button.setAttribute("aria-pressed", selectedSuggestions.has(suggestion.key) ? "true" : "false");
      button.addEventListener("click", (event) => {
        if (event.target.closest(".suggestion-map-link")) return;
        if (selectedSuggestions.has(suggestion.key)) selectedSuggestions.delete(suggestion.key);
        else selectedSuggestions.set(suggestion.key, suggestion);
        const selected = selectedSuggestions.has(suggestion.key);
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        preferenceError.textContent = "";
        updateSelectionCount();
      });
      bubbles.appendChild(button);
    });
    section.appendChild(bubbles);
    suggestionBoard.appendChild(section);
  });
  updateSelectionCount();
}

function createSuggestionGroups(destination) {
  const guide = getDestinationGuide(destination);
  const seen = new Set();
  const inferCuisine = (item) => {
    const text = `${item.name} ${item.detail} ${item.order || ""}`.toLowerCase();
    if (/sushi|nigiri|sashimi/.test(text)) return "Sushi and Japanese";
    if (/ramen|noodle|soba/.test(text)) return "Japanese noodles";
    if (/bakery|pastr|bread|café|cafe|coffee|breakfast/.test(text)) return "Café and bakery";
    if (/french|bistro|bouillon|crêpe|galette/.test(text)) return "French";
    if (/italian|pasta|pizza|roman|trattoria/.test(text)) return "Italian";
    if (/seafood|fish|oyster|tuna/.test(text)) return "Seafood";
    if (/steak|tonkatsu|pork|yakitori|grill/.test(text)) return "Grill and meat specialties";
    if (/market|food hall|street food/.test(text)) return "Market and local specialties";
    return "Local and regional cuisine";
  };
  const toSuggestion = (item, category) => ({
    key: `${category}:${item.name.toLowerCase()}`,
    category,
    name: item.name,
    area: item.area,
    detail: item.detail,
    rating: item.rating || "",
    cuisine: item.cuisine || (category === "eat" ? inferCuisine(item) : ""),
    order: item.order || "",
    bestFor: item.bestFor || "",
    address: item.address || "",
    image: item.image || ""
  });
  const unique = (items, category) => items.map((item) => toSuggestion(item, category)).filter((item) => {
    const nameKey = item.name.toLowerCase();
    if (seen.has(nameKey)) return false;
    seen.add(nameKey);
    return true;
  });

  const see = unique(guide.attractions, "see");
  const eat = unique([...guide.food.breakfast, ...guide.food.lunch, ...guide.food.dinner], "eat");
  const shop = unique(guide.shopping, "shop");
  const zones = getDayZones(guide, destination, 8);
  const addDiscoveryIdeas = (target, category, templates, limit) => {
    let index = 0;
    let attempts = 0;
    while (target.length < limit && attempts < limit * 12) {
      const zone = zones[index % zones.length];
      const template = templates[index % templates.length];
      const item = toSuggestion(place(`${zone.name} ${template.name}`, zone.name, template.detail,
        category === "eat" ? { cuisine: template.meta } : category === "shop" ? { bestFor: template.meta } : {}), category);
      if (!seen.has(item.name.toLowerCase())) {
        seen.add(item.name.toLowerCase());
        target.push(item);
      }
      index += 1;
      attempts += 1;
    }
  };
  addDiscoveryIdeas(see, "see", [
    { name: "landmark walk", detail: "A compact route linking the neighborhood’s defining architecture, public spaces, and most-photographed viewpoints." },
    { name: "museum or cultural highlight", detail: "A well-reviewed cultural stop that explains the area’s art, history, or contemporary identity." },
    { name: "park and scenic viewpoint", detail: "A popular outdoor pause chosen for atmosphere, photography, and a broader sense of the district." }
  ], 14);
  addDiscoveryIdeas(eat, "eat", [
    { name: "top-rated local restaurant", detail: "A highly reviewed neighborhood option; use the live Maps listing to compare current rating, hours, and reservations.", meta: "Regional cuisine" },
    { name: "popular casual lunch", detail: "A busy local favorite suited to the day’s route, with a shorter service time and a signature neighborhood dish.", meta: "Casual local cuisine" },
    { name: "specialty café or bakery", detail: "A well-liked coffee, pastry, or dessert stop that works naturally between nearby sights.", meta: "Café and bakery" }
  ], 14);
  addDiscoveryIdeas(shop, "shop", [
    { name: "independent shopping street", detail: "A walkable cluster of local boutiques and small businesses rather than a single isolated store.", meta: "Local fashion, design, books, and gifts" },
    { name: "market and specialty shops", detail: "A popular place to browse regional products and useful souvenirs while staying inside the day’s neighborhood.", meta: "Food gifts, crafts, and regional specialties" },
    { name: "design and vintage district", detail: "A neighborhood shopping circuit known for distinctive independent finds and browsing.", meta: "Vintage, design, and independent labels" }
  ], 12);
  return [
    { label: "Places to see", icon: "🏛️", items: see },
    { label: "Places to eat", icon: "🍽️", items: eat },
    { label: "Places to shop", icon: "🛍️", items: shop }
  ];
}

function suggestionImagePlaceholder(suggestion) {
  const palette = suggestion.category === "eat" ? ["#733c31", "#d5966c"] : suggestion.category === "shop" ? ["#574569", "#a890b3"] : ["#244f66", "#79a6ad"];
  const initials = suggestion.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="280" viewBox="0 0 420 280"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient></defs><rect width="420" height="280" fill="url(#g)"/><circle cx="340" cy="45" r="82" fill="white" opacity=".1"/><text x="30" y="235" fill="white" font-family="Arial,sans-serif" font-size="72" font-weight="700" opacity=".9">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function hydrateSuggestionImage(imageElement, suggestion, destination) {
  if (!imageElement || suggestion.image) return;
  const cacheKey = `${suggestion.name}|${destination}`.toLowerCase();
  if (suggestionImageCache.has(cacheKey)) {
    const cached = suggestionImageCache.get(cacheKey);
    if (cached) imageElement.src = cached;
    return;
  }
  try {
    const params = new URLSearchParams({ action: "query", generator: "search", gsrsearch: `${suggestion.name} ${destination}`, gsrlimit: "1", prop: "pageimages", piprop: "thumbnail", pithumbsize: "520", format: "json", origin: "*" });
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error("Image lookup unavailable");
    const payload = await response.json();
    const page = Object.values(payload.query?.pages || {})[0];
    const source = page?.thumbnail?.source || "";
    suggestionImageCache.set(cacheKey, source);
    if (source && imageElement.isConnected) imageElement.src = source;
  } catch (_) {
    suggestionImageCache.set(cacheKey, "");
  }
}

function updateSelectionCount() {
  selectionCount.textContent = `${selectedSuggestions.size} selected`;
}

function switchAppTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));
  document.querySelectorAll("[data-tab]").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  const activePanel = document.querySelector(`[data-panel="${tabName}"]`);
  if (activePanel) activePanel.scrollTop = 0;
}

function buildTrip(destination, start, end, wishes, selections = [], preferences = {}) {
  preferences = { pace: "balanced", party: "couple", start: "standard", evening: "flexible", transport: "transit", budget: "balanced", notes: "", ...preferences };
  const days = Math.min(Math.max(daysBetween(start, end) + 1, 1), 14);
  const ideas = parseIdeas([wishes, preferences.notes].filter(Boolean).join(", "));
  const guide = getDestinationGuide(destination);
  const dateList = Array.from({ length: days }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  const dayZones = getDayZones(guide, destination, days);
  const selectionBuckets = Array.from({ length: days }, () => []);
  selections.forEach((suggestion, index) => selectionBuckets[findBestZoneIndex(suggestion, dayZones, index)].push(suggestion));

  const seenRecommendations = new Set();
  const itineraryDays = dateList.map((date, index) => {
    let activities = makeActivitiesUnique(
      createActivities(index, days, ideas, destination, guide, selectionBuckets[index], preferences, dayZones[index]),
      seenRecommendations,
      destination,
      date,
      preferences
    );
    activities = fillFullDay(activities, { relaxed: 6, balanced: 8, packed: 10 }[preferences.pace] || 8, seenRecommendations, destination, date, preferences, dayZones[index]).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    activities = assignDistinctActivityIcons(activities, index);
    return {
      date,
      zone: dayZones[index],
      title: `${dayZones[index].name} · ${activities[1].title}`,
      activities
    };
  });

  return {
    destination,
    start,
    end,
    wishes,
    selections,
    preferences,
    guide,
    days: itineraryDays
  };
}

function makeActivitiesUnique(activities, seen, destination, date, preferences) {
  let replacementIndex = 0;
  return activities.map((item) => {
    const key = item.title.trim().toLowerCase().replace(/^(breakfast|lunch|dinner|farewell dinner|taste|visit|browse):\s*/, "");
    if (!seen.has(key)) {
      seen.add(key);
      return item;
    }

    const replacement = createPlanningBlock(destination, date, item.time, replacementIndex++, preferences, item.type);
    seen.add(replacement.title.toLowerCase());
    return replacement;
  });
}

function getDayZones(guide, destination, dayCount) {
  const source = guide.zones && guide.zones.length ? guide.zones : guide.attractions.map((item, index) => ({
    name: item.area || `${destination} district ${index + 1}`,
    icon: ["🏛️", "🌆", "🌿", "🎨", "🛍️", "🌉", "📸", "🧭"][index % 8],
    keywords: [item.area, item.name].filter(Boolean)
  }));
  const unique = source.filter((zone, index, zones) => zones.findIndex((candidate) => candidate.name.toLowerCase() === zone.name.toLowerCase()) === index);
  return Array.from({ length: dayCount }, (_, index) => ({ ...unique[index % unique.length], sequence: index }));
}

function geoText(item) {
  return `${item && item.name || ""} ${item && item.area || ""} ${item && item.address || ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function zoneScore(item, zone) {
  if (!item || !zone) return 0;
  const text = geoText(item);
  const terms = [zone.name, ...(zone.keywords || [])].flatMap((value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+|&|\//)).filter((term) => term.length > 2);
  return terms.reduce((score, term) => score + (text.includes(term) ? term.length : 0), 0);
}

function pickForZone(items, zone, fallbackIndex = 0) {
  const ranked = items.map((item, index) => ({ item, index, score: zoneScore(item, zone) })).sort((a, b) => b.score - a.score || Math.abs(a.index - (fallbackIndex % items.length)) - Math.abs(b.index - (fallbackIndex % items.length)));
  return ranked[0].score > 0 ? ranked[0].item : items[fallbackIndex % items.length];
}

function rankForZone(items, zone) {
  return [...items].sort((a, b) => zoneScore(b, zone) - zoneScore(a, zone));
}

function findBestZoneIndex(item, zones, fallbackIndex = 0) {
  const ranked = zones.map((zone, index) => ({ index, score: zoneScore(item, zone) })).sort((a, b) => b.score - a.score || a.index - b.index);
  return ranked[0].score > 0 ? ranked[0].index : fallbackIndex % zones.length;
}

function createActivities(index, totalDays, ideas, destination, guide, selectedForDay = [], preferences = {}, zone = null) {
  const firstSight = pickForZone(guide.attractions, zone, index * 2);
  const secondSight = pickForZone(guide.attractions.filter((item) => item !== firstSight), zone, index * 2 + 1);
  const breakfast = pickForZone(guide.food.breakfast, zone, index);
  const lunch = pickForZone(guide.food.lunch, zone, index + 1);
  const dinner = pickForZone(guide.food.dinner, zone, index + 2);
  const shop = pickForZone(guide.shopping, zone, index);
  const idea = ideas[index] || null;
  const afternoonStop = index % 3 === 2 || index === totalDays - 1 ? shop : secondSight;
  const afternoonType = afternoonStop === shop ? "Shop" : "See";
  const afternoonIcon = afternoonType === "Shop" ? "🛍️" : "📍";

  const breakfastTime = preferences.start === "early" ? "07:30" : preferences.start === "slow" ? "10:00" : "08:30";
  const morningTime = preferences.start === "early" ? "09:00" : preferences.start === "slow" ? "11:30" : "10:00";
  const dinnerTime = preferences.evening === "quiet" ? "18:30" : preferences.evening === "nightlife" ? "20:00" : "19:30";
  const zoneNote = zone ? `Today stays centered on ${zone.name}, minimizing cross-city travel.` : "Today follows one compact district.";
  const routeNote = preferences.transport === "low-walking" ? `${zoneNote} Keep walking segments short and use door-to-door transport.` : preferences.transport === "mixed" ? `${zoneNote} Use transit for the main route and a taxi when it saves energy.` : `${zoneNote} Connect nearby stops by walking and public transit.`;
  const baseActivities = [
    activity("Eat", "☕", breakfastTime, `Breakfast: ${breakfast.name}`, `${breakfast.detail} ${areaText(breakfast)} Allow 45–60 minutes.`),
    activity(index === 0 ? "Arrival" : "See", index === 0 ? "🧳" : "🏛️", morningTime, firstSight.name, `${firstSight.detail} ${areaText(firstSight)} Allow about 2–3 hours including nearby streets. ${routeNote}`),
    activity("Eat", "🍽️", "12:30", `Lunch: ${lunch.name}`, `${lunch.detail} ${areaText(lunch)} Check current opening days and queues.`),
    activity(afternoonType, afternoonIcon, "14:30", afternoonStop.name, `${afternoonStop.detail} ${areaText(afternoonStop)} Keep the route flexible for transit and photos.`),
    activity("Evening", "🌙", dinnerTime, `${index === totalDays - 1 ? "Farewell dinner" : "Dinner"}: ${dinner.name}`, `${dinner.detail} ${areaText(dinner)} Reserve when possible and verify current hours.${preferences.notes ? ` Plan around this note: ${preferences.notes}.` : ""}`)
  ];
  if (idea) baseActivities.push(activity("Explore", "✨", "17:00", `Your request: ${titleCase(idea)}`, `A personalized ${destination} stop inspired directly by “${idea},” selected within or near ${zone ? zone.name : "today’s neighborhood"}. Confirm the best current match in Google Maps.`));
  const selectedActivities = selectedForDay.map((suggestion, suggestionIndex) => suggestionToActivity(suggestion, suggestionIndex));
  return [...selectedActivities, ...baseActivities];
}

function fillFullDay(activities, target, seen, destination, date, preferences, zone = null) {
  const slots = preferences.start === "slow" ? ["12:45", "14:00", "15:45", "17:15", "18:30", "21:00", "22:15"] : ["09:15", "10:45", "13:45", "16:00", "17:30", "18:30", "21:00", "22:15"];
  let index = 0;
  while (activities.length < target && index < slots.length * 2) {
    const time = slots[index % slots.length];
    const block = createPlanningBlock(destination, date, time, index, preferences, "Explore", zone);
    const key = block.title.toLowerCase();
    if (!seen.has(key) && !activities.some((item) => item.time === time)) {
      seen.add(key);
      activities.push(block);
    }
    index += 1;
  }
  return activities;
}

function createPlanningBlock(destination, date, time, index, preferences = {}, requestedType = "Explore", zone = null) {
  const pools = {
    Eat: [["Regional snack tasting", "Stop at a busy food hall or market counter for one signature savory bite and one local drink; allow 45 minutes."], ["Pastry, tea, or dessert break", "Choose a long-running bakery or specialty café near the day’s route and sample the item the city is known for; allow 40 minutes."]],
    Evening: [["After-dinner lights walk", "Finish with a 45-minute stroll through a lively illuminated district, keeping the route close to the return transit stop."], ["Live culture evening option", "Look for a short local music, theater, or cultural performance near today’s neighborhood and leave 90 minutes."]],
    Shop: [["Independent makers stop", "Browse a compact cluster of local craft, stationery, book, or design shops and set aside 60 minutes for useful souvenirs."], ["Neighborhood market browse", "Walk one market aisle at an unhurried pace, compare regional products, and leave room for a small food gift."]],
    See: [["Historic streets photo walk", "Follow a 60–75 minute loop through a character-rich neighborhood, pausing at architecture, public art, and a scenic square."], ["Small museum or gallery hour", "Add one focused cultural stop near the main route; prioritize a compact collection that can be enjoyed in about an hour."]],
    Explore: [["Neighborhood orientation walk", "Take a 60-minute loop around today’s main district to learn the streets, spot cafés, and save interesting places for later."], ["Scenic park and viewpoint break", "Slow down for 45–60 minutes in a garden, waterfront, or public overlook with time for photos and a seated rest."], ["Local market and specialty-food stop", "Browse regional produce and prepared foods, then choose one small snack; allow about an hour."], ["Café rest and trip-journal pause", "Build in 45 minutes to sit down, recharge devices, review the route, and note favorite discoveries."], ["Architecture and public-art loop", "Walk a compact route linking notable façades, plazas, murals, or monuments; allow 60–75 minutes."], ["Golden-hour promenade", "Use the softer evening light for a relaxed waterfront, park, or old-town walk before dinner."], ["After-dinner lights walk", "Finish with a 45-minute stroll through a lively illuminated district, keeping the route close to the return transit stop."], ["Live culture evening option", "Look for a short local music, theater, or cultural performance near today’s neighborhood and leave 90 minutes."]]
  };
  const type = pools[requestedType] ? requestedType : "Explore";
  const [title, detail] = pools[type][index % pools[type].length];
  const transport = preferences.transport === "low-walking" ? "Use a taxi or step-free transit and include a seated break." : preferences.transport === "mixed" ? "A short taxi hop is fine if it protects the day’s energy." : "Keep it on the same transit line or within a short walk of the prior stop.";
  const party = preferences.party === "family" ? " Keep the stop interactive and family-friendly." : preferences.party === "solo" ? " This is an easy, low-pressure solo stop." : "";
  const neighborhood = zone ? ` Keep this stop in ${zone.name} so the day remains geographically compact.` : "";
  return activity(type, type === "Eat" ? "🍴" : type === "Shop" ? "🛍️" : type === "Evening" ? "🌙" : "✨", time, `${title} · ${zone ? zone.name : formatDate(date, false)}`, `${detail}${neighborhood} ${transport}${party}`);
}

function suggestionToActivity(suggestion, index) {
  const schedules = {
    see: ["09:00", "14:00", "16:30", "18:00"],
    eat: ["10:30", "12:30", "18:30", "20:00"],
    shop: ["11:00", "15:30", "17:30", "18:30"]
  };
  const category = suggestion.category || "see";
  const time = schedules[category][index % schedules[category].length];
  const type = category === "eat" ? "Eat" : category === "shop" ? "Shop" : "See";
  const icon = category === "eat" ? "🍽️" : category === "shop" ? "🛍️" : "📍";
  const selectedDetail = [suggestion.detail, suggestion.area ? `Area: ${suggestion.area}.` : "",
    suggestion.rating ? `Google rating: ${suggestion.rating}.` : "", suggestion.cuisine ? `Cuisine: ${suggestion.cuisine}.` : "",
    suggestion.order ? `What to order: ${suggestion.order}.` : "", suggestion.bestFor ? `Known for: ${suggestion.bestFor}.` : "",
    suggestion.address ? `Address: ${suggestion.address}.` : "", "Prioritized from your survey selection."].filter(Boolean).join(" ");
  return activity(type, icon, time, suggestion.name, selectedDetail);
}

function timeToMinutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function activity(type, icon, time, title, description) { return { type, icon, time, title, description }; }
function place(name, area, detail, metadata = {}) { return { name, area, detail, ...metadata }; }
function areaText(item) { return item.area ? `Area: ${item.area}.` : ""; }

function getDestinationGuide(destination) {
  const known = destinationCatalogs.find((catalog) => catalog.match.test(destination));
  if (known) return known;
  return {
    banner: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1800&q=82",
    attractions: [
      place(`${destination} historic center`, "Central district", "Start with the best-known civic square, landmark streets, and a visitor-information stop."),
      place(`${destination} signature landmark`, "Landmark district", "Prioritize the destination’s most photographed monument and reserve timed entry if available."),
      place(`${destination} main museum`, "Museum district", "Choose the leading local history or art museum and focus on its highlight collection."),
      place(`${destination} old town walk`, "Historic quarter", "Follow a compact walking route through heritage streets, markets, and architecture."),
      place(`${destination} panoramic viewpoint`, "Scenic district", "Plan this stop for late afternoon light and broad city views."),
      place(`${destination} central market`, "Market district", "Sample regional specialties and browse stalls used by local residents."),
      place(`${destination} waterfront or grand park`, "Open-air district", "Balance major sights with a slower scenic walk."),
      place(`${destination} cultural quarter`, "Arts district", "Explore galleries, performance spaces, independent cafés, and evening activity.")
    ],
    food: {
      breakfast: [place("A top-rated neighborhood bakery", "Near your hotel", "Try the region’s best-known pastry with local coffee or tea."), place("The central market breakfast counter", "Market district", "Order a popular savory breakfast made by a busy local vendor."), place("A classic grand café", "Historic center", "Choose a long-running café known for traditional morning service.")],
      lunch: [place("The city’s landmark food hall", "Central district", "Compare several regional specialties in one convenient stop."), place("A beloved local lunch counter", "Old town", "Choose the house specialty at a high-turnover neighborhood favorite."), place("A popular regional restaurant", "Museum district", "Order the destination’s signature dish in a casual setting.")],
      dinner: [place("A celebrated traditional dining room", "Historic center", "Reserve a restaurant specializing in the destination’s classic cuisine."), place("A lively modern local restaurant", "Arts district", "Try a contemporary menu built around regional ingredients."), place("An atmospheric neighborhood favorite", "Old town", "End with a well-reviewed independent restaurant on a walkable evening street.")]
    },
    shopping: [place(`${destination} central shopping street`, "City center", "The best starting point for major brands, department stores, and local flagships."), place(`${destination} artisan market`, "Historic quarter", "Look for regional crafts, food gifts, and independent makers."), place(`${destination} design and vintage district`, "Creative quarter", "Browse independent fashion, vintage shops, books, and contemporary design.")]
  };
}

function renderTrip() {
  document.querySelector("#appDestination").textContent = trip.destination;
  document.querySelector("#reportTripName").textContent = `${trip.destination} · ${formatDate(trip.start, true)} — ${formatDate(trip.end, true)}`;
  document.querySelector("#resultTitle").textContent = `${trip.destination}, your way`;
  document.querySelector("#resultDates").textContent = `${formatDate(trip.start, true)} — ${formatDate(trip.end, true)}`;
  document.querySelector("#tripStats").innerHTML = [
    `${trip.days.length} ${trip.days.length === 1 ? "day" : "days"}`,
    `${trip.days.reduce((sum, day) => sum + day.activities.length, 0)} thoughtful stops`,
    `${titleCase(trip.preferences.pace)} pace · ${titleCase(trip.preferences.party)}`
  ].map((text) => `<span class="trip-stat">${escapeHtml(text)}</span>`).join("");

  const dayBar = document.querySelector(".report-day-bar");
  dayBar.style.setProperty("--destination-banner", `url("${trip.guide.banner}")`);
  dayBar.dataset.destination = trip.destination;
  document.querySelector(".app-home-hero").style.setProperty("--destination-banner", `url("${trip.guide.banner}")`);
  document.querySelectorAll(".compact-app-hero").forEach((banner) => banner.style.setProperty("--destination-banner", `url("${trip.guide.banner}")`));

  const nav = document.querySelector("#dayNav");
  nav.innerHTML = "";
  trip.days.forEach((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-button${index === activeDay ? " active" : ""}`;
    button.setAttribute("aria-label", `${formatDate(day.date, false)} — ${day.title}`);
    button.innerHTML = `<span class="day-nav-icon" aria-hidden="true">${getDayIcon(day, index)}</span><span class="day-nav-date">${formatDate(day.date, false)}</span>`;
    button.addEventListener("click", () => { activeDay = index; renderTrip(); });
    nav.appendChild(button);
  });

  const day = trip.days[activeDay];
  document.querySelector("#activeDayLabel").textContent = formatDate(day.date, false);
  document.querySelector("#activeDayTitle").textContent = day.title;
  const content = document.querySelector("#dayContent");
  content.innerHTML = "";
  day.activities.forEach((activity) => content.appendChild(renderActivity(activity)));
  renderRouteFlow(day);
  renderRouteMapPreview(day);
  renderHomePanel();
  renderWeatherPanel();
  renderCollections();
  switchAppTab(activeTab);
}

function renderHomePanel() {
  const firstDay = trip.days[0];
  const todayCard = document.querySelector("#todayCard");
  todayCard.innerHTML = `
    <div class="today-card-head">
      <div><span>Start here · ${formatDate(firstDay.date, false)}</span><h4>${escapeHtml(firstDay.title)}</h4></div>
      <button type="button" data-card-itinerary>Open day →</button>
    </div>
    <div class="today-stops">${firstDay.activities.slice(0, 3).map((activity) => `<div class="today-stop"><time>${escapeHtml(activity.time)}</time><strong><span aria-hidden="true">${activity.icon}</span> ${escapeHtml(activity.title)}</strong></div>`).join("")}</div>`;
  todayCard.querySelector("[data-card-itinerary]").addEventListener("click", () => { activeDay = 0; renderTrip(); switchAppTab("itinerary"); });

  const list = document.querySelector("#homeDayList");
  list.innerHTML = "";
  trip.days.forEach((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "home-day-item";
    const iconTrail = day.activities.slice(0, 5).map((activity) => activity.icon).join(" ");
    button.innerHTML = `<span class="home-day-date">${formatDate(day.date, false)}</span><div><strong>${getDayIcon(day, index)} ${escapeHtml(day.title)}</strong><small><span class="home-icon-trail" aria-hidden="true">${iconTrail}</span> ${day.activities.length} planned stops</small></div><i>›</i>`;
    button.addEventListener("click", () => { activeDay = index; renderTrip(); switchAppTab("itinerary"); });
    list.appendChild(button);
  });
}

function renderWeatherPanel() {
  const requestedDestination = trip.destination;
  const requestVersion = ++weatherRenderVersion;
  const weather = createSeasonalWeather(requestedDestination, trip.start);
  document.querySelector("#weatherLocation").textContent = requestedDestination;
  document.querySelector("#weatherKicker").textContent = "Current-day forecast loading";
  document.querySelector("#weatherDate").textContent = "Live weather";
  document.querySelector("#weatherIcon").textContent = weather.icon;
  document.querySelector("#tripWeatherBg").textContent = weather.icon;
  document.querySelector("#weatherTemp").textContent = `${weather.tempF}°F`;
  document.querySelector("#weatherCondition").textContent = `${weather.season} planning estimate`;
  document.querySelector("#weatherSummary").textContent = `${weather.summary} Showing an offline estimate while live conditions load.`;
  document.querySelector("#weatherMetrics").innerHTML = [
    `<span><small>🌡 High / low</small><strong>${weather.highF}° / ${weather.lowF}°</strong></span>`,
    `<span><small>🤗 Feels like</small><strong>${weather.tempF}°F</strong></span>`,
    `<span><small>💧 Humidity</small><strong>${weather.humidity}% est.</strong></span>`,
    `<span><small>💨 Wind</small><strong>${weather.windMph} mph est.</strong></span>`,
    `<span><small>☂ Rain</small><strong>${weather.rainChance}% est.</strong></span>`,
    `<span><small>🧳 Pack</small><strong>${escapeHtml(weather.pack)}</strong></span>`
  ].join("");
  document.querySelector("#weatherDisclaimer").textContent = "Seasonal fallback—live conditions will replace this estimate when available.";

  getLiveWeather(requestedDestination).then((live) => {
    if (!trip || trip.destination !== requestedDestination || requestVersion !== weatherRenderVersion) return;
    applyLiveWeather(live);
  }).catch(() => {
    if (!trip || trip.destination !== requestedDestination || requestVersion !== weatherRenderVersion) return;
    document.querySelector("#weatherKicker").textContent = "Seasonal planning estimate";
    document.querySelector("#weatherDate").textContent = formatDate(trip.start, true);
    document.querySelector("#weatherSummary").textContent = `${weather.summary} Typical ${weather.season.toLowerCase()} conditions for planning.`;
    document.querySelector("#weatherDisclaimer").textContent = "Live forecast unavailable—verify conditions closer to departure.";
  });
}

async function getLiveWeather(destination) {
  const cacheKey = destination.trim().toLowerCase();
  if (liveWeatherCache.has(cacheKey)) return liveWeatherCache.get(cacheKey);

  const request = (async () => {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
    const locationResponse = await fetch(geocodeUrl);
    if (!locationResponse.ok) throw new Error("Location lookup failed");
    const locationData = await locationResponse.json();
    const location = locationData.results && locationData.results[0];
    if (!location) throw new Error("Location not found");

    const forecastParams = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      timezone: "auto",
      forecast_days: "1"
    });
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`);
    if (!weatherResponse.ok) throw new Error("Forecast lookup failed");
    const forecast = await weatherResponse.json();
    return { location, forecast };
  })();

  liveWeatherCache.set(cacheKey, request);
  try {
    return await request;
  } catch (error) {
    liveWeatherCache.delete(cacheKey);
    throw error;
  }
}

function applyLiveWeather({ location, forecast }) {
  const current = forecast.current || {};
  const daily = forecast.daily || {};
  const code = Number(current.weather_code ?? daily.weather_code?.[0] ?? 0);
  const visual = weatherVisualForCode(code, current.is_day !== 0);
  const locationLabel = [location.name, location.admin1, location.country].filter((value, index, values) => value && values.indexOf(value) === index).join(", ");
  const localDate = current.time ? parseDate(current.time.slice(0, 10)) : new Date();
  const updatedTime = current.time && current.time.includes("T") ? formatWeatherTime(current.time.split("T")[1]) : "now";
  const high = Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m);
  const low = Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m);
  const rainChance = Math.round(daily.precipitation_probability_max?.[0] ?? current.precipitation_probability ?? 0);
  const sunrise = formatWeatherTime((daily.sunrise?.[0] || "").split("T")[1]);
  const sunset = formatWeatherTime((daily.sunset?.[0] || "").split("T")[1]);

  document.querySelector("#weatherLocation").textContent = locationLabel || trip.destination;
  document.querySelector("#weatherKicker").textContent = "Current conditions · today’s forecast";
  document.querySelector("#weatherDate").textContent = `${formatDate(localDate, true)} · ${updatedTime}`;
  document.querySelector("#weatherIcon").textContent = visual.icon;
  document.querySelector("#tripWeatherBg").textContent = visual.icon;
  document.querySelector("#weatherTemp").textContent = `${Math.round(current.temperature_2m)}°F`;
  document.querySelector("#weatherCondition").textContent = visual.label;
  document.querySelector("#weatherSummary").textContent = `${visual.detail} Feels like ${Math.round(current.apparent_temperature)}°F with ${Math.round(current.cloud_cover ?? 0)}% cloud cover.`;
  document.querySelector("#weatherMetrics").innerHTML = [
    `<span><small>🌡 High / low</small><strong>${high}° / ${low}°</strong></span>`,
    `<span><small>🤗 Feels like</small><strong>${Math.round(current.apparent_temperature)}°F</strong></span>`,
    `<span><small>💧 Humidity</small><strong>${Math.round(current.relative_humidity_2m)}%</strong></span>`,
    `<span><small>💨 Wind</small><strong>${Math.round(current.wind_speed_10m)} mph ${windDirection(current.wind_direction_10m)}</strong></span>`,
    `<span><small>☂ Rain chance</small><strong>${rainChance}%</strong></span>`,
    `<span><small>☀ Daylight</small><strong>${sunrise}–${sunset}</strong></span>`
  ].join("");
  document.querySelector("#weatherDisclaimer").textContent = "Live model forecast from Open-Meteo. Conditions can change; check again before heading out.";
}

function weatherVisualForCode(code, isDay) {
  if (code === 0) return { icon: isDay ? "☀️" : "🌙", label: "Clear", detail: "Clear skies are expected today." };
  if ([1, 2].includes(code)) return { icon: isDay ? "🌤️" : "☁️", label: "Partly cloudy", detail: "A mix of clouds and clearer periods is expected." };
  if (code === 3) return { icon: "☁️", label: "Overcast", detail: "Cloudy skies are expected through much of the day." };
  if ([45, 48].includes(code)) return { icon: "🌫️", label: "Foggy", detail: "Fog may reduce visibility, especially around open viewpoints." };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: "🌦️", label: "Drizzle", detail: "Light drizzle is possible; carry a compact layer." };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: "🌧️", label: "Rain", detail: "Rain is expected; keep an indoor alternative nearby." };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: "🌨️", label: "Snow", detail: "Snow or wintry showers may affect walking and transit." };
  if ([95, 96, 99].includes(code)) return { icon: "⛈️", label: "Thunderstorms", detail: "Thunderstorms are possible; monitor local alerts." };
  return { icon: "🌤️", label: "Variable", detail: "Variable conditions are expected today." };
}

function windDirection(degrees) {
  if (!Number.isFinite(Number(degrees))) return "";
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(Number(degrees) / 45) % 8];
}

function formatWeatherTime(value) {
  if (!value) return "—";
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hour, minute));
}

function createSeasonalWeather(destination, date) {
  const southernPattern = /australia|new zealand|argentina|chile|south africa|brazil|sydney|melbourne|auckland|cape town|buenos aires/i;
  let month = date.getMonth();
  if (southernPattern.test(destination)) month = (month + 6) % 12;

  const season = month <= 1 || month === 11 ? "Winter" : month <= 4 ? "Spring" : month <= 7 ? "Summer" : "Autumn";
  const profiles = {
    Winter: { icon: "☁️", tempC: 8, spread: 5, summary: "Cool with changeable skies.", pack: "Warm layers", daylight: "Shorter days", humidity: 72, windMph: 11, rainChance: 38 },
    Spring: { icon: "🌤️", tempC: 17, spread: 6, summary: "Mild with sun and passing showers.", pack: "Light layers", daylight: "Growing light", humidity: 64, windMph: 9, rainChance: 32 },
    Summer: { icon: "☀️", tempC: 27, spread: 7, summary: "Warm, bright, and often lively outdoors.", pack: "Sun protection", daylight: "Long days", humidity: 58, windMph: 7, rainChance: 22 },
    Autumn: { icon: "🍂", tempC: 19, spread: 6, summary: "Comfortable with crisp evenings.", pack: "A light jacket", daylight: "Gentle light", humidity: 67, windMph: 9, rainChance: 30 }
  };
  const profile = profiles[season];
  const offset = destination.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0) % 5 - 2;
  const tempC = profile.tempC + offset;
  const lowC = tempC - Math.round(profile.spread / 2);
  const highC = tempC + Math.round(profile.spread / 2);
  const toFahrenheit = (celsius) => Math.round(celsius * 9 / 5 + 32);

  return {
    ...profile,
    season,
    tempF: toFahrenheit(tempC),
    lowF: toFahrenheit(lowC),
    highF: toFahrenheit(highC)
  };
}

function getDayIcon(day, index) {
  if (day.zone && day.zone.icon) return day.zone.icon;
  const palette = ["🛫", "🏯", "🌆", "🎨", "🍜", "🎐", "🌳", "📸", "🗼", "🎭", "🚆", "🌙", "🎡", "🧭"];
  return palette[index % palette.length];
}

function assignDistinctActivityIcons(activities, dayIndex) {
  const pools = {
    Eat: ["☕", "🥐", "🍱", "🍜", "🍣", "🥢", "🍽️", "🍡"],
    See: ["🏯", "🏛️", "⛩️", "🗼", "🖼️", "🌉", "🎨", "📸"],
    Explore: ["🧭", "🚶", "🌿", "🔭", "🏙️", "🎐", "🚤", "✨"],
    Shop: ["🛍️", "👘", "🎁", "🧸", "📚", "⌚", "🎮", "💎"],
    Evening: ["🌙", "🏮", "🎭", "🎶", "🌃", "🍸", "🎆", "🎤"],
    Arrival: ["🛬", "🧳", "🚆", "🚕"]
  };
  const used = new Set();
  return activities.map((item, index) => {
    const pool = pools[item.type] || ["📍", "⭐", "🗺️", "🎟️", "📌", "🌟"];
    const themed = themedActivityIcon(item);
    if (themed && !used.has(themed)) {
      used.add(themed);
      return { ...item, icon: themed };
    }
    const candidates = [...pool.slice((dayIndex + index) % pool.length), ...pool.slice(0, (dayIndex + index) % pool.length)];
    const icon = candidates.find((candidate) => !used.has(candidate)) || pool[index % pool.length];
    used.add(icon);
    return { ...item, icon };
  });
}

function themedActivityIcon(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const themes = [
    [/senso|temple|shrine|meiji|zojoji|pagoda/, "⛩️"], [/tower|sky|viewpoint|observatory|panoramic/, "🗼"],
    [/museum|gallery|art/, "🖼️"], [/market|tsukiji|food hall/, "🐟"], [/sushi|nigiri/, "🍣"],
    [/ramen|noodle|soba/, "🍜"], [/tonkatsu|pork/, "🍱"], [/coffee|cafe|toast|breakfast/, "☕"],
    [/ginza|luxury|department store/, "💎"], [/akihabara|anime|game|electronics/, "🎮"],
    [/harajuku|fashion|vintage/, "👘"], [/bay|odaiba|waterfront|river|harbor/, "🌉"],
    [/park|garden|nature/, "🌳"], [/night|lights|evening/, "🏮"], [/train|transit|station/, "🚆"]
  ];
  const match = themes.find(([pattern]) => pattern.test(text));
  return match ? match[1] : null;
}

function renderRouteFlow(day) {
  const container = document.querySelector("#routeFlowWidget");
  const stops = day.activities.map((item, index) => ({ ...item, index }));
  container.innerHTML = `<div class="widget-title"><span>🗺️</span><div><p>Selected day</p><h3>Route Flow</h3></div></div><div class="route-flow-list"></div>`;
  const list = container.querySelector(".route-flow-list");
  stops.forEach((stop, index) => {
    const row = document.createElement("div");
    row.className = "route-flow-stop";
    const next = stops[index + 1];
    const travel = next ? estimateTravel(stop, next) : null;
    row.innerHTML = `<div class="route-stop-marker">${stop.icon}</div><div><time>${escapeHtml(stop.time)}</time><strong>${escapeHtml(cleanActivityTitle(stop.title))}</strong>${travel ? `<small>${travel.icon} ${travel.minutes} min to next stop · ${travel.mode}</small>` : `<small>🏁 End of today’s route</small>`}</div>`;
    list.appendChild(row);
  });
}

function estimateTravel(current, next) {
  const gap = Math.max(10, timeToMinutes(next.time) - timeToMinutes(current.time));
  const mode = trip.preferences.transport === "low-walking" ? "taxi / accessible transit" : trip.preferences.transport === "mixed" ? "transit or taxi" : "walk + transit";
  const minutes = Math.min(45, Math.max(8, Math.round(Math.min(gap * .22, 35) / 5) * 5));
  return { minutes, mode, icon: trip.preferences.transport === "low-walking" ? "🚕" : gap <= 75 ? "🚶" : "🚇" };
}

function renderRouteMapPreview(day) {
  const container = document.querySelector("#routeMapPreview");
  const namedStops = day.activities.map((item) => cleanActivityTitle(item.title)).filter(Boolean);
  const routeUrl = googleMapsDirectionsUrl(namedStops);
  const embedUrl = googleMapsEmbedRouteUrl(namedStops);
  container.innerHTML = `<section class="route-map-widget"><div class="widget-title"><span>🧭</span><div><p>${escapeHtml(formatDate(day.date, false))}</p><h3>Google Route Map</h3></div><a class="google-maps-link" href="${routeUrl}" target="_blank" rel="noopener noreferrer">Open full Google route ↗</a></div><div class="route-map-grid"><iframe class="google-route-frame" src="${embedUrl}" title="Google map of the ${escapeHtml(formatDate(day.date, false))} itinerary in ${escapeHtml(trip.destination)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe><ol>${namedStops.map((name, index) => `<li><span>${day.activities[index].icon}</span><a href="${googleMapsSearchUrl(name)}" target="_blank" rel="noopener noreferrer"><b>${index + 1}.</b> ${escapeHtml(name)}</a></li>`).join("")}</ol></div><p class="map-estimate-note">The embedded Google map uses today’s ordered itinerary places. Open the full route for live traffic, transit schedules, and detailed turn-by-turn directions.</p></section>`;
}

function googleMapsEmbedRouteUrl(stops) {
  const routeQuery = stops.length ? stops.slice(0, 8).map((stop) => `${stop} ${trip.destination}`).join(" to ") : trip.destination;
  return `https://www.google.com/maps?q=${encodeURIComponent(routeQuery)}&output=embed`;
}

function googleMapsDirectionsUrl(stops) {
  if (!stops.length) return googleMapsSearchUrl(trip.destination);
  const params = new URLSearchParams({ api: "1", origin: `${stops[0]} ${trip.destination}`, destination: `${stops[stops.length - 1]} ${trip.destination}`, travelmode: trip.preferences.transport === "low-walking" ? "driving" : "transit" });
  if (stops.length > 2) params.set("waypoints", stops.slice(1, -1).map((stop) => `${stop} ${trip.destination}`).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}

function renderCollections() {
  renderCollection("#mapsList", ["Explore", "See", "Arrival", "Eat", "Shop", "Evening"], "Your planned stops will appear here by day.", true);
  renderFoodOptions();
  renderShoppingOptions();
}

function renderFoodOptions() {
  const container = document.querySelector("#foodList");
  const activeZone = trip.days[activeDay].zone;
  container.innerHTML = `<div class="selected-date-context"><span>Selected date · ${escapeHtml(activeZone ? activeZone.name : trip.destination)}</span><strong>${formatDate(trip.days[activeDay].date, false)}</strong><a class="google-maps-link" href="${googleMapsSearchUrl(`best restaurants ${activeZone ? activeZone.name : ""}`)}" target="_blank" rel="noopener noreferrer">Discover more on Google Maps ↗</a></div>`;
  [
    { label: "Breakfast", icon: "☕", options: trip.guide.food.breakfast },
    { label: "Lunch", icon: "🥪", options: trip.guide.food.lunch },
    { label: "Dinner", icon: "🍽️", options: trip.guide.food.dinner }
  ].forEach((group) => {
    const section = document.createElement("section");
    section.className = "option-group";
    section.innerHTML = `<div class="option-group-heading"><span>${group.icon}</span><div><p>Three popular options</p><h3>${group.label}</h3></div></div>`;
    const grid = document.createElement("div");
    grid.className = "option-card-grid";
    rankForZone(group.options, activeZone).slice(0, 3).forEach((option, index) => grid.appendChild(renderRecommendationCard(option, `${group.label} option ${index + 1}`, group.icon)));
    section.appendChild(grid);
    container.appendChild(section);
  });
  container.appendChild(renderPlanningNote("Restaurant popularity, hours, and reservation policies change. Verify details before visiting."));
}

function renderShoppingOptions() {
  const container = document.querySelector("#shopList");
  const activeZone = trip.days[activeDay].zone;
  container.innerHTML = `<div class="selected-date-context"><span>Selected date · ${escapeHtml(activeZone ? activeZone.name : trip.destination)}</span><strong>${formatDate(trip.days[activeDay].date, false)}</strong><a class="google-maps-link" href="${googleMapsSearchUrl(`best shopping ${activeZone ? activeZone.name : ""}`)}" target="_blank" rel="noopener noreferrer">Discover more on Google Maps ↗</a></div><section class="option-group"><div class="option-group-heading"><span>🛍️</span><div><p>Popular near today’s route</p><h3>Where to shop</h3></div></div><div class="option-card-grid" id="shoppingOptionGrid"></div></section>`;
  const grid = container.querySelector("#shoppingOptionGrid");
  rankForZone(trip.guide.shopping, activeZone).slice(0, 3).forEach((option, index) => grid.appendChild(renderRecommendationCard(option, `Shopping option ${index + 1}`, "🛍️")));
  container.appendChild(renderPlanningNote("Market days and store hours vary. Confirm schedules before building the final route."));
}

function renderRecommendationCard(option, label, icon) {
  const article = document.createElement("article");
  article.className = "recommendation-card";
  const rating = option.rating ? `<span class="place-fact"><b>⭐ Google rating</b>${escapeHtml(option.rating)} / 5 <em>· verify live</em></span>` : "";
  const address = option.address ? `<span class="place-fact"><b>📍 Address</b>${escapeHtml(option.address)}</span>` : `<span class="place-fact"><b>📍 Area</b>${escapeHtml(option.area || trip.destination)}</span>`;
  const specialty = option.order ? `<span class="place-fact"><b>🥢 What to order</b>${escapeHtml(option.order)}</span>` : option.bestFor ? `<span class="place-fact"><b>🛍️ Best for</b>${escapeHtml(option.bestFor)}</span>` : "";
  article.innerHTML = `<span class="recommendation-icon" aria-hidden="true">${icon}</span><div><span class="recommendation-label">${escapeHtml(label)}</span><h4>${escapeHtml(option.name)}</h4><p>${escapeHtml(option.detail)}</p><div class="place-facts">${rating}${address}${specialty}</div><a class="google-maps-link" href="${googleMapsSearchUrl(option.name, option.address || option.area)}" target="_blank" rel="noopener noreferrer" aria-label="Find ${escapeHtml(option.name)} on Google Maps">Live details on Google Maps ↗</a></div>`;
  return article;
}

function renderPlanningNote(text) {
  const note = document.createElement("p");
  note.className = "planning-note";
  note.textContent = text;
  return note;
}

function renderCollection(selector, types, emptyText, includeMapLinks = false) {
  const container = document.querySelector(selector);
  container.innerHTML = includeMapLinks ? `<div class="maps-destination-context"><span>Map context for</span><strong>${escapeHtml(trip.destination)}</strong><a class="google-maps-link" href="${googleMapsSearchUrl(`popular places to see eat and shop`, "")}" target="_blank" rel="noopener noreferrer">Explore ${escapeHtml(trip.destination)} on Google Maps ↗</a></div>` : "";
  const sourceDays = includeMapLinks ? [{ day: trip.days[activeDay], dayIndex: activeDay }] : trip.days.map((day, dayIndex) => ({ day, dayIndex }));
  const matches = sourceDays.flatMap(({ day, dayIndex }) => day.activities.filter((activity) => types.includes(activity.type)).map((activity) => ({ activity, dayIndex, day })));
  if (!matches.length) {
    container.innerHTML = `<p class="empty-collection">${escapeHtml(emptyText)}</p>`;
    return;
  }
  matches.forEach(({ activity, dayIndex, day }) => {
    const fragment = document.querySelector("#collectionTemplate").content.cloneNode(true);
    const card = fragment.querySelector(".collection-card");
    fragment.querySelector(".collection-icon").textContent = activity.icon;
    fragment.querySelector(".collection-day").textContent = `${formatDate(day.date, false)} · ${activity.time}`;
    fragment.querySelector("h3").textContent = activity.title;
    fragment.querySelector("p").textContent = activity.description;
    if (includeMapLinks) {
      const mapLink = document.createElement("a");
      mapLink.className = "google-maps-link";
      mapLink.href = googleMapsSearchUrl(cleanActivityTitle(activity.title), "");
      mapLink.target = "_blank";
      mapLink.rel = "noopener noreferrer";
      mapLink.textContent = "Open this stop in Google Maps ↗";
      mapLink.addEventListener("click", (event) => event.stopPropagation());
      fragment.querySelector("p").after(mapLink);
    }
    card.addEventListener("click", () => { activeDay = dayIndex; renderTrip(); switchAppTab("itinerary"); });
    container.appendChild(fragment);
  });
}

function cleanActivityTitle(title) {
  return title.replace(/^(Breakfast|Lunch|Dinner|Farewell dinner):\s*/i, "").replace(/\s·\s(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),.*$/i, "").trim();
}

function googleMapsSearchUrl(name, area = "") {
  const query = [name, area, trip && trip.destination].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function renderActivity(activity) {
  const fragment = document.querySelector("#activityTemplate").content.cloneNode(true);
  fragment.querySelector(".activity-time").textContent = activity.time;
  fragment.querySelector(".activity-icon").textContent = activity.icon;
  fragment.querySelector(".activity-type").textContent = activity.type;
  fragment.querySelector("h4").textContent = activity.title;
  const activityImage = fragment.querySelector(".activity-photo");
  const activityName = cleanActivityTitle(activity.title);
  activityImage.src = suggestionImagePlaceholder({ name: activityName, category: activity.type === "Eat" ? "eat" : activity.type === "Shop" ? "shop" : "see" });
  activityImage.alt = `${activityName} in ${trip.destination}`;
  hydrateSuggestionImage(activityImage, { name: activityName, category: activity.type === "Eat" ? "eat" : activity.type === "Shop" ? "shop" : "see", image: "" }, trip.destination);
  fragment.querySelector(".activity-copy p").textContent = activity.description;
  const mapLink = document.createElement("a");
  mapLink.className = "google-maps-link";
  mapLink.href = googleMapsSearchUrl(cleanActivityTitle(activity.title), "");
  mapLink.target = "_blank";
  mapLink.rel = "noopener noreferrer";
  mapLink.textContent = "Google Maps details ↗";
  fragment.querySelector(".activity-copy p").after(mapLink);
  fragment.querySelector(".activity-menu").addEventListener("click", (event) => {
    const card = event.currentTarget.closest(".activity-card");
    card.querySelector("h4").contentEditable = "true";
    card.querySelector("h4").focus();
  });
  return fragment;
}

function parseIdeas(text) {
  const ideas = text.split(/,|\n|;|\band\b/i).map((part) => part.trim()).filter((part) => part.length > 2);
  return [...new Map(ideas.map((idea) => [idea.toLowerCase(), idea])).values()];
}
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function parseDate(value) { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); }
function toInputDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function formatDate(date, includeYear) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: includeYear ? undefined : "short", year: includeYear ? "numeric" : undefined }).format(date); }
function titleCase(text) { return text.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

function safeStorageGet(key) {
  try { return window.localStorage.getItem(key); } catch (error) { return null; }
}

function safeStorageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch (error) { /* The file-based public demo still works without storage. */ }
}

function safeStorageRemove(key) {
  try { window.localStorage.removeItem(key); } catch (error) { /* Storage is optional. */ }
}

function restoreSavedTrip() {
  let saved = null;
  try { saved = JSON.parse(safeStorageGet("x-travel-guide-trip") || safeStorageGet("roam-trip") || "null"); } catch (error) { saved = null; }
  if (!saved) return;

  destinationInput.value = saved.destination || "";
  suggestionDestination = (saved.destination || "").trim().toLowerCase();
  startDateInput.value = saved.start || startDateInput.value;
  endDateInput.value = saved.end || endDateInput.value;
  wishListInput.value = saved.wishes || "";
  setTripPreferences(saved.preferences || {});
  selectedSuggestions.clear();
  (saved.selections || []).forEach((suggestion) => {
    if (suggestion && suggestion.key) selectedSuggestions.set(suggestion.key, suggestion);
  });

  if (!saved.destination || !saved.start || !saved.end || (!saved.wishes && !selectedSuggestions.size)) return;
  const start = parseDate(saved.start);
  const end = parseDate(saved.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return;

  trip = buildTrip(saved.destination.trim(), start, end, saved.wishes.trim(), [...selectedSuggestions.values()], saved.preferences || {});
  activeDay = 0;
  activeTab = "home";
  builder.hidden = true;
  result.hidden = false;
  document.body.classList.add("trip-mode");
  renderTrip();
  switchAppTab("home");
}

restoreSavedTrip();
