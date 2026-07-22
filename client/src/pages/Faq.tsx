import { useI18n } from '../i18n';

// The FAQ is long-form prose about *using the app*, so — like the clinical guide —
// each locale is written out in full rather than squeezed into the key/value dict.
export function Faq() {
  const { locale } = useI18n();
  return (
    <div className="guide" style={{ paddingTop: 22, maxWidth: 760 }}>
      {locale === 'pl' ? <PolishFaq /> : <EnglishFaq />}
    </div>
  );
}

function TOC({ items }: { items: [string, string][] }) {
  return (
    <nav className="card" style={{ padding: '12px 16px', margin: '10px 0 22px' }}>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map(([id, label]) => (
          <li key={id}><a href={`#${id}`}>{label}</a></li>
        ))}
      </ul>
    </nav>
  );
}

function EnglishFaq() {
  return (
    <>
      <h1>How to use FIP Tracker</h1>
      <p className="muted">Everything you need to log your cat, read the trends, print a report for your vet, and share progress — step by step.</p>

      <TOC items={[
        ['why', 'Why use FIP Tracker'],
        ['start', 'Getting started: add your cat'],
        ['daily', 'Adding a daily entry'],
        ['edit', 'Editing or deleting an entry'],
        ['trends', 'Reading the trends'],
        ['blood', 'Adding bloodwork'],
        ['print', 'Printing or saving a PDF for your vet'],
        ['share', 'Sharing a read-only link'],
        ['settings', 'Language, dark mode & treatment plan'],
        ['data', 'Your data, privacy & FIP research'],
        ['medical', 'Is this medical advice?'],
      ]} />

      <h2 id="why">Why use FIP Tracker</h2>
      <p>FIP treatment is a marathon — often 84 days of treatment plus a 12-week watch afterwards — and the single most useful thing a caregiver can do is <strong>track objectively and spot trends early</strong>. A cat can have a good afternoon and a bad night; what actually tells you how things are going is the <em>line over days and weeks</em>: is weight climbing, is the fever settling, is appetite holding?</p>
      <ul>
        <li><strong>See patterns you'd otherwise miss.</strong> Weight gain is one of the clearest signs treatment is working. A recurring fever or weight loss despite eating is an early warning — especially in dry FIP, where bloodwork can look almost normal.</li>
        <li><strong>Never lose your records.</strong> Because you sign in, your data is saved on the server and follows you across your phone, laptop, and any browser — nothing is lost if you clear your cache.</li>
        <li><strong>Make vet visits and group posts easy.</strong> One tap gives you a clean report to print or save as PDF, or a read-only link to share.</li>
      </ul>

      <h2 id="start">Getting started: add your cat</h2>
      <ol>
        <li>On the <strong>My cats</strong> page, click <strong>+ Add a cat</strong>.</li>
        <li>Enter a name. Optionally set sex, birth date, the <strong>FIP form</strong> (wet, dry, ocular, neurological, mixed, or "not yet known"), and the <strong>current phase</strong> (monitoring, treatment, observation, recovered).</li>
        <li>Click <strong>Save</strong>. You'll see a card for your cat — click it to open their dashboard.</li>
      </ol>
      <p>You can change any of this later, and add a full treatment plan (medication, dose, start dates) under the cat's <strong>Settings</strong> tab. The FIP form matters a little: for dry, ocular and neurological cats the app emphasises the clinical signs that matter most for those types.</p>

      <h2 id="daily">Adding a daily entry</h2>
      <p>Open your cat, and on the <strong>Overview</strong> or <strong>Daily log</strong> tab click <strong>+ Add today's log</strong>. Fill in whatever you measured — you never have to fill every field:</p>
      <ul>
        <li><strong>Weight</strong> in grams (e.g. 3200). Use the same scale each time.</li>
        <li><strong>Temperature</strong> in °C. The app flags a fever (above 39.2 °C) and a dangerously high temperature for you.</li>
        <li><strong>Appetite, energy, interest in toys and treats</strong> — tap a number from 0 (none) to 5 (great). Tap it again to clear it.</li>
        <li><strong>Stools</strong> — number per day and a consistency from 1 (hard) to 7 (liquid); <strong>vomiting</strong> count; and whether you <strong>gave medication</strong> (and the dose in mg).</li>
        <li><strong>Symptoms</strong> — tap any that apply, grouped into general, eyes, neurological, and chest/abdomen.</li>
        <li><strong>Notes</strong> — anything you noticed. This is your space; write freely.</li>
      </ul>
      <p>Click <strong>Save entry</strong>. There is one entry per day — if you add another for the same date, it updates that day. Tip: log at roughly the same time each day, especially temperature early in treatment.</p>

      <h2 id="edit">Editing or deleting an entry</h2>
      <ol>
        <li>Go to the <strong>Daily log</strong> tab — it lists every day you've recorded, newest first.</li>
        <li><strong>Click any row</strong> to reopen that day's entry.</li>
        <li>Change anything and click <strong>Save entry</strong>, or click <strong>Delete this entry</strong> to remove that day.</li>
      </ol>
      <p>You can also change the date at the top of the entry form — handy if you're catching up on a day you missed. Bloodwork is edited the same way: click a row in the Bloodwork tab.</p>

      <h2 id="trends">Reading the trends</h2>
      <p>The <strong>Trends</strong> tab is the heart of the app. Each chart plots one thing over time; pick <strong>14 / 30 / 90 days or All</strong> at the top right.</p>
      <ul>
        <li><strong>Weight</strong> — you want this climbing. The dose is set from current weight, so it should rise, never fall, as your cat grows.</li>
        <li><strong>Temperature</strong> — the shaded band is the normal range (38.1–39.2 °C) and the dashed line marks fever, so a spike is obvious at a glance.</li>
        <li><strong>Appetite, energy & interest</strong> — four lines together; watch for sustained dips.</li>
        <li><strong>Stools</strong> — count and consistency.</li>
      </ul>
      <p>Little markers (💊 and 👁) show where treatment and observation began. <strong>Hover or tap</strong> any chart to read the exact values for that day. The Overview tab summarises the headline numbers — latest weight, weight change since the start, latest temperature, and fever days.</p>

      <h2 id="blood">Adding bloodwork</h2>
      <ol>
        <li>Open the <strong>Bloodwork</strong> tab and click <strong>+ Add bloodwork</strong>.</li>
        <li>Set the date the blood was drawn, then type in whatever your lab reported. You don't need every field — even just albumin and globulin is enough for the app to compute the <strong>A:G ratio</strong> automatically.</li>
        <li>Click <strong>Save</strong>.</li>
      </ol>
      <p>The two clearest recovery signals get their own trend charts: the <strong>A:G ratio</strong> (rising toward and past 0.8 is good) and <strong>globulin vs albumin</strong> (they start far apart in FIP and come together as your cat recovers). Reference ranges vary by lab, so read your own lab's numbers alongside these.</p>

      <h2 id="print">Printing or saving a PDF for your vet</h2>
      <p>The report is a clean, one-page summary — key figures, trend charts, bloodwork, and recent log — perfect for a vet visit.</p>
      <ol>
        <li>Open your cat and go to the <strong>Settings</strong> tab.</li>
        <li>Under <strong>Vet report</strong>, click <strong>Open printable report</strong>.</li>
        <li>Click <strong>Print / Save as PDF</strong> at the top of the report.</li>
        <li>Your browser's print window opens. <strong>To save a PDF</strong>, change the "Destination" (Chrome) or "Printer" (Safari/Firefox) to <strong>"Save as PDF"</strong>, then click <strong>Save</strong> and choose where to keep the file. <strong>To print on paper</strong>, pick your printer instead and click <strong>Print</strong>.</li>
      </ol>
      <p>On a phone: after tapping <strong>Print / Save as PDF</strong>, use your phone's share/print sheet — on iPhone, pinch-out the preview or choose "Save to Files"; on Android, choose "Save as PDF". The report follows whichever language you've selected.</p>

      <h2 id="share">Sharing a read-only link</h2>
      <p>A share link lets your vet or an FIP support group see this cat's charts and log <strong>without being able to edit anything</strong> and without signing in.</p>
      <ol>
        <li>Open your cat and go to the <strong>Settings</strong> tab.</li>
        <li>Under <strong>Share a read-only view</strong>, click <strong>Create share link</strong>.</li>
        <li>Click <strong>Copy link</strong> and paste it wherever you like — a message to your vet, a Facebook FIP group, etc.</li>
        <li>Anyone with the link sees a live, read-only view that updates as you keep logging.</li>
      </ol>
      <p><strong>To stop sharing</strong>, come back to the same place and click <strong>Disable link</strong>. The old link immediately stops working; you can always create a fresh one later. Only the specific cat you shared is visible — never your other cats or your account.</p>

      <h2 id="settings">Language, dark mode & treatment plan</h2>
      <ul>
        <li><strong>Language</strong> — switch between English and Polish anytime with the EN/PL selector in the top bar. Signed in, your choice is remembered.</li>
        <li><strong>Dark mode</strong> — the ◐ button in the top bar toggles light/dark; it also follows your device setting by default.</li>
        <li><strong>Treatment plan</strong> — in a cat's Settings you can record the medication, form (injection or oral), dose in mg/kg, and start dates. Enter the injection concentration and the app shows a <strong>dose helper</strong> estimating the daily amount from the latest weight. This is a convenience calculator only — always confirm the dose with your vet or FIP group.</li>
      </ul>

      <h2 id="data">Your data, privacy & FIP research</h2>
      <p>Your records are stored so the app can work for you across your devices — that's the whole reason for signing in. <strong>We do not sell your data and we do not mine it.</strong> Each account only ever sees its own cats.</p>
      <p><strong>Helping FIP research is entirely optional.</strong> When you first sign in you'll see a short prompt, and there's a switch any time under <strong>Account</strong> (the icon in the top bar). If — and only if — you opt in, your cat's <strong>de-identified</strong> records (the measurements and trends, with no name, email, or anything that identifies you or your cat) may be shared with FIP researchers to help study the disease and improve treatment for other cats. FIP research is active and the data caregivers gather at home is genuinely valuable to it. You can turn this on or off whenever you like, and it never changes how the app works for you. If you leave it off, nothing is ever shared.</p>

      <h2 id="medical">Is this medical advice?</h2>
      <p><strong>No.</strong> FIP treatment is a fast-moving, largely off-label field. FIP Tracker is a tool to help you and your vet <em>see trends</em> — it does not diagnose, prescribe, or replace veterinary care. Treatment decisions belong to your vet and an experienced FIP support group. The reference ranges and dosing notes are starting points to help you read your own cat's numbers, not instructions. For the clinical background, see the <a href="/guide">FIP guide</a>.</p>
    </>
  );
}

