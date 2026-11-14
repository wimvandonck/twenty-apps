# Ontwerp: consents-app

Datum: 14 november 2026
Status: ter goedkeuring

# Waarom

Een organisatie mag iemand alleen marketingmails sturen met aantoonbare toestemming. Twenty houdt die toestemming niet bij: een lijst bepaalt wie een mail krijgt, en afmeldonderwerpen regelen alleen wie zich afmeldt. Twenty's eigen richtlijnen zeggen dat je zelf moet bijhouden "wanneer en hoe" iemand toestemming gaf.

Deze app houdt dat bij. Ze maakt een onderscheid tussen twee dingen:

- **Consent**, de wettelijke toestemming om iemand een soort e-mail te sturen, zoals "Nieuwsbrief". Opt-in en opt-out, met bewijs.
- **Lijst**, een voorkeur binnen die toestemming, zoals "Nieuwsbrief over klimaat". Soms vallen ze samen ("Nieuwsbrief" en "Nieuwsbrief"), soms niet.

De app is de basis voor drie latere projecten: consents en lijstkeuze in de formulierenbouwer, de Brevo-synchronisatie en betalingen via Stripe. Ze moet zonder Brevo volledig werken.

# Doelen

- Per persoon en per e-mailtype de huidige consentstatus, te filteren in Twenty ("wie heeft consent voor de nieuwsbrief?").
- Een volledig bewijsspoor van elke wijziging: wat, wanneer, via welke bron, met welke getoonde tekst, vanaf welk IP-adres.
- Double opt-in voor consents die via een publiek formulier binnenkomen, met een bevestigingsmail.
- Een publieke voorkeurenpagina waarop iemand zelf consents aan- en uitzet en zichtbare lijsten kiest.
- Lijsten kunnen een e-mailtype vereisen.

# Geen doelen

- Formulieren aanpassen. Dat is het volgende project. Deze app levert wel de objecten en de route die de formulierenbouwer zal gebruiken.
- Synchronisatie met Brevo-contacten, -attributen en -lijsten. Dat wordt een aparte, optionele app.
- Twenty's afmeldonderwerpen. Twenty-campagnes worden alleen voor interne mailings gebruikt (zoals de uitnodiging voor de algemene vergadering), en die steunen op lidmaatschap, niet op marketingtoestemming.
- Marketingmails versturen. De app verstuurt alleen bevestigingsmails.

# Wat nooit mag gebeuren

- Een consent die op "gegeven" staat zonder wijziging die dat bewijst.
- Een consent uit een publiek formulier die "gegeven" wordt zonder klik op de bevestigingslink.
- Een voorkeurenpagina die iemand anders dan de betrokkene kan openen of wijzigen.
- Een bevestigingsmail die stil verloren gaat omdat een daglimiet bereikt is.

# Gekozen aanpak

Overwogen:

| Aanpak | Waarom wel of niet |
| --- | --- |
| A. Alleen een historiek: elke wijziging een record, de laatste telt | Zuiver bewijs, maar Twenty kan niet filteren op "laatste record per persoon". Sync en voorkeurenpagina moeten telkens de hele historiek lezen. |
| **B. Huidige stand plus historiek** | Gekozen. Eén consent per persoon per e-mailtype met de huidige status, plus een wijziging per gebeurtenis als bewijs. Filteren in Twenty werkt gewoon. |
| C. Een vinkje per e-mailtype op de persoon | Elk nieuw e-mailtype vraagt een nieuw veld, en bewijs bijhouden kan niet. |

Plaats: een **aparte app `apps/consents`**, los van de nonprofit-app, zodat ook organisaties zonder evenementen of donaties ze kunnen gebruiken. Andere apps spreken de objecten aan via de API op hun naam, en werken verder als de app ontbreekt.

Verzending van bevestigingsmails: via **Brevo transactioneel**, achter een kleine verzendtussenlaag zodat een andere dienst later kan worden toegevoegd. Zonder Brevo-sleutel verstuurt de app niets, maar zet ze de bevestigingslink op de consent. Een Twenty-workflow met de actie "Send Email" kan de mail dan via een gekoppelde mailbox versturen. Overwogen en afgevallen: Resend en Mailjet (extra account terwijl Brevo er al is), ZeptoMail en Amazon SES (betalend of omslachtig), Twenty-campagnes (bedoeld voor bulk, verplichte afmeldvoettekst, bèta) en een eigen mailserver (bezorging en beheer).

# Datamodel

## E-mailtype (`emailType`)

Een soort e-mail waarvoor toestemming nodig is.

