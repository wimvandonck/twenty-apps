// Fills a workspace with demo data for the nonprofit app: people,
// companies, events, ticket types, registrations, campaigns, donations,
// recurring donations, products, orders, order lines, payments, tasks
// and notes, all linked to each other.
//
//   TWENTY_API_URL=https://your-workspace.twenty.com TWENTY_API_KEY=... node scripts/seed-demo-data.mjs
//   TWENTY_API_URL=... TWENTY_API_KEY=... node scripts/seed-demo-data.mjs --clean
//
// Demo people have an @example.org address and demo companies an
// .example domain. --clean removes exactly the records this script
// creates and leaves everything else alone.

const API_URL = process.env.TWENTY_API_URL?.replace(/\/$/, '');
const API_KEY = process.env.TWENTY_API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Set TWENTY_API_URL and TWENTY_API_KEY first.');
  process.exit(1);
}

const graphql = async (query, variables = {}) => {
  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors.map((error) => error.message).join('\n'));
  }

  return result.data;
};

const eur = (amount) => ({ amountMicros: Math.round(amount * 1_000_000), currencyCode: 'EUR' });
const capitalize = (text) => text[0].toUpperCase() + text.slice(1);
const omit = (object, ...names) =>
  Object.fromEntries(Object.entries(object).filter(([name]) => !names.includes(name)));

// ---------------------------------------------------------------- data

const PEOPLE = [
  ['An', 'Peeters', 'Gent', 'bakkerij'],
  ['Bram', 'Janssens', 'Antwerpen', null],
  ['Charlotte', 'Maes', 'Antwerpen', null],
  ['Dries', 'Jacobs', 'Kortrijk', 'garage'],
  ['Emma', 'Willems', 'Leuven', 'advocaten'],
  ['Femke', 'Claes', 'Mechelen', null],
  ['Gilles', 'Claes', 'Mechelen', null],
  ['Hanne', 'Wouters', 'Hasselt', 'apotheek'],
  ['Ilias', 'El Amrani', 'Brussel', 'nexa'],
  ['Jana', 'De Smet', 'Gent', null],
  ['Kobe', 'Dubois', 'Brugge', 'fietsen'],
  ['Lotte', 'Mertens', 'Leuven', null],
].map(([firstName, lastName, city, company]) => ({
  key: firstName.toLowerCase(),
  firstName,
  lastName,
  city,
  company,
  email: `${firstName}.${lastName}`.toLowerCase().replace(/ /g, '') + '@example.org',
}));

const COMPANIES = [
  ['bakkerij', 'Bakkerij De Korenaar', 'Gent'],
  ['drukkerij', 'Drukkerij Van Hoof', 'Lier'],
  ['brouwerij', 'Brouwerij De Kanunnik', 'Mechelen'],
  ['advocaten', 'Advocatenkantoor Lambrecht', 'Leuven'],
  ['bouw', 'Bouwbedrijf Verhaegen', 'Aalst'],
  ['garage', 'Garage Desmet', 'Kortrijk'],
  ['nexa', 'IT-bureau Nexa', 'Brussel'],
  ['apotheek', 'Apotheek Lindenhof', 'Hasselt'],
  ['fietsen', 'Fietsen Vandamme', 'Brugge'],
  ['koffie', 'Koffiebranderij Mokka', 'Antwerpen'],
].map(([key, name, city]) => ({
  key,
  name,
  city,
  domain: `${name.toLowerCase().replace(/[^a-z]+/g, '-')}.example`,
}));

const address = (street, postcode, city) => ({
  addressStreet1: street,
  addressPostcode: postcode,
  addressCity: city,
  addressCountry: 'Belgium',
});

const EVENTS = [
  { key: 'nieuwjaar', name: 'Nieuwjaarsreceptie 2027', status: 'OPEN', startsAt: '2027-01-15T18:00:00Z', endsAt: '2027-01-15T21:00:00Z', capacity: 150, location: address('Kouter 1', '9000', 'Gent'), description: 'Gratis receptie voor leden, vrijwilligers en sympathisanten.' },
  { key: 'diner', name: 'Benefietdiner', status: 'OPEN', startsAt: '2026-12-05T18:30:00Z', endsAt: '2026-12-05T23:00:00Z', registrationDeadline: '2026-11-28T23:00:00Z', capacity: 120, price: 75, location: address('Groenplaats 21', '2000', 'Antwerpen'), description: 'Driegangendiner met veiling. De opbrengst gaat naar de nieuwe bus voor de dagwerking.' },
  { key: 'sponsorloop', name: 'Sponsorloop 2027', status: 'OPEN', startsAt: '2027-03-21T09:00:00Z', endsAt: '2027-03-21T13:00:00Z', capacity: 400, price: 15, location: address('Vrijbroekpark', '2800', 'Mechelen') },
  { key: 'vrijwilligers', name: 'Vrijwilligersavond', status: 'FULL', startsAt: '2026-11-28T18:00:00Z', endsAt: '2026-11-28T22:00:00Z', capacity: 3, location: address('Bondgenotenlaan 40', '3000', 'Leuven'), description: 'Bedankavond voor onze vrijwilligers.' },
  { key: 'workshop', name: 'Workshop fondsenwerving', status: 'OPEN', startsAt: '2026-12-12T08:30:00Z', endsAt: '2026-12-12T12:00:00Z', capacity: 25, price: 25, location: address('Grote Markt 7', '8500', 'Kortrijk') },
  { key: 'webinar', name: 'Webinar: nalaten aan een goed doel', status: 'OPEN', startsAt: '2026-11-20T19:00:00Z', endsAt: '2026-11-20T20:00:00Z', onlineLink: { primaryLinkUrl: 'https://webinar.example/nalaten' } },
  { key: 'av', name: 'Algemene vergadering 2027', status: 'DRAFT', startsAt: '2027-03-05T18:00:00Z', endsAt: '2027-03-05T20:00:00Z', capacity: 60, location: address('Kouter 1', '9000', 'Gent') },
  { key: 'bbq', name: 'Zomerbarbecue', status: 'CLOSED', startsAt: '2026-06-27T16:00:00Z', endsAt: '2026-06-27T22:00:00Z', capacity: 200, price: 20, location: address('Kanaalkaai 3', '3500', 'Hasselt') },
  { key: 'quiz', name: 'Quizavond', status: 'CLOSED', startsAt: '2026-10-17T18:00:00Z', endsAt: '2026-10-17T22:30:00Z', capacity: 30, price: 40, location: address('Markt 12', '8000', 'Brugge'), description: 'Prijs per ploeg van vier.' },
  { key: 'kerstmarkt', name: 'Kerstmarkt', status: 'OPEN', startsAt: '2026-12-19T13:00:00Z', endsAt: '2026-12-19T20:00:00Z', location: address('Grote Markt 1', '2800', 'Mechelen') },
];