function PolishFaq() {
  return (
    <>
      <h1>Jak używać FIP Tracker</h1>
      <p className="muted">Wszystko, czego potrzebujesz, aby zapisywać dane kota, czytać trendy, wydrukować raport dla weterynarza i dzielić się postępami — krok po kroku.</p>

      <TOC items={[
        ['why', 'Po co używać FIP Tracker'],
        ['start', 'Na start: dodaj kota'],
        ['daily', 'Dodawanie dziennego wpisu'],
        ['edit', 'Edytowanie i usuwanie wpisu'],
        ['trends', 'Czytanie trendów'],
        ['blood', 'Dodawanie wyników krwi'],
        ['print', 'Drukowanie lub zapis PDF dla weterynarza'],
        ['share', 'Udostępnianie linku (tylko do odczytu)'],
        ['settings', 'Język, tryb ciemny i plan leczenia'],
        ['data', 'Twoje dane, prywatność i badania nad FIP'],
        ['medical', 'Czy to porada medyczna?'],
      ]} />

      <h2 id="why">Po co używać FIP Tracker</h2>
      <p>Leczenie FIP to maraton — często 84 dni terapii plus 12 tygodni obserwacji — a najważniejsze, co może zrobić opiekun, to <strong>obiektywnie śledzić dane i wcześnie wychwytywać trendy</strong>. Kot może mieć dobre popołudnie i złą noc; to, co naprawdę mówi, jak idzie leczenie, to <em>linia na przestrzeni dni i tygodni</em>: czy waga rośnie, czy gorączka ustępuje, czy apetyt się utrzymuje?</p>
      <ul>
        <li><strong>Zobacz wzorce, które inaczej by umknęły.</strong> Przyrost wagi to jeden z najczytelniejszych znaków, że leczenie działa. Nawracająca gorączka lub spadek wagi mimo jedzenia to wczesne ostrzeżenie — zwłaszcza w suchej FIP, gdzie wyniki krwi mogą wyglądać niemal prawidłowo.</li>
        <li><strong>Nigdy nie strać zapisów.</strong> Dzięki logowaniu Twoje dane są zapisane na serwerze i podążają za Tobą między telefonem, laptopem i dowolną przeglądarką — nic nie zniknie po wyczyszczeniu pamięci.</li>
        <li><strong>Ułatw wizyty u weterynarza i wpisy w grupach.</strong> Jedno kliknięcie daje przejrzysty raport do druku lub zapisu jako PDF, albo link do odczytu do udostępnienia.</li>
      </ul>

      <h2 id="start">Na start: dodaj kota</h2>
      <ol>
        <li>Na stronie <strong>Moje koty</strong> kliknij <strong>+ Dodaj kota</strong>.</li>
        <li>Wpisz imię. Opcjonalnie ustaw płeć, datę urodzenia, <strong>postać FIP</strong> (wysiękowa, sucha, oczna, neurologiczna, mieszana lub „jeszcze nieznana”) oraz <strong>aktualny etap</strong> (obserwacja, leczenie, kontrola po leczeniu, wyleczony).</li>
        <li>Kliknij <strong>Zapisz</strong>. Pojawi się karta kota — kliknij ją, aby otworzyć panel.</li>
      </ol>
      <p>Wszystko to możesz później zmienić i dodać pełny plan leczenia (lek, dawka, daty) w zakładce <strong>Ustawienia</strong> kota. Postać FIP ma znaczenie: dla kotów z suchą, oczną i neurologiczną FIP aplikacja podkreśla objawy kliniczne najważniejsze dla tych typów.</p>

      <h2 id="daily">Dodawanie dziennego wpisu</h2>
      <p>Otwórz kota i w zakładce <strong>Przegląd</strong> lub <strong>Dziennik</strong> kliknij <strong>+ Dodaj dzisiejszy wpis</strong>. Uzupełnij to, co zmierzyłaś/eś — nigdy nie musisz wypełniać każdego pola:</p>
      <ul>
        <li><strong>Waga</strong> w gramach (np. 3200). Za każdym razem używaj tej samej wagi.</li>
        <li><strong>Temperatura</strong> w °C. Aplikacja oznaczy gorączkę (powyżej 39,2 °C) i niebezpiecznie wysoką temperaturę.</li>
        <li><strong>Apetyt, energia, zainteresowanie zabawkami i przysmakami</strong> — dotknij liczby od 0 (brak) do 5 (świetnie). Dotknij ponownie, aby wyczyścić.</li>
        <li><strong>Stolce</strong> — liczba dziennie i konsystencja od 1 (twarda) do 7 (płynna); liczba <strong>wymiotów</strong>; oraz czy <strong>podano lek</strong> (i dawka w mg).</li>
        <li><strong>Objawy</strong> — dotknij tych, które pasują, pogrupowanych na ogólne, oczy, neurologiczne i klatkę/brzuch.</li>
        <li><strong>Notatki</strong> — cokolwiek zauważyłaś/eś. To Twoja przestrzeń; pisz swobodnie.</li>
      </ul>
      <p>Kliknij <strong>Zapisz wpis</strong>. Na dzień przypada jeden wpis — jeśli dodasz kolejny dla tej samej daty, zaktualizuje ten dzień. Wskazówka: zapisuj mniej więcej o tej samej porze, zwłaszcza temperaturę na początku leczenia.</p>

      <h2 id="edit">Edytowanie i usuwanie wpisu</h2>
      <ol>
        <li>Przejdź do zakładki <strong>Dziennik</strong> — wypisuje każdy zapisany dzień, od najnowszego.</li>
        <li><strong>Kliknij dowolny wiersz</strong>, aby ponownie otworzyć wpis danego dnia.</li>
        <li>Zmień, co chcesz, i kliknij <strong>Zapisz wpis</strong>, albo kliknij <strong>Usuń ten wpis</strong>, aby usunąć dzień.</li>
      </ol>
      <p>Możesz też zmienić datę u góry formularza — przydatne, gdy nadrabiasz pominięty dzień. Wyniki krwi edytuje się tak samo: kliknij wiersz w zakładce Wyniki krwi.</p>

      <h2 id="trends">Czytanie trendów</h2>
      <p>Zakładka <strong>Trendy</strong> to serce aplikacji. Każdy wykres pokazuje jedną rzecz w czasie; u góry po prawej wybierz <strong>14 / 30 / 90 dni lub Całość</strong>.</p>
      <ul>
        <li><strong>Waga</strong> — chcesz, żeby rosła. Dawkę ustala się z aktualnej wagi, więc powinna rosnąć, nigdy nie maleć, gdy kot rośnie.</li>
        <li><strong>Temperatura</strong> — zacieniony pas to zakres normy (38,1–39,2 °C), a linia przerywana oznacza gorączkę, więc skok od razu widać.</li>
        <li><strong>Apetyt, energia i zainteresowanie</strong> — cztery linie razem; obserwuj utrzymujące się spadki.</li>
        <li><strong>Stolce</strong> — liczba i konsystencja.</li>
      </ul>
      <p>Małe znaczniki (💊 i 👁) pokazują, gdzie zaczęło się leczenie i obserwacja. <strong>Najedź lub dotknij</strong> dowolnego wykresu, aby odczytać dokładne wartości danego dnia. Zakładka Przegląd podsumowuje najważniejsze liczby — ostatnią wagę, zmianę wagi od początku, ostatnią temperaturę i dni z gorączką.</p>

      <h2 id="blood">Dodawanie wyników krwi</h2>
      <ol>
        <li>Otwórz zakładkę <strong>Wyniki krwi</strong> i kliknij <strong>+ Dodaj wynik</strong>.</li>
        <li>Ustaw datę pobrania krwi, a następnie wpisz to, co podało laboratorium. Nie potrzebujesz każdego pola — nawet sama albumina i globuliny wystarczą, by aplikacja automatycznie policzyła <strong>stosunek A:G</strong>.</li>
        <li>Kliknij <strong>Zapisz</strong>.</li>
      </ol>
      <p>Dwa najczytelniejsze sygnały zdrowienia mają własne wykresy: <strong>stosunek A:G</strong> (wzrost w kierunku 0,8 i powyżej jest dobry) oraz <strong>globuliny vs albumina</strong> (w FIP zaczynają daleko od siebie i zbliżają się w miarę zdrowienia). Zakresy norm różnią się między laboratoriami, więc czytaj wartości swojego laboratorium obok tych.</p>

      <h2 id="print">Drukowanie lub zapis PDF dla weterynarza</h2>
      <p>Raport to przejrzyste, jednostronicowe podsumowanie — kluczowe wartości, wykresy trendów, wyniki krwi i ostatni dziennik — idealne na wizytę.</p>
      <ol>
        <li>Otwórz kota i przejdź do zakładki <strong>Ustawienia</strong>.</li>
        <li>W sekcji <strong>Raport dla weterynarza</strong> kliknij <strong>Otwórz raport do druku</strong>.</li>
        <li>Kliknij <strong>Drukuj / Zapisz jako PDF</strong> u góry raportu.</li>
        <li>Otworzy się okno drukowania przeglądarki. <strong>Aby zapisać PDF</strong>, zmień „Miejsce docelowe” (Chrome) lub „Drukarkę” (Safari/Firefox) na <strong>„Zapisz jako PDF”</strong>, kliknij <strong>Zapisz</strong> i wybierz miejsce zapisu. <strong>Aby wydrukować</strong>, wybierz drukarkę i kliknij <strong>Drukuj</strong>.</li>
      </ol>
      <p>Na telefonie: po dotknięciu <strong>Drukuj / Zapisz jako PDF</strong> użyj systemowego arkusza udostępniania/drukowania — na iPhonie rozsuń podgląd palcami lub wybierz „Zapisz w plikach”; na Androidzie wybierz „Zapisz jako PDF”. Raport jest w wybranym języku.</p>

      <h2 id="share">Udostępnianie linku (tylko do odczytu)</h2>
      <p>Link do udostępniania pozwala weterynarzowi lub grupie wsparcia FIP zobaczyć wykresy i dziennik tego kota <strong>bez możliwości edycji</strong> i bez logowania.</p>
      <ol>
        <li>Otwórz kota i przejdź do zakładki <strong>Ustawienia</strong>.</li>
        <li>W sekcji <strong>Udostępnij podgląd (tylko do odczytu)</strong> kliknij <strong>Utwórz link</strong>.</li>
        <li>Kliknij <strong>Kopiuj link</strong> i wklej go, gdzie chcesz — w wiadomości do weterynarza, w grupie FIP na Facebooku itp.</li>
        <li>Każdy z linkiem widzi żywy podgląd (tylko do odczytu), który aktualizuje się, gdy dodajesz wpisy.</li>
      </ol>
      <p><strong>Aby przestać udostępniać</strong>, wróć w to samo miejsce i kliknij <strong>Wyłącz link</strong>. Stary link natychmiast przestaje działać; zawsze możesz później utworzyć nowy. Widoczny jest tylko udostępniony kot — nigdy inne koty ani Twoje konto.</p>

      <h2 id="settings">Język, tryb ciemny i plan leczenia</h2>
      <ul>
        <li><strong>Język</strong> — przełączaj między angielskim a polskim w każdej chwili selektorem EN/PL na górnym pasku. Po zalogowaniu wybór jest zapamiętywany.</li>
        <li><strong>Tryb ciemny</strong> — przycisk ◐ na górnym pasku przełącza jasny/ciemny; domyślnie podąża też za ustawieniem urządzenia.</li>
        <li><strong>Plan leczenia</strong> — w Ustawieniach kota zapiszesz lek, postać (zastrzyk lub doustnie), dawkę w mg/kg i daty. Podaj stężenie zastrzyku, a aplikacja pokaże <strong>pomocnik dawki</strong> szacujący dzienną ilość z ostatniej wagi. To tylko kalkulator pomocniczy — zawsze potwierdź dawkę z weterynarzem lub grupą FIP.</li>
      </ul>

      <h2 id="data">Twoje dane, prywatność i badania nad FIP</h2>
      <p>Twoje wpisy są przechowywane, aby aplikacja działała dla Ciebie na wszystkich urządzeniach — to cały powód logowania. <strong>Nie sprzedajemy Twoich danych i ich nie eksploatujemy.</strong> Każde konto widzi wyłącznie swoje koty.</p>
      <p><strong>Wsparcie badań nad FIP jest całkowicie opcjonalne.</strong> Przy pierwszym logowaniu zobaczysz krótkie pytanie, a przełącznik jest zawsze dostępny w sekcji <strong>Konto</strong> (ikona na górnym pasku). Jeśli — i tylko jeśli — wyrazisz zgodę, <strong>zanonimizowane</strong> wpisy Twojego kota (pomiary i trendy, bez imienia, e-maila i czegokolwiek, co identyfikuje Ciebie lub kota) mogą zostać udostępnione badaczom FIP, aby pomóc badać chorobę i ulepszać leczenie innych kotów. Badania nad FIP trwają, a dane zbierane w domu przez opiekunów są dla nich naprawdę cenne. Możesz to włączyć lub wyłączyć, kiedy chcesz, i nie zmienia to działania aplikacji. Jeśli zostawisz wyłączone, nic nigdy nie jest udostępniane.</p>

      <h2 id="medical">Czy to porada medyczna?</h2>
      <p><strong>Nie.</strong> Leczenie FIP to szybko zmieniająca się, w dużej mierze pozarejestracyjna dziedzina. FIP Tracker to narzędzie, które pomaga Tobie i weterynarzowi <em>widzieć trendy</em> — nie diagnozuje, nie przepisuje leków i nie zastępuje opieki weterynaryjnej. Decyzje o leczeniu należą do weterynarza i doświadczonej grupy wsparcia FIP. Zakresy norm i uwagi o dawkowaniu to punkty wyjścia, które pomagają czytać wyniki Twojego kota, a nie instrukcje. Tło kliniczne znajdziesz w <a href="/guide">poradniku FIP</a>.</p>
    </>
  );
}
