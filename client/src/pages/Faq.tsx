import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

// A collapsible FAQ. Each question is a <details> so answers stay tucked away
// until clicked — condense-by-default. Prose lives here, not in the i18n dict.
export function Faq() {
  const { t, locale } = useI18n();
  const items = locale === 'pl' ? polishItems() : englishItems();
  return (
    <div className="guide" style={{ paddingTop: 22, maxWidth: 760 }}>
      <h1>{t('guide_title')}</h1>
      <p className="muted">{t('guide_intro')}</p>
      <div className="callout callout-warn">
        <strong>{t('guide_disclaimer_title')}.</strong> {t('guide_disclaimer_body')}
      </div>
      <div style={{ marginTop: 18 }}>
        {items.map((it, i) => (
          <details className="faq-item" key={i}>
            <summary>{it.q}</summary>
            <div className="faq-body">{it.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

function englishItems(): { q: string; a: ReactNode }[] {
  return [
    {
      q: 'Why use FIP Tracker?',
      a: (
        <p>FIP treatment is a marathon — often 84 days plus a 12-week watch afterwards. What tells you how it’s
          going isn’t one good afternoon, it’s the <strong>trend over days</strong>: is weight climbing, is the fever
          settling, is appetite holding? FIP Tracker turns your daily notes into clear charts, keeps everything safe
          across your devices (because you’re signed in), and lets you print a vet report or share progress with your
          FIP group.</p>
      ),
    },
    {
      q: 'How do I add my cat?',
      a: (
        <p>On <strong>My cats</strong>, click <strong>+ Add a cat</strong>. Enter a name; optionally set breed, sex,
          birth date, the FIP form, and the current phase (monitoring / treatment / observation). Save, then click the
          cat’s card to open it. You can change all of this later in <strong>Settings</strong>.</p>
      ),
    },
    {
      q: 'How do I log a day?',
      a: (
        <p>Open your cat and click <strong>+ Add today’s log</strong>. Fill in whatever you measured — weight (grams),
          temperature (a fever is flagged for you), 0–5 scores for appetite/energy/interest, stools, vomiting,
          medication, a symptom checklist, and free-text notes. Nothing is required. There’s one entry per day; saving
          the same date again just updates it.</p>
      ),
    },
    {
      q: 'How do I edit or delete an entry?',
      a: (
        <p>The <strong>Daily log</strong> tab lists every day, newest first. <strong>Click any row</strong> to reopen
          it, change anything and Save, or use <strong>Delete this entry</strong>. You can also change the date at the
          top of the form — handy for catching up on a missed day. Bloodwork edits the same way.</p>
      ),
    },
    {
      q: 'How do I read the trends?',
      a: (
        <p>The <strong>Trends</strong> tab plots weight, temperature (with the normal band and fever line shaded),
          appetite/energy/interest, and stools over 14 / 30 / 90 days or all time. The 💊 and 👁 marks show where
          treatment and observation began. <strong>Hover or tap</strong> any chart for exact values.</p>
      ),
    },
    {
      q: 'How do I add bloodwork?',
      a: (
        <p>Go to the <strong>Bloodwork</strong> tab → <strong>+ Add bloodwork</strong>. Set the date and type in
          whatever your lab reported — even just albumin and globulin lets the app compute the <strong>A:G ratio</strong>.
          The two clearest recovery signals (A:G, and globulin vs albumin) get their own trend charts. Reference ranges
          vary by lab, so read your own lab’s numbers alongside these.</p>
      ),
    },
    {
      q: 'How do I print or save a PDF for my vet?',
      a: (
        <ol>
          <li>Open your cat → <strong>Settings</strong> → <strong>Vet report</strong> → <strong>Open printable report</strong>.</li>
          <li>Click <strong>Print / Save as PDF</strong> at the top.</li>
          <li>In the print window, set the destination to <strong>“Save as PDF”</strong> to keep a file, or pick your printer for paper. On a phone, use the share/print sheet (“Save to Files” / “Save as PDF”).</li>
        </ol>
      ),
    },
    {
      q: 'How do I share a read-only link (with a vet or FB group)?',
      a: (
        <p>In a cat’s <strong>Settings</strong> → <strong>Share a read-only view</strong> → <strong>Create share link</strong> →
          <strong> Copy link</strong>. Anyone with it can <em>view</em> (not edit) that cat’s charts and log. Disable it
          anytime from the same place — the old link stops working immediately. Only that one cat is ever visible.</p>
      ),
    },
    {
      q: 'Can two people share the same cat? (co-owners)',
      a: (
        <>
          <p>Yes — you can co-own a cat with a partner or family member so you both log and edit everything, with your
            own accounts (no sharing a login).</p>
          <ol>
            <li>The owner opens the cat → <strong>Settings</strong> → <strong>Co-owners</strong> and copies the <strong>Share code</strong>.</li>
            <li>The other person signs in, clicks <strong>Join a cat</strong> on their dashboard, and enters the code.</li>
            <li>The owner gets an <strong>Approve / Deny</strong> request on their dashboard. Once approved, the cat
              appears for both of you and you can each view and edit it.</li>
          </ol>
          <p>Owners can remove co-owners anytime (Settings → Co-owners); co-owners can leave from the same place. It
            works for any number of people.</p>
        </>
      ),
    },
    {
      q: 'Language, dark mode, and the treatment plan?',
      a: (
        <p>Switch <strong>English / Polish</strong> with the EN/PL selector in the top bar; the <strong>◐</strong>
          button toggles light/dark (it also follows your device). In a cat’s Settings you can record the medication,
          form, dose (mg/kg) and dates — enter the injection concentration and a <strong>dose helper</strong> estimates
          the daily amount from the latest weight. It’s a convenience only; always confirm doses with your vet.</p>
      ),
    },
    {
      q: 'What happens to my data? Is it private?',
      a: (
        <p>Your records exist only to run the tracker for you — we don’t sell or mine them, and each account sees only
          its own cats. Helping FIP research is <strong>strictly opt-in</strong> (the Account panel) and shares only
          de-identified data. You can delete individual cats, or your whole account
          (<strong>Account → Delete account</strong>). See the <Link to="/privacy">Privacy Policy</Link> for the full detail.</p>
      ),
    },
    {
      q: 'Is this medical advice?',
      a: (
        <p><strong>No.</strong> FIP Tracker helps you and your vet <em>see trends</em> — it doesn’t diagnose, prescribe,
          or replace veterinary care. Treatment decisions belong to your vet and an experienced FIP support group. For
          the clinical background, see the <Link to="/guide">FIP guide</Link>.</p>
      ),
    },
  ];
}

function polishItems(): { q: string; a: ReactNode }[] {
  return [
    {
      q: 'Po co używać FIP Tracker?',
      a: (
        <p>Leczenie FIP to maraton — często 84 dni plus 12 tygodni obserwacji. O tym, jak idzie, mówi nie jedno dobre
          popołudnie, lecz <strong>trend na przestrzeni dni</strong>: czy waga rośnie, czy gorączka ustępuje, czy apetyt
          się utrzymuje? FIP Tracker zamienia codzienne notatki w czytelne wykresy, przechowuje wszystko bezpiecznie na
          Twoich urządzeniach (bo jesteś zalogowana/y) i pozwala wydrukować raport dla weterynarza lub dzielić się
          postępami z grupą FIP.</p>
      ),
    },
    {
      q: 'Jak dodać kota?',
      a: (
        <p>Na stronie <strong>Moje koty</strong> kliknij <strong>+ Dodaj kota</strong>. Wpisz imię; opcjonalnie ustaw
          rasę, płeć, datę urodzenia, postać FIP i aktualny etap (obserwacja / leczenie / kontrola). Zapisz i kliknij
          kartę kota, aby go otworzyć. Wszystko możesz później zmienić w <strong>Ustawieniach</strong>.</p>
      ),
    },
    {
      q: 'Jak zapisać dzień?',
      a: (
        <p>Otwórz kota i kliknij <strong>+ Dodaj dzisiejszy wpis</strong>. Uzupełnij to, co zmierzyłaś/eś — wagę
          (gramy), temperaturę (gorączka jest oznaczana), oceny 0–5 dla apetytu/energii/zainteresowania, stolce,
          wymioty, leki, listę objawów i notatki. Nic nie jest wymagane. Na dzień przypada jeden wpis; zapisanie tej
          samej daty ponownie po prostu go aktualizuje.</p>
      ),
    },
    {
      q: 'Jak edytować lub usunąć wpis?',
      a: (
        <p>Zakładka <strong>Dziennik</strong> wypisuje każdy dzień, od najnowszego. <strong>Kliknij dowolny wiersz</strong>,
          aby go otworzyć, zmień co chcesz i zapisz, albo użyj <strong>Usuń ten wpis</strong>. Możesz też zmienić datę u
          góry formularza — przydatne przy nadrabianiu pominiętego dnia. Wyniki krwi edytuje się tak samo.</p>
      ),
    },
    {
      q: 'Jak czytać trendy?',
      a: (
        <p>Zakładka <strong>Trendy</strong> pokazuje wagę, temperaturę (z zacienionym zakresem normy i linią gorączki),
          apetyt/energię/zainteresowanie oraz stolce w oknie 14 / 30 / 90 dni lub całości. Znaczniki 💊 i 👁 pokazują
          początek leczenia i obserwacji. <strong>Najedź lub dotknij</strong> wykresu, by odczytać dokładne wartości.</p>
      ),
    },
    {
      q: 'Jak dodać wyniki krwi?',
      a: (
        <p>Przejdź do zakładki <strong>Wyniki krwi</strong> → <strong>+ Dodaj wynik</strong>. Ustaw datę i wpisz to, co
          podało laboratorium — nawet sama albumina i globuliny pozwalają obliczyć <strong>stosunek A:G</strong>. Dwa
          najczytelniejsze sygnały zdrowienia (A:G oraz globuliny vs albumina) mają własne wykresy. Zakresy norm różnią
          się między laboratoriami, więc czytaj wartości swojego laboratorium obok tych.</p>
      ),
    },
    {
      q: 'Jak wydrukować lub zapisać PDF dla weterynarza?',
      a: (
        <ol>
          <li>Otwórz kota → <strong>Ustawienia</strong> → <strong>Raport dla weterynarza</strong> → <strong>Otwórz raport do druku</strong>.</li>
          <li>Kliknij <strong>Drukuj / Zapisz jako PDF</strong> u góry.</li>
          <li>W oknie drukowania ustaw miejsce docelowe na <strong>„Zapisz jako PDF”</strong>, aby zapisać plik, lub wybierz drukarkę. Na telefonie użyj arkusza udostępniania/drukowania („Zapisz w plikach” / „Zapisz jako PDF”).</li>
        </ol>
      ),
    },
    {
      q: 'Jak udostępnić link tylko do odczytu (weterynarzowi lub grupie na FB)?',
      a: (
        <p>W <strong>Ustawieniach</strong> kota → <strong>Udostępnij podgląd (tylko do odczytu)</strong> →
          <strong> Utwórz link</strong> → <strong>Kopiuj link</strong>. Każdy z linkiem może <em>przeglądać</em> (bez
          edycji) wykresy i dziennik tego kota. Wyłącz go w każdej chwili w tym samym miejscu — stary link natychmiast
          przestaje działać. Widoczny jest tylko ten jeden kot.</p>
      ),
    },
    {
      q: 'Czy dwie osoby mogą dzielić tego samego kota? (współwłaściciele)',
      a: (
        <>
          <p>Tak — możesz współdzielić kota z partnerem lub rodziną, tak że oboje zapisujecie i edytujecie wszystko, na
            własnych kontach (bez dzielenia się loginem).</p>
          <ol>
            <li>Właściciel otwiera kota → <strong>Ustawienia</strong> → <strong>Współwłaściciele</strong> i kopiuje <strong>kod udostępniania</strong>.</li>
            <li>Druga osoba loguje się, klika <strong>Dołącz do kota</strong> na swoim pulpicie i wpisuje kod.</li>
            <li>Właściciel dostaje prośbę <strong>Zatwierdź / Odrzuć</strong> na swoim pulpicie. Po zatwierdzeniu kot
              pojawia się u obu osób i każda może go przeglądać i edytować.</li>
          </ol>
          <p>Właściciel może w każdej chwili usunąć współwłaściciela (Ustawienia → Współwłaściciele); współwłaściciel może
            odejść w tym samym miejscu. Działa dla dowolnej liczby osób.</p>
        </>
      ),
    },
    {
      q: 'Język, tryb ciemny i plan leczenia?',
      a: (
        <p>Przełączaj <strong>angielski / polski</strong> selektorem EN/PL na górnym pasku; przycisk <strong>◐</strong>
          zmienia tryb jasny/ciemny (podąża też za ustawieniem urządzenia). W Ustawieniach kota zapiszesz lek, postać,
          dawkę (mg/kg) i daty — podaj stężenie zastrzyku, a <strong>pomocnik dawki</strong> oszacuje dzienną ilość z
          ostatniej wagi. To tylko udogodnienie; zawsze potwierdź dawki z weterynarzem.</p>
      ),
    },
    {
      q: 'Co dzieje się z moimi danymi? Czy są prywatne?',
      a: (
        <p>Twoje wpisy istnieją wyłącznie po to, by prowadzić dla Ciebie dziennik — nie sprzedajemy ich ani nie
          eksploatujemy, a każde konto widzi tylko swoje koty. Wsparcie badań nad FIP jest <strong>wyłącznie za zgodą</strong>
          (sekcja Konto) i udostępnia jedynie dane zanonimizowane. Możesz usunąć poszczególne koty lub całe konto
          (<strong>Konto → Usuń konto</strong>). Szczegóły w <Link to="/privacy">Polityce prywatności</Link>.</p>
      ),
    },
    {
      q: 'Czy to jest porada medyczna?',
      a: (
        <p><strong>Nie.</strong> FIP Tracker pomaga Tobie i weterynarzowi <em>widzieć trendy</em> — nie diagnozuje, nie
          przepisuje leków i nie zastępuje opieki weterynaryjnej. Decyzje o leczeniu należą do weterynarza i
          doświadczonej grupy wsparcia FIP. Tło kliniczne znajdziesz w <Link to="/guide">poradniku FIP</Link>.</p>
      ),
    },
  ];
}