| Veld | Type | Opmerking |
| --- | --- | --- |
| `name` | tekst | "Nieuwsbrief". Getoond op de voorkeurenpagina. |
| `description` | tekst | Uitleg op de voorkeurenpagina. |
| `consentText` | tekst | Standaardtekst naast het vinkje in formulieren. Wordt bij elke wijziging bewaard zoals getoond. |
| `isActive` | boolean | Inactieve types verschijnen niet op de voorkeurenpagina en in formulieren. Bestaande consents blijven. |
| `consents` | relatie | Naar Consent. |
| `messageLists` | relatie | Naar de lijsten die dit type vereisen. |

## Consent (`consent`)

Eén per persoon per e-mailtype. De app maakt het aan bij de eerste wijziging en houdt de status gelijk met de laatste wijziging.

| Veld | Type | Opmerking |
| --- | --- | --- |
| `name` | tekst | "Ann Peeters – Nieuwsbrief", gezet door de app. |
| `person` | relatie | Naar Persoon. Verwijderen van de persoon verwijdert de consent. |
| `emailType` | relatie | Naar E-mailtype. |
| `status` | select | `PENDING` (wacht op bevestiging), `GRANTED`, `WITHDRAWN`. |
| `grantedAt`, `withdrawnAt` | datum en tijd | Laatste keer gegeven of ingetrokken. |
| `confirmationUrl` | tekst | Bevestigingslink zolang de status `PENDING` is, anders leeg. |
| `confirmationSentAt` | datum en tijd | Leeg zolang de bevestigingsmail niet verstuurd is. |
| `changes` | relatie | Naar Consentwijziging. |

Een persoon en een e-mailtype samen zijn uniek. De app bewaakt dat bij het aanmaken, want Twenty kent geen samengestelde unieke sleutel.

## Consentwijziging (`consentChange`)

Het bewijs. Records worden nooit gewijzigd of verwijderd door de app.

| Veld | Type | Opmerking |
| --- | --- | --- |
| `consent` | relatie | Naar Consent. |
| `action` | select | `REQUESTED` (opt-in via formulier, wacht op bevestiging), `CONFIRMED` (bevestigingslink aangeklikt), `GRANTED` (direct gegeven: manueel, import, voorkeurenpagina), `WITHDRAWN`. |
| `source` | select | `FORM`, `PREFERENCE_PAGE`, `MANUAL`, `IMPORT`, `API`, `BREVO`. |
| `occurredAt` | datum en tijd | |
| `shownText` | tekst | De tekst zoals de persoon die zag. |
| `formName` | tekst | Naam van het formulier, bij bron `FORM`. |
| `ipAddress`, `userAgent` | tekst | Van het publieke verzoek, als dat er is. |
| `language` | tekst | Taal van het formulier of de pagina, gebruikt voor de bevestigingsmail. |
| `note` | tekst | Vrij, bijvoorbeeld "mondeling op de algemene vergadering". |

Statusregels: `REQUESTED` zet `PENDING`, maar alleen als de consent nog niet `GRANTED` is (wie al toestemming gaf, verliest die niet door opnieuw een formulier in te vullen). `CONFIRMED` en `GRANTED` zetten `GRANTED`. `WITHDRAWN` zet `WITHDRAWN`.

## Uitbreidingen op bestaande objecten

- **Lijst (`messageList`):** `showOnPreferencePage` (boolean, standaard uit) en `requiredEmailType` (relatie naar E-mailtype, optioneel).
- **Persoon:** `consents` (relatie) en `preferencesUrl` (tekst, de persoonlijke link naar de voorkeurenpagina, door de app gezet zodat Brevo- en Twenty-mails ze als variabele kunnen invoegen).

# Gedrag

## Een consent vastleggen

Iedereen (de formulierenbouwer, een medewerker, een import) legt een wijziging vast door een **Consentwijziging** aan te maken. Een databasetrigger op nieuwe wijzigingen zoekt of maakt de bijbehorende Consent en zet de status volgens de regels hierboven.

Maakt de aanroeper een wijziging zonder consent maar met persoon en e-mailtype? Dat kan niet met gewone velden. Daarom biedt de app ook een beveiligde route `POST /consents/changes` (met API-sleutel) die `personId`, `emailTypeId`, `action`, `source` en de bewijsvelden aanneemt, de Consent zoekt of aanmaakt en de wijziging eraan hangt. De formulierenbouwer gebruikt die route.

Een medewerker die in Twenty zelf de `status` van een Consent aanpast, krijgt automatisch een wijziging met bron `MANUAL`. De trigger op Consent vergelijkt de nieuwe status met die van de laatste wijziging en logt alleen als ze verschillen, zodat er geen lus ontstaat.

## Double opt-in