const TICKET_TYPES = [
  { key: 'diner-standaard', event: 'diner', name: 'Standaard', price: 75, capacity: 80 },
  { key: 'diner-lid', event: 'diner', name: 'Lid', price: 60, capacity: 40 },
  { key: 'diner-tafel', event: 'diner', name: 'Tafel van acht', price: 520, capacity: 5 },
  { key: 'loop-volwassene', event: 'sponsorloop', name: 'Volwassene', price: 15 },
  { key: 'loop-kind', event: 'sponsorloop', name: 'Kind tot 12 jaar', price: 5 },
  { key: 'workshop-deelnemer', event: 'workshop', name: 'Deelnemer', price: 25 },
  { key: 'workshop-student', event: 'workshop', name: 'Student', price: 10, capacity: 5 },
  { key: 'bbq-volwassene', event: 'bbq', name: 'Volwassene', price: 20, isAvailable: false },
  { key: 'bbq-kind', event: 'bbq', name: 'Kind', price: 8, isAvailable: false },
  { key: 'quiz-ploeg', event: 'quiz', name: 'Ploeg van vier', price: 40, isAvailable: false },
];

const CAMPAIGNS = [
  { key: 'eindejaar', name: 'Eindejaarsactie 2026', status: 'ACTIVE', goal: 25000, startsOn: '2026-11-01', endsOn: '2026-12-31' },
  { key: 'bus', name: 'Nieuwe bus voor de dagwerking', status: 'ACTIVE', goal: 40000, startsOn: '2026-09-01', endsOn: '2027-06-30' },
  { key: 'werking', name: 'Algemene werking', status: 'ACTIVE', description: 'Giften zonder specifiek doel.' },
  { key: 'huiswerk', name: 'Huiswerkbegeleiding', status: 'ACTIVE', goal: 8000, startsOn: '2026-09-01', endsOn: '2027-06-30' },
  { key: 'kerstpakketten', name: 'Kerstpakketten', status: 'ACTIVE', goal: 5000, startsOn: '2026-11-15', endsOn: '2026-12-24' },
  { key: 'legaten', name: 'Legaten en nalatenschappen', status: 'ACTIVE' },
  { key: 'overstromingen', name: 'Noodhulp overstromingen', status: 'COMPLETED', goal: 15000, startsOn: '2026-07-20', endsOn: '2026-09-30' },
  { key: 'zomerkampen', name: 'Zomerkampen 2026', status: 'COMPLETED', goal: 12000, startsOn: '2026-03-01', endsOn: '2026-08-31' },
  { key: 'lente', name: 'Lentecampagne 2027', status: 'PLANNED', goal: 10000, startsOn: '2027-03-01', endsOn: '2027-05-31' },
  { key: 'sponsorloop', name: 'Sponsorloop 2027', status: 'PLANNED', goal: 6000, startsOn: '2027-01-15', endsOn: '2027-03-31' },
];

const RECURRING_DONATIONS = [
  { key: 'r-an', donor: 'an', amount: 10, frequency: 'MONTHLY', status: 'ACTIVE', startsOn: '2025-01-01', nextCollectionOn: '2026-12-01', campaign: 'werking' },
  { key: 'r-bram', donor: 'bram', amount: 25, frequency: 'MONTHLY', status: 'ACTIVE', startsOn: '2024-06-01', nextCollectionOn: '2026-12-01', campaign: 'bus' },
  { key: 'r-emma', donor: 'emma', amount: 15, frequency: 'MONTHLY', status: 'ACTIVE', startsOn: '2026-03-01', nextCollectionOn: '2026-12-01', campaign: 'huiswerk' },
  { key: 'r-femke', donor: 'femke', amount: 50, frequency: 'QUARTERLY', status: 'ACTIVE', startsOn: '2025-10-01', nextCollectionOn: '2027-01-01', campaign: 'werking' },
  { key: 'r-hanne', donor: 'hanne', amount: 5, frequency: 'MONTHLY', status: 'PAUSED', startsOn: '2025-05-01', campaign: 'werking' },
  { key: 'r-ilias', donor: 'ilias', amount: 20, frequency: 'MONTHLY', status: 'ACTIVE', startsOn: '2026-09-01', nextCollectionOn: '2026-12-01', campaign: 'huiswerk' },
  { key: 'r-jana', donor: 'jana', amount: 12, frequency: 'MONTHLY', status: 'FAILED', startsOn: '2026-01-01', campaign: 'werking' },
  { key: 'r-kobe', donor: 'kobe', amount: 120, frequency: 'YEARLY', status: 'ACTIVE', startsOn: '2023-12-01', nextCollectionOn: '2026-12-01', campaign: 'werking' },
  { key: 'r-lotte', donor: 'lotte', amount: 8, frequency: 'MONTHLY', status: 'CANCELLED', startsOn: '2024-02-01', endsOn: '2026-08-31', campaign: 'werking' },
  { key: 'r-nexa', company: 'nexa', amount: 250, frequency: 'QUARTERLY', status: 'ACTIVE', startsOn: '2025-01-01', nextCollectionOn: '2027-01-01', campaign: 'bus' },
];

