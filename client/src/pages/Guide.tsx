import { useI18n } from '../i18n';

// Long-form guide content is locale-branched inline — it is prose, not UI chrome,
// so it lives here rather than in the key/value dictionaries.
export function Guide() {
  const { t, locale } = useI18n();
  return (
    <div className="guide" style={{ paddingTop: 22, maxWidth: 760 }}>
      <h1>{t('guide_title')}</h1>
      <p className="muted">{t('guide_intro')}</p>
      <div className="callout callout-warn">
        <strong>{t('guide_disclaimer_title')}.</strong> {t('guide_disclaimer_body')}
      </div>
      {locale === 'pl' ? <PolishGuide /> : <EnglishGuide />}
      <hr className="divider" />
      <p className="small muted">
        Sources: UC Davis / Dr. Niels Pedersen GS-441524 protocols, Cornell Feline Health Center,
        and FIP caregiver communities (FIP Warriors, FIP Advocates, fip-support.org).
      </p>
    </div>
  );
}

function EnglishGuide() {
  return (
    <>
      <h2>The three phases</h2>
      <p>This app organises tracking around where you are:</p>
      <ul>
        <li><strong>Monitoring</strong> — before or around diagnosis. You are watching for signs and building a baseline. Log temperature daily and weight often.</li>
        <li><strong>Treatment</strong> — usually a minimum of 84 days (12 weeks) on antiviral (commonly GS-441524). Weight, temperature and bloodwork are the response signals.</li>
        <li><strong>Observation</strong> — a 12-week watch after treatment ends. The first ~60 days carry the highest relapse risk.</li>
      </ul>

      <h2>What to track daily — and why</h2>
      <table>
        <thead><tr><th>Metric</th><th>Why it matters</th></tr></thead>
        <tbody>
          <tr><td><strong>Weight</strong></td><td>Weight gain is one of the clearest signs treatment is working. Some wasted cats more than double their weight. Weigh on the same scale; the dose is set from current weight and should rise, never fall, as your cat grows.</td></tr>
          <tr><td><strong>Temperature</strong></td><td>Normal is 38.1–39.2 °C. Above 39.2 °C is a fever; FIP fever is often recurring. Above 41 °C is urgent. Take it at the same time daily early in treatment.</td></tr>
          <tr><td><strong>Appetite, energy, interest</strong></td><td>Quick 0–5 scores. Improvement is often visible within 24–72 hours of starting treatment. Sustained dips deserve attention.</td></tr>
          <tr><td><strong>Stools & vomiting</strong></td><td>Track count and consistency — a simple read on gut health and drug tolerance.</td></tr>
          <tr><td><strong>Symptoms</strong></td><td>A checklist of general, eye, neurological and abdominal signs. Log anything you see.</td></tr>
        </tbody>
      </table>

      <h2>Dry FIP — watch the clinical signs</h2>
      <p>In dry (non-effusive), ocular and neurological FIP, bloodwork can look near-normal because the eye and brain are partly shielded from the bloodstream. That makes what you observe at home more important, not less. The pattern to watch:</p>
      <ul>
        <li><strong>Recurring fever</strong>, often the earliest sign — log temperature every day.</li>
        <li><strong>Weight loss or failure to grow despite eating</strong> — a red flag. This is why we chart weight against appetite together.</li>
        <li><strong>Eye changes</strong>: cloudiness, a colour change in the iris, unequal pupils.</li>
        <li><strong>Neurological signs</strong>: wobbliness, tremors, behaviour change, sensitivity to touch or sound, incontinence, seizures.</li>
        <li><strong>Enlarged lymph nodes</strong>, jaundice, a palpable mass.</li>
      </ul>

      <h2>Bloodwork — the two clearest signals</h2>
      <p>You don't need to track every value. The two most legible are:</p>
      <ul>
        <li><strong>A:G ratio</strong> (albumin ÷ globulin). A low A:G (below ~0.6) supports FIP; a rising A:G is an early positive response. The recovery target is above 0.8. A normal/high A:G is strong evidence <em>against</em> FIP.</li>
        <li><strong>Globulin and albumin</strong> — in FIP, globulin runs high and albumin low; recovery brings them back together.</li>
      </ul>
      <p>Other useful markers: hematocrit (anemia), lymphocyte %, total protein, bilirubin, and — if your lab offers it — AGP, which dropping to ≤500 µg/mL is a strong sign of true recovery. Typical schedule: a baseline, then roughly every 4 weeks, a panel before stopping at week 12, and one about 4 weeks after finishing. Reference ranges vary by lab — read your own lab's numbers alongside these.</p>

      <h2>After treatment — relapse watch</h2>
      <p>During observation, watch for the return of fever, appetite drop, weight loss, new belly or chest fluid, jaundice, eye changes or wobbliness, and rising globulin / falling A:G on follow-up bloodwork. Note anything right away and contact your vet or FIP group — relapses are treatable, and catching them early matters.</p>
    </>
  );
}