1. Een wijziging `REQUESTED` zet de consent op `PENDING` en maakt een bevestigingslink: `GET /consents/confirm?token=...`. Het token is een HMAC-handtekening over de id van de wijziging en een vervaldatum van 30 dagen, met het geheim `CONSENT_SIGNING_SECRET`.
2. De link komt in `confirmationUrl`. Staat er een Brevo-sleutel in de instellingen, dan verstuurt de app de bevestigingsmail en vult ze `confirmationSentAt`.
3. Meerdere e-mailtypes uit één formulierinzending geven één mail met één link die ze samen bevestigt.
4. Een klik op de link maakt een wijziging `CONFIRMED` met IP-adres en user agent, en toont een bedankpagina met de link naar de voorkeurenpagina.
5. Een verlopen of ongeldige link toont een uitlegpagina. Het opnieuw invullen van het formulier stuurt een nieuwe mail.

## Bevestigingsmail versturen

- Verzendtussenlaag met één functie: `sendEmail({ to, subject, html, text })`. De eerste en voorlopig enige implementatie is Brevo (`POST https://api.brevo.com/v3/smtp/email`).
- Instellingen (applicatievariabelen): `BREVO_API_KEY` (geheim, optioneel), `SENDER_EMAIL`, `SENDER_NAME`, `ORGANIZATION_NAME`.
- Faalt het versturen (daglimiet, tijdelijke fout), dan blijft `confirmationSentAt` leeg. Een cron-functie probeert elk uur opnieuw voor consents die `PENDING` zijn, een `confirmationUrl` hebben en nog geen `confirmationSentAt`, zolang de link geldig is.
- Taal: de mail en de publieke pagina's bestaan in het Nederlands, Frans en Engels. Andere talen vallen terug op Engels. De taal komt uit de wijziging, anders uit de browser.

## Voorkeurenpagina

- `GET /consents/preferences?token=...` toont de pagina, `POST` op hetzelfde adres slaat ze op. Het token is een HMAC-handtekening over de id van de persoon, zonder vervaldatum, zodat de link in elke mail kan blijven werken. Het geheim vervangen maakt alle oude links ongeldig.
- **Sectie Toestemming:** elk actief e-mailtype met naam, beschrijving en een schakelaar. Aanzetten geeft een wijziging `GRANTED` met bron `PREFERENCE_PAGE` (de persoon bewees al toegang tot de mailbox via de link), uitzetten geeft `WITHDRAWN`.
- **Sectie Voorkeuren:** de lijsten met `showOnPreferencePage`, gegroepeerd onder het e-mailtype dat ze vereisen, en lijsten zonder vereist type in een eigen groep. Aanvinken maakt een lidmaatschap, uitvinken verwijdert het.
- Staat het vereiste e-mailtype uit, dan zijn de lijsten eronder grijs en niet te wijzigen. Het lidmaatschap blijft bewaard.
- Toont alleen de voornaam van de persoon, geen andere persoonsgegevens.

## Voorkeurenlink op de persoon

Een databasetrigger op aangemaakte personen, en een eenmalige vulling bij installatie voor bestaande personen, zet `preferencesUrl`.

# Beperkingen en risico's

- Een app die velden toevoegt aan `messageList`, een systeemobject, is nog niet getest. In de workspace bestaat al een eigen veld `syncMetBrevo` op dat object, dus het kan. Lukt het niet via de app, dan valt de vereiste-relatie terug op een relatie vanaf E-mailtype en het zichtbaarheidsvinkje op een apart koppelobject.
- Lijsten zijn in Twenty statisch. Een lijst vult zich niet vanzelf op basis van consent. Dynamische doelgroepen horen in Brevo (segmenten).
- Het gratis Brevo-plan deelt 300 mails per dag tussen nieuwsbrieven en bevestigingen. De herhaalpoging per uur vangt overschrijdingen op.
- HTTP-routes van logic functions draaien op het adres van de Twenty-server, niet op het domein van de organisatie.

# Testen

- Unit: tokens maken en controleren (geldig, vervallen, gemanipuleerd), statusregels, groepering op de voorkeurenpagina, HTML van de pagina's en de mail (escaping), Brevo-payload.
- Integratie: het schema installeert in een lokale Twenty, zoals in de andere apps.
- Manueel tegen de workspace: formulierflow nabootsen met de route, mail ontvangen, bevestigen, voorkeuren wijzigen.

# Aan de bouwer

- Exacte API-namen van velden en selectwaarden, iconen, weergaven en de navigatie (een map "Consents" met E-mailtypes en Consents; wijzigingen alleen zichtbaar op de consent).
- Opmaak van de publieke pagina's, in lijn met die van de formulierenbouwer.
- Vertalingen van labels in de 33 talen, zoals in de andere apps.