const PRODUCTS = [
  { key: 'tshirt', name: 'T-shirt met logo', sku: 'TS-001', price: 15, stock: 120 },
  { key: 'mok', name: 'Mok', sku: 'MOK-001', price: 8, stock: 60 },
  { key: 'tas', name: 'Draagtas', sku: 'TAS-001', price: 6, stock: 200 },
  { key: 'kaarten', name: 'Set wenskaarten', sku: 'KRT-005', price: 10, stock: 80 },
  { key: 'kalender', name: 'Kalender 2027', sku: 'KAL-2027', price: 12, stock: 150 },
  { key: 'boek', name: 'Boek "25 jaar samen"', sku: 'BOEK-25', price: 20, stock: 40 },
  { key: 'pin', name: 'Pin', sku: 'PIN-001', price: 3, stock: 500 },
  { key: 'kerstpakket', name: 'Kerstpakket', sku: 'KERST-2026', price: 35, stock: 50 },
  { key: 'fles', name: 'Herbruikbare drinkfles', sku: 'FLES-001', price: 14, stock: 0, isActive: false },
  { key: 'bon', name: 'Digitale cadeaubon', sku: 'BON-025', price: 25 },
];

// Each payment is referenced by key from the records it pays for.
const PAYMENTS = [
  { key: 'p-reg-an', payer: 'an', amount: 75, status: 'PAID', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-10-02T10:12:00Z' },
  { key: 'p-reg-bram', payer: 'bram', amount: 120, status: 'PAID', method: 'CREDIT_CARD', provider: 'MOLLIE', paidAt: '2026-10-05T19:40:00Z' },
  { key: 'p-reg-dries', payer: 'dries', amount: 75, status: 'OPEN', method: 'BANCONTACT', provider: 'MOLLIE' },
  { key: 'p-reg-emma', payer: 'emma', amount: 75, status: 'REFUNDED', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-10-08T08:03:00Z' },
  { key: 'p-reg-femke', payer: 'femke', amount: 20, status: 'PAID', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-11-02T12:00:00Z' },
  { key: 'p-reg-kobe', payer: 'kobe', amount: 20, status: 'PAID', method: 'CASH', provider: 'MANUAL', paidAt: '2026-06-27T16:20:00Z' },
  { key: 'p-reg-lotte', payer: 'lotte', amount: 20, status: 'PAID', method: 'BANK_TRANSFER', provider: 'MANUAL', paidAt: '2026-06-20T09:00:00Z' },
  { key: 'p-reg-quiz', payer: 'dries', amount: 40, status: 'PAID', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-10-01T20:15:00Z' },
  { key: 'p-reg-jana', payer: 'jana', amount: 10, status: 'EXPIRED', method: 'BANCONTACT', provider: 'MOLLIE' },
  { key: 'p-don-an-okt', payer: 'an', amount: 10, status: 'PAID', method: 'SEPA_DIRECT_DEBIT', provider: 'MOLLIE', paidAt: '2026-10-01T06:00:00Z' },
  { key: 'p-don-an-nov', payer: 'an', amount: 10, status: 'PAID', method: 'SEPA_DIRECT_DEBIT', provider: 'MOLLIE', paidAt: '2026-11-01T06:00:00Z' },
  { key: 'p-don-bram-nov', payer: 'bram', amount: 25, status: 'PAID', method: 'SEPA_DIRECT_DEBIT', provider: 'MOLLIE', paidAt: '2026-11-01T06:00:00Z' },
  { key: 'p-don-emma-nov', payer: 'emma', amount: 15, status: 'PAID', method: 'SEPA_DIRECT_DEBIT', provider: 'MOLLIE', paidAt: '2026-11-01T06:00:00Z' },
  { key: 'p-don-ilias-nov', payer: 'ilias', amount: 20, status: 'PAID', method: 'SEPA_DIRECT_DEBIT', provider: 'MOLLIE', paidAt: '2026-11-01T06:00:00Z' },
  { key: 'p-don-jana-nov', payer: 'jana', amount: 12, status: 'FAILED', method: 'SEPA_DIRECT_DEBIT', provider: 'MOLLIE' },
  { key: 'p-don-charlotte', payer: 'charlotte', amount: 100, status: 'PAID', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-11-03T21:10:00Z' },
  { key: 'p-don-gilles', payer: 'gilles', amount: 30, status: 'PAID', method: 'PAYPAL', provider: 'MOLLIE', paidAt: '2026-08-02T14:00:00Z' },
  { key: 'p-don-brouwerij', amount: 1000, status: 'PAID', method: 'BANK_TRANSFER', provider: 'MANUAL', paidAt: '2026-10-20T00:00:00Z' },
  { key: 'p-ord-1', payer: 'an', amount: 23, status: 'PAID', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-10-10T10:00:00Z' },
  { key: 'p-ord-2', payer: 'bram', amount: 70, status: 'PAID', method: 'CREDIT_CARD', provider: 'MOLLIE', paidAt: '2026-11-04T18:00:00Z' },
  { key: 'p-ord-3', payer: 'charlotte', amount: 24, status: 'PAID', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-11-06T09:30:00Z' },
  { key: 'p-ord-4', payer: 'femke', amount: 20, status: 'PENDING', method: 'BANK_TRANSFER', provider: 'MANUAL' },
  { key: 'p-ord-6', payer: 'hanne', amount: 25, status: 'PAID', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-11-08T13:00:00Z' },
  { key: 'p-ord-7', amount: 350, status: 'PAID', method: 'BANK_TRANSFER', provider: 'MANUAL', paidAt: '2026-11-10T00:00:00Z' },
  { key: 'p-ord-8', payer: 'kobe', amount: 15, status: 'REFUNDED', method: 'BANCONTACT', provider: 'MOLLIE', paidAt: '2026-09-15T11:00:00Z' },
  { key: 'p-ord-9', payer: 'lotte', amount: 18, status: 'PAID', method: 'CASH', provider: 'MANUAL', paidAt: '2026-06-27T19:00:00Z' },
];

const REGISTRATIONS = [
  { attendee: 'an', event: 'diner', ticketType: 'diner-standaard', status: 'CONFIRMED', paymentStatus: 'PAID', amount: 75, payment: 'p-reg-an', registeredAt: '2026-10-02T10:10:00Z', dietaryRequirements: ['VEGETARIAN'], answers: { Tafelvoorkeur: 'Bij Bram Janssens' } },
  { attendee: 'bram', event: 'diner', ticketType: 'diner-lid', status: 'CONFIRMED', paymentStatus: 'PAID', amount: 60, payment: 'p-reg-bram', registeredAt: '2026-10-05T19:35:00Z' },
  { attendee: 'charlotte', bookedBy: 'bram', event: 'diner', ticketType: 'diner-lid', status: 'CONFIRMED', paymentStatus: 'PAID', amount: 60, payment: 'p-reg-bram', registeredAt: '2026-10-05T19:35:00Z', dietaryRequirements: ['GLUTEN_FREE', 'LACTOSE_FREE'] },
  { attendee: 'dries', event: 'diner', ticketType: 'diner-standaard', status: 'PENDING', paymentStatus: 'UNPAID', amount: 75, payment: 'p-reg-dries', registeredAt: '2026-11-12T08:00:00Z' },
  { attendee: 'emma', event: 'diner', ticketType: 'diner-standaard', status: 'CANCELLED', paymentStatus: 'REFUNDED', amount: 75, payment: 'p-reg-emma', registeredAt: '2026-10-08T08:00:00Z', remarks: 'Kan toch niet, vroeg terugbetaling.' },
  { attendee: 'femke', event: 'sponsorloop', ticketType: 'loop-volwassene', status: 'CONFIRMED', paymentStatus: 'PAID', amount: 15, payment: 'p-reg-femke', registeredAt: '2026-11-02T11:58:00Z', answers: { Afstand: '10 km', 'T-shirtmaat': 'M' } },
  { attendee: 'gilles', bookedBy: 'femke', event: 'sponsorloop', ticketType: 'loop-kind', status: 'CONFIRMED', paymentStatus: 'PAID', amount: 5, payment: 'p-reg-femke', registeredAt: '2026-11-02T11:58:00Z', answers: { Afstand: '2 km', 'T-shirtmaat': '128' } },
  { attendee: 'hanne', event: 'vrijwilligers', status: 'CONFIRMED', paymentStatus: 'NOT_REQUIRED', registeredAt: '2026-11-01T17:00:00Z', dietaryRequirements: ['VEGAN'] },
  { attendee: 'ilias', event: 'vrijwilligers', status: 'CONFIRMED', paymentStatus: 'NOT_REQUIRED', registeredAt: '2026-11-03T12:00:00Z', dietaryRequirements: ['HALAL'] },
  { attendee: 'kobe', event: 'vrijwilligers', status: 'CONFIRMED', paymentStatus: 'NOT_REQUIRED', registeredAt: '2026-11-04T12:00:00Z' },
  { attendee: 'jana', event: 'vrijwilligers', status: 'WAITLIST', paymentStatus: 'NOT_REQUIRED', registeredAt: '2026-11-09T20:00:00Z', accessibilityNeeds: 'Rolstoeltoegankelijke plaats' },
  { attendee: 'jana', event: 'workshop', ticketType: 'workshop-student', status: 'PENDING', paymentStatus: 'UNPAID', amount: 10, payment: 'p-reg-jana', registeredAt: '2026-11-10T15:00:00Z' },
  { attendee: 'an', event: 'webinar', status: 'CONFIRMED', paymentStatus: 'NOT_REQUIRED', registeredAt: '2026-11-11T09:00:00Z' },
  { attendee: 'kobe', event: 'bbq', ticketType: 'bbq-volwassene', status: 'ATTENDED', paymentStatus: 'PAID', amount: 20, payment: 'p-reg-kobe', registeredAt: '2026-06-15T10:00:00Z' },
  { attendee: 'lotte', event: 'bbq', ticketType: 'bbq-volwassene', status: 'NO_SHOW', paymentStatus: 'PAID', amount: 20, payment: 'p-reg-lotte', registeredAt: '2026-06-18T10:00:00Z' },
  { attendee: 'dries', company: 'garage', event: 'quiz', ticketType: 'quiz-ploeg', status: 'ATTENDED', paymentStatus: 'PAID', amount: 40, payment: 'p-reg-quiz', registeredAt: '2026-10-01T20:10:00Z', remarks: 'Ploeg "Garage Desmet"', answers: { Ploegnaam: 'De Piston Pistons' } },
];

const DONATIONS = [
  { donor: 'an', amount: 10, status: 'RECEIVED', receivedOn: '2026-10-01', recurring: 'r-an', campaign: 'werking', payment: 'p-don-an-okt' },
  { donor: 'an', amount: 10, status: 'RECEIVED', receivedOn: '2026-11-01', recurring: 'r-an', campaign: 'werking', payment: 'p-don-an-nov' },
  { donor: 'bram', amount: 25, status: 'RECEIVED', receivedOn: '2026-11-01', recurring: 'r-bram', campaign: 'bus', payment: 'p-don-bram-nov' },
  { donor: 'emma', amount: 15, status: 'RECEIVED', receivedOn: '2026-11-01', recurring: 'r-emma', campaign: 'huiswerk', payment: 'p-don-emma-nov' },
  { donor: 'ilias', amount: 20, status: 'RECEIVED', receivedOn: '2026-11-01', recurring: 'r-ilias', campaign: 'huiswerk', payment: 'p-don-ilias-nov' },
  { donor: 'jana', amount: 12, status: 'FAILED', recurring: 'r-jana', campaign: 'werking', payment: 'p-don-jana-nov', note: 'Domiciliëring geweigerd door de bank.' },
  { donor: 'charlotte', amount: 100, status: 'RECEIVED', receivedOn: '2026-11-03', campaign: 'eindejaar', payment: 'p-don-charlotte', isTaxDeductible: true, note: 'Ter nagedachtenis van mijn grootmoeder.' },
  { donor: 'gilles', amount: 30, status: 'RECEIVED', receivedOn: '2026-08-02', campaign: 'overstromingen', payment: 'p-don-gilles', isAnonymous: true },
  { company: 'brouwerij', amount: 1000, status: 'RECEIVED', receivedOn: '2026-10-20', campaign: 'bus', payment: 'p-don-brouwerij', isTaxDeductible: true },
  { company: 'bouw', amount: 2500, status: 'PLEDGED', campaign: 'bus', note: 'Toegezegd op het benefietdiner, betaling in januari.' },
  { donor: 'kobe', amount: 50, status: 'PENDING', campaign: 'kerstpakketten' },
  { donor: 'lotte', amount: 40, status: 'REFUNDED', receivedOn: '2026-07-12', campaign: 'zomerkampen', isTaxDeductible: true, note: 'Dubbel betaald, één keer terugbetaald.' },
  { donor: 'hanne', amount: 250, status: 'RECEIVED', receivedOn: '2026-09-15', campaign: 'zomerkampen', isTaxDeductible: true },
  { donor: 'dries', amount: 5000, status: 'PLEDGED', campaign: 'legaten', note: 'Opgenomen in testament, info via notaris.' },
];

const ORDERS = [
  { number: 'BEST-2026-001', customer: 'an', status: 'COMPLETED', orderedAt: '2026-10-10T09:55:00Z', deliveryMethod: 'PICKUP', payment: 'p-ord-1', lines: [['tshirt', 1], ['mok', 1]] },
  { number: 'BEST-2026-002', customer: 'bram', status: 'SHIPPED', orderedAt: '2026-11-04T17:58:00Z', deliveryMethod: 'SHIPPING', payment: 'p-ord-2', lines: [['kerstpakket', 2]] },
  { number: 'BEST-2026-003', customer: 'charlotte', status: 'PAID', orderedAt: '2026-11-06T09:25:00Z', deliveryMethod: 'SHIPPING', payment: 'p-ord-3', lines: [['kalender', 2]] },
  { number: 'BEST-2026-004', customer: 'femke', status: 'OPEN', orderedAt: '2026-11-07T20:00:00Z', deliveryMethod: 'PICKUP', payment: 'p-ord-4', lines: [['kaarten', 2]] },
  { number: 'BEST-2026-005', customer: 'gilles', status: 'CANCELLED', orderedAt: '2026-11-07T21:00:00Z', deliveryMethod: 'PICKUP', lines: [['pin', 3], ['tas', 1]], note: 'Klant annuleerde voor betaling.' },
  { number: 'BEST-2026-006', customer: 'hanne', status: 'COMPLETED', orderedAt: '2026-11-08T12:55:00Z', deliveryMethod: 'DIGITAL', payment: 'p-ord-6', lines: [['bon', 1]] },
  { number: 'BEST-2026-007', company: 'koffie', status: 'PAID', orderedAt: '2026-11-09T10:00:00Z', deliveryMethod: 'SHIPPING', payment: 'p-ord-7', lines: [['kerstpakket', 10]], note: 'Kerstgeschenk voor het personeel.' },
  { number: 'BEST-2026-008', customer: 'kobe', status: 'REFUNDED', orderedAt: '2026-09-15T10:55:00Z', deliveryMethod: 'SHIPPING', payment: 'p-ord-8', lines: [['tshirt', 1]], note: 'Verkeerde maat, geld teruggestort.' },
  { number: 'BEST-2026-009', customer: 'lotte', status: 'COMPLETED', orderedAt: '2026-06-27T18:55:00Z', deliveryMethod: 'PICKUP', payment: 'p-ord-9', lines: [['kalender', 1], ['pin', 2]] },
  { number: 'BEST-2026-010', customer: 'jana', status: 'OPEN', orderedAt: '2026-11-12T22:00:00Z', deliveryMethod: 'SHIPPING', lines: [['boek', 1], ['tas', 2]] },
];

const TASKS = [
  { title: 'Dries herinneren aan betaling benefietdiner', status: 'TODO', dueAt: '2026-11-20T09:00:00Z', target: ['person', 'dries'] },
  { title: 'Tafelschikking benefietdiner opmaken', status: 'IN_PROGRESS', dueAt: '2026-12-01T17:00:00Z', target: ['organizedEvent', 'diner'] },
  { title: 'Fiscale attesten 2026 voorbereiden', status: 'TODO', dueAt: '2027-02-15T17:00:00Z', target: ['campaign', 'eindejaar'] },
  { title: 'Jana bellen over geweigerde domiciliëring', status: 'TODO', dueAt: '2026-11-18T10:00:00Z', target: ['person', 'jana'] },
  { title: 'Bouwbedrijf Verhaegen bedanken voor toezegging', status: 'DONE', dueAt: '2026-12-08T10:00:00Z', target: ['company', 'bouw'] },
  { title: 'Kerstpakketten voor Koffiebranderij Mokka verzenden', status: 'TODO', dueAt: '2026-12-10T12:00:00Z', target: ['company', 'koffie'] },
  { title: 'Wachtlijst vrijwilligersavond opvolgen', status: 'TODO', dueAt: '2026-11-25T12:00:00Z', target: ['organizedEvent', 'vrijwilligers'] },
  { title: 'Bijbestellen drinkflessen', status: 'TODO', dueAt: '2026-12-31T12:00:00Z', target: ['product', 'fles'] },
  { title: 'Parcours sponsorloop vastleggen', status: 'IN_PROGRESS', dueAt: '2027-01-31T12:00:00Z', target: ['organizedEvent', 'sponsorloop'] },
  { title: 'Uitnodiging algemene vergadering versturen', status: 'TODO', dueAt: '2027-02-01T12:00:00Z', target: ['organizedEvent', 'av'] },
];

const NOTES = [
  { title: 'Gesprek met An over vrijwilligerswerk', body: 'An wil graag helpen op de kerstmarkt, liefst in de namiddag.', target: ['person', 'an'] },
  { title: 'Feedback zomerbarbecue', body: 'Te weinig vegetarische opties. Volgend jaar ook een veggieburger voorzien.', target: ['organizedEvent', 'bbq'] },
  { title: 'Sponsorgesprek Brouwerij De Kanunnik', body: 'Bereid om de bus mee te financieren. Wil logo op de bus.', target: ['company', 'brouwerij'] },
  { title: 'Legaat Dries Jacobs', body: 'Notaris neemt contact op na overlijden. Bedrag is een schatting.', target: ['person', 'dries'] },
  { title: 'Evaluatie noodhulpcampagne', body: 'Doel niet gehaald, maar veel nieuwe schenkers. Opvolgen in de eindejaarsactie.', target: ['campaign', 'overstromingen'] },
  { title: 'Stand van zaken bus', body: 'Offerte ontvangen: 38 500 euro voor een tweedehands minibus met lift.', target: ['campaign', 'bus'] },
  { title: 'Allergieën benefietdiner', body: 'Traiteur is op de hoogte van glutenvrij en lactosevrij voor Charlotte Maes.', target: ['organizedEvent', 'diner'] },
  { title: 'Kalender 2027 bijna uitverkocht', body: 'Nog 150 stuks na de eerste week, drukkerij kan bijdrukken.', target: ['product', 'kalender'] },
  { title: 'Samenwerking IT-bureau Nexa', body: 'Nexa schenkt elk kwartaal en wil vrijwilligers leveren voor de huiswerkbegeleiding.', target: ['company', 'nexa'] },
  { title: 'Terugbetaling Emma Willems', body: 'Terugbetaling van het benefietdiner gebeurd via Mollie op 9 november.', target: ['person', 'emma'] },
];

// ------------------------------------------------------------- helpers

const createMany = async (mutation, inputType, data) => {
  if (data.length === 0) return [];
  const result = await graphql(
    `mutation ($data: [${inputType}!]!) { ${mutation}(data: $data) { id } }`,
    { data },
  );
  return result[mutation].map((record) => record.id);
};

const createKeyed = async (mutation, inputType, items, toInput) => {
  const ids = await createMany(mutation, inputType, items.map(toInput));
  return Object.fromEntries(items.map((item, index) => [item.key, ids[index]]));
};

const fullName = (key) => {
  const person = PEOPLE.find((p) => p.key === key);
  return `${person.firstName} ${person.lastName}`;
};
const companyName = (key) => COMPANIES.find((c) => c.key === key).name;
const eventName = (key) => EVENTS.find((e) => e.key === key).name;
const productOf = (key) => PRODUCTS.find((p) => p.key === key);

const paymentName = (index) => `BET-2026-${String(index + 1).padStart(3, '0')}`;
const registrationName = (r) => `${fullName(r.attendee)} – ${eventName(r.event)}`;
const donationName = (d) => {
  const who = d.donor ? fullName(d.donor) : companyName(d.company);
  return `${who} – ${d.amount} euro${d.receivedOn ? ` (${d.receivedOn})` : ''}`;
};
const recurringName = (r) => {
  const who = r.donor ? fullName(r.donor) : companyName(r.company);
  const frequency = { MONTHLY: 'per maand', QUARTERLY: 'per kwartaal', YEARLY: 'per jaar' }[r.frequency];
  return `${who} – ${r.amount} euro ${frequency}`;
};
const orderLines = () =>
  ORDERS.flatMap((order) =>
    order.lines.map(([product, quantity]) => ({ order, product, quantity })),
  );
const orderLineName = (line) => `${line.order.number} – ${productOf(line.product).name}`;
const orderTotal = (order) =>
  order.lines.reduce((sum, [product, quantity]) => sum + productOf(product).price * quantity, 0);

// A workspace workflow may link new people to a company based on their
// email domain, creating an "example.org" company for the demo people.
// Wait for it to settle, then restore the intended companies and remove
// that extra company.
const DEMO_EMAIL_DOMAIN = 'example.org';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findEmailDomainCompanies = async () => {
  const result = await graphql(
    `query ($domains: [String!]) { companies(filter: { domainName: { primaryLinkUrl: { in: $domains } } }) { edges { node { id } } } }`,
    { domains: [DEMO_EMAIL_DOMAIN, `https://${DEMO_EMAIL_DOMAIN}`, `https://www.${DEMO_EMAIL_DOMAIN}`] },
  );
  return result.companies.edges.map((edge) => edge.node.id);
};

const restoreCompanies = async (people, companies) => {
  let previous = -1;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await sleep(3000);
    const result = await graphql(
      `query ($ids: [UUID!]) { people(filter: { id: { in: $ids } }) { edges { node { companyId } } } }`,
      { ids: Object.values(people) },
    );
    const signature = result.people.edges.map((edge) => edge.node.companyId).join();
    if (signature === previous) break;
    previous = signature;
  }

  for (const person of PEOPLE) {
    await graphql(`mutation ($id: UUID!, $data: PersonUpdateInput!) { updatePerson(id: $id, data: $data) { id } }`, {
      id: people[person.key],
      data: { companyId: person.company ? companies[person.company] : null },
    });
  }

  for (const id of await findEmailDomainCompanies()) {
    await graphql(`mutation ($id: UUID!) { destroyCompany(id: $id) { id } }`, { id });
  }
};

// --------------------------------------------------------------- clean

const clean = async () => {
  // Deleting an event also deletes its ticket types and registrations,
  // and deleting an order also deletes its order lines.
  const byName = [
    ['destroyOrders', 'OrderFilterInput', ORDERS.map((o) => o.number)],
    ['destroyRegistrations', 'RegistrationFilterInput', REGISTRATIONS.map(registrationName)],
    ['destroyOrganizedEvents', 'OrganizedEventFilterInput', EVENTS.map((e) => e.name)],
    ['destroyDonations', 'DonationFilterInput', DONATIONS.map(donationName)],
    ['destroyRecurringDonations', 'RecurringDonationFilterInput', RECURRING_DONATIONS.map(recurringName)],
    ['destroyCampaigns', 'CampaignFilterInput', CAMPAIGNS.map((c) => c.name)],
    ['destroyProducts', 'ProductFilterInput', PRODUCTS.map((p) => p.name)],
    ['destroyPayments', 'PaymentFilterInput', PAYMENTS.map((_, index) => paymentName(index))],
  ];

  for (const [mutation, filterType, names] of byName) {
    const result = await graphql(
      `mutation ($filter: ${filterType}!) { ${mutation}(filter: $filter) { id } }`,
      { filter: { name: { in: names } } },
    );
    console.log(`${mutation}: ${result[mutation].length}`);
  }

  for (const [mutation, filterType, titles] of [
    ['destroyTasks', 'TaskFilterInput', TASKS.map((t) => t.title)],
    ['destroyNotes', 'NoteFilterInput', NOTES.map((n) => n.title)],
  ]) {
    const result = await graphql(
      `mutation ($filter: ${filterType}!) { ${mutation}(filter: $filter) { id } }`,
      { filter: { title: { in: titles } } },
    );
    console.log(`${mutation}: ${result[mutation].length}`);
  }

  const people = await graphql(
    `mutation { destroyPeople(filter: { emails: { primaryEmail: { in: ${JSON.stringify(PEOPLE.map((p) => p.email))} } } }) { id } }`,
  );
  console.log(`destroyPeople: ${people.destroyPeople.length}`);

  const companies = await graphql(
    `mutation { destroyCompanies(filter: { domainName: { primaryLinkUrl: { in: ${JSON.stringify(COMPANIES.map((c) => c.domain))} } } }) { id } }`,
  );
  console.log(`destroyCompanies: ${companies.destroyCompanies.length}`);

  for (const id of await findEmailDomainCompanies()) {
    await graphql(`mutation ($id: UUID!) { destroyCompany(id: $id) { id } }`, { id });
  }
};

// ---------------------------------------------------------------- seed

const seed = async () => {
  const existing = await graphql(
    `query ($emails: [String!], $domains: [String!]) {
      people(filter: { emails: { primaryEmail: { in: $emails } } }) { totalCount }
      companies(filter: { domainName: { primaryLinkUrl: { in: $domains } } }) { totalCount }
    }`,
    { emails: PEOPLE.map((p) => p.email), domains: COMPANIES.map((c) => c.domain) },
  );

  if (existing.people.totalCount > 0 || existing.companies.totalCount > 0) {
    console.error('Demo data already exists. Run with --clean first.');
    process.exit(1);
  }

  const companies = await createKeyed('createCompanies', 'CompanyCreateInput', COMPANIES, (c) => ({
    name: c.name,
    domainName: { primaryLinkUrl: c.domain },
    address: { addressCity: c.city, addressCountry: 'Belgium' },
  }));

  const people = await createKeyed('createPeople', 'PersonCreateInput', PEOPLE, (p) => ({
    name: { firstName: p.firstName, lastName: p.lastName },
    emails: { primaryEmail: p.email },
    companyId: p.company ? companies[p.company] : null,
  }));

  await restoreCompanies(people, companies);

  const events = await createKeyed('createOrganizedEvents', 'OrganizedEventCreateInput', EVENTS, (e) => {
    return { ...omit(e, 'key', 'price'), ...(e.price ? { price: eur(e.price) } : {}) };
  });

  const ticketTypes = await createKeyed('createTicketTypes', 'TicketTypeCreateInput', TICKET_TYPES, (t) => ({
    name: t.name,
    price: eur(t.price),
    capacity: t.capacity ?? null,
    isAvailable: t.isAvailable ?? true,
    organizedEventId: events[t.event],
  }));

  const campaigns = await createKeyed('createCampaigns', 'CampaignCreateInput', CAMPAIGNS, (c) => {
    return { ...omit(c, 'key', 'goal'), ...(c.goal ? { goal: eur(c.goal) } : {}) };
  });

  const products = await createKeyed('createProducts', 'ProductCreateInput', PRODUCTS, (p) => {
    return { ...omit(p, 'key', 'price'), price: eur(p.price) };
  });

  const payments = await createKeyed(
    'createPayments',
    'PaymentCreateInput',
    PAYMENTS.map((p, index) => ({ ...p, name: paymentName(index) })),
    (p) => ({
      name: p.name,
      amount: eur(p.amount),
      status: p.status,
      method: p.method,
      provider: p.provider,
      providerPaymentId: p.provider === 'MOLLIE' ? `tr_demo${p.name.slice(-3)}` : null,
      paidAt: p.paidAt ?? null,
      payerId: p.payer ? people[p.payer] : null,
    }),
  );

  await createMany(
    'createRegistrations',
    'RegistrationCreateInput',
    REGISTRATIONS.map((r) => ({
      name: registrationName(r),
      status: r.status,
      paymentStatus: r.paymentStatus,
      amount: eur(r.amount ?? 0),
      registeredAt: r.registeredAt,
      dietaryRequirements: r.dietaryRequirements ?? [],
      accessibilityNeeds: r.accessibilityNeeds ?? null,
      remarks: r.remarks ?? null,
      answers: r.answers ?? null,
      organizedEventId: events[r.event],
      ticketTypeId: r.ticketType ? ticketTypes[r.ticketType] : null,
      attendeeId: people[r.attendee],
      bookedById: people[r.bookedBy ?? r.attendee],
      companyId: r.company ? companies[r.company] : null,
      paymentId: r.payment ? payments[r.payment] : null,
    })),
  );

  const recurring = await createKeyed('createRecurringDonations', 'RecurringDonationCreateInput', RECURRING_DONATIONS, (r) => ({
    name: recurringName(r),
    amount: eur(r.amount),
    frequency: r.frequency,
    status: r.status,
    startsOn: r.startsOn,
    endsOn: r.endsOn ?? null,
    nextCollectionOn: r.nextCollectionOn ?? null,
    mandateReference: `MNDT-${r.key.slice(2).toUpperCase()}`,
    donorId: r.donor ? people[r.donor] : null,
    companyId: r.company ? companies[r.company] : null,
    campaignId: campaigns[r.campaign],
  }));

  await createMany(
    'createDonations',
    'DonationCreateInput',
    DONATIONS.map((d) => ({
      name: donationName(d),
      amount: eur(d.amount),
      status: d.status,
      receivedOn: d.receivedOn ?? null,
      isTaxDeductible: d.isTaxDeductible ?? false,
      isAnonymous: d.isAnonymous ?? false,
      note: d.note ?? null,
      donorId: d.donor ? people[d.donor] : null,
      companyId: d.company ? companies[d.company] : null,
      campaignId: campaigns[d.campaign],
      recurringDonationId: d.recurring ? recurring[d.recurring] : null,
      paymentId: d.payment ? payments[d.payment] : null,
    })),
  );

  const orderIds = await createMany(
    'createOrders',
    'OrderCreateInput',
    ORDERS.map((o) => {
      const person = o.customer ? PEOPLE.find((p) => p.key === o.customer) : null;
      const company = o.company ? COMPANIES.find((c) => c.key === o.company) : null;
      return {
        name: o.number,
        status: o.status,
        total: eur(orderTotal(o)),
        orderedAt: o.orderedAt,
        deliveryMethod: o.deliveryMethod,
        shippingAddress:
          o.deliveryMethod === 'SHIPPING'
            ? { addressStreet1: 'Voorbeeldstraat 1', addressCity: (person ?? company).city, addressCountry: 'Belgium' }
            : null,
        note: o.note ?? null,
        customerId: person ? people[person.key] : null,
        companyId: company ? companies[company.key] : null,
        paymentId: o.payment ? payments[o.payment] : null,
      };
    }),
  );
  const orders = Object.fromEntries(ORDERS.map((o, index) => [o.number, orderIds[index]]));

  await createMany(
    'createOrderLines',
    'OrderLineCreateInput',
    orderLines().map((line) => {
      const product = productOf(line.product);
      return {
        name: orderLineName(line),
        quantity: line.quantity,
        unitPrice: eur(product.price),
        lineTotal: eur(product.price * line.quantity),
        orderId: orders[line.order.number],
        productId: products[line.product],
      };
    }),
  );

  const targetIds = { person: people, company: companies, organizedEvent: events, campaign: campaigns, product: products };
  const targetField = (object) => `target${capitalize(object)}Id`;

  const taskIds = await createMany(
    'createTasks',
    'TaskCreateInput',
    TASKS.map((t) => ({ title: t.title, status: t.status, dueAt: t.dueAt })),
  );
  await createMany(
    'createTaskTargets',
    'TaskTargetCreateInput',
    TASKS.map((t, index) => ({ taskId: taskIds[index], [targetField(t.target[0])]: targetIds[t.target[0]][t.target[1]] })),
  );

  const noteIds = await createMany(
    'createNotes',
    'NoteCreateInput',
    NOTES.map((n) => ({ title: n.title, bodyV2: { markdown: n.body } })),
  );
  await createMany(
    'createNoteTargets',
    'NoteTargetCreateInput',
    NOTES.map((n, index) => ({ noteId: noteIds[index], [targetField(n.target[0])]: targetIds[n.target[0]][n.target[1]] })),
  );

  console.log(
    [
      `${COMPANIES.length} companies`,
      `${PEOPLE.length} people`,
      `${EVENTS.length} events`,
      `${TICKET_TYPES.length} ticket types`,
      `${REGISTRATIONS.length} registrations`,
      `${CAMPAIGNS.length} campaigns`,
      `${RECURRING_DONATIONS.length} recurring donations`,
      `${DONATIONS.length} donations`,
      `${PRODUCTS.length} products`,
      `${ORDERS.length} orders`,
      `${orderLines().length} order lines`,
      `${PAYMENTS.length} payments`,
      `${TASKS.length} tasks`,
      `${NOTES.length} notes`,
    ].join('\n'),
  );
};

await (process.argv.includes('--clean') ? clean() : seed());