function PolishGuide() {
  return (
    <>
      <h2>Trzy etapy</h2>
      <p>Aplikacja porządkuje śledzenie według etapu, na którym jesteś:</p>
      <ul>
        <li><strong>Obserwacja</strong> — przed diagnozą lub w jej trakcie. Wypatrujesz objawów i budujesz punkt odniesienia. Mierz temperaturę codziennie, a wagę często.</li>
        <li><strong>Leczenie</strong> — zwykle minimum 84 dni (12 tygodni) leku przeciwwirusowego (najczęściej GS-441524). Waga, temperatura i wyniki krwi to sygnały odpowiedzi.</li>
        <li><strong>Kontrola po leczeniu</strong> — 12-tygodniowa obserwacja po zakończeniu terapii. Pierwsze ~60 dni to najwyższe ryzyko nawrotu.</li>
      </ul>

      <h2>Co śledzić codziennie — i dlaczego</h2>
      <table>
        <thead><tr><th>Parametr</th><th>Dlaczego jest ważny</th></tr></thead>
        <tbody>
          <tr><td><strong>Waga</strong></td><td>Przyrost wagi to jeden z najczytelniejszych znaków, że leczenie działa. Niektóre wychudzone koty więcej niż podwajają wagę. Waż na tej samej wadze; dawkę ustala się z aktualnej wagi i powinna rosnąć, nigdy nie maleć, gdy kot rośnie.</td></tr>
          <tr><td><strong>Temperatura</strong></td><td>Norma to 38,1–39,2 °C. Powyżej 39,2 °C to gorączka; w FIP często nawraca. Powyżej 41 °C to stan pilny. Na początku leczenia mierz o tej samej porze każdego dnia.</td></tr>
          <tr><td><strong>Apetyt, energia, zainteresowanie</strong></td><td>Szybka ocena 0–5. Poprawa często widoczna w 24–72 godziny od rozpoczęcia leczenia. Utrzymujące się spadki wymagają uwagi.</td></tr>
          <tr><td><strong>Stolce i wymioty</strong></td><td>Śledź liczbę i konsystencję — prosty wskaźnik pracy jelit i tolerancji leku.</td></tr>
          <tr><td><strong>Objawy</strong></td><td>Lista objawów ogólnych, ocznych, neurologicznych i brzusznych. Zapisuj wszystko, co widzisz.</td></tr>
        </tbody>
      </table>

      <h2>Sucha FIP — obserwuj objawy kliniczne</h2>
      <p>W suchej (niewysiękowej), ocznej i neurologicznej FIP wyniki krwi mogą wyglądać niemal prawidłowo, bo oko i mózg są częściowo odcięte od krwiobiegu. To sprawia, że domowa obserwacja jest ważniejsza, nie mniej ważna. Wzorzec, na który warto zwracać uwagę:</p>
      <ul>
        <li><strong>Nawracająca gorączka</strong>, często najwcześniejszy objaw — mierz temperaturę codziennie.</li>
        <li><strong>Spadek wagi lub brak przyrostu mimo jedzenia</strong> — sygnał alarmowy. Dlatego zestawiamy wagę z apetytem na jednym wykresie.</li>
        <li><strong>Zmiany w oczach</strong>: zmętnienie, zmiana koloru tęczówki, nierówne źrenice.</li>
        <li><strong>Objawy neurologiczne</strong>: chwiejność, drżenia, zmiana zachowania, nadwrażliwość na dotyk lub dźwięk, nietrzymanie moczu/kału, napady.</li>
        <li><strong>Powiększone węzły chłonne</strong>, żółtaczka, wyczuwalny guz.</li>
      </ul>

      <h2>Wyniki krwi — dwa najczytelniejsze sygnały</h2>
      <p>Nie musisz śledzić każdej wartości. Dwie najbardziej czytelne to:</p>
      <ul>
        <li><strong>Stosunek A:G</strong> (albumina ÷ globuliny). Niski A:G (poniżej ~0,6) wspiera rozpoznanie FIP; rosnący A:G to wczesna pozytywna odpowiedź. Cel zdrowienia to powyżej 0,8. Prawidłowy/wysoki A:G to mocny dowód <em>przeciw</em> FIP.</li>
        <li><strong>Globuliny i albumina</strong> — w FIP globuliny są wysokie, a albumina niska; zdrowienie zbliża je do siebie.</li>
      </ul>
      <p>Inne przydatne parametry: hematokryt (niedokrwistość), % limfocytów, białko całkowite, bilirubina oraz — jeśli laboratorium je oferuje — AGP, którego spadek do ≤500 µg/mL to mocny znak prawdziwego zdrowienia. Typowy harmonogram: badanie wyjściowe, potem mniej więcej co 4 tygodnie, panel przed zakończeniem w 12. tygodniu i jeden około 4 tygodnie po zakończeniu. Zakresy norm różnią się między laboratoriami — czytaj wartości swojego laboratorium obok tych.</p>

      <h2>Po leczeniu — obserwacja nawrotu</h2>
      <p>W okresie obserwacji wypatruj powrotu gorączki, spadku apetytu, utraty wagi, nowego płynu w brzuchu lub klatce, żółtaczki, zmian w oczach lub chwiejności oraz rosnących globulin / spadającego A:G w kontrolnych wynikach krwi. Notuj wszystko od razu i skontaktuj się z weterynarzem lub grupą FIP — nawroty są uleczalne, a wczesne wykrycie ma znaczenie.</p>
    </>
  );
}
