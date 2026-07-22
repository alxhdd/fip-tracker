import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { SITE } from '../siteConfig';

// Bilingual privacy policy aligned with RODO / GDPR. It is a solid starting
// template — the operator should fill in SITE (siteConfig.ts) and, for a public
// deployment, ideally have it reviewed. Prose lives here, not in the i18n dict.
export function Privacy() {
  const { locale } = useI18n();
  return (
    <div className="guide" style={{ paddingTop: 22, maxWidth: 760 }}>
      {locale === 'pl' ? <PolishPrivacy /> : <EnglishPrivacy />}
    </div>
  );
}

function EnglishPrivacy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="muted small">Last updated: {SITE.policyUpdated}</p>

      <p>
        This policy explains how <strong>{SITE.operator}</strong> (“we”, the service “FIP Tracker”) processes
        personal data, in line with the EU General Data Protection Regulation (GDPR / Polish <em>RODO</em>).
        FIP Tracker is a free, non-commercial tool for tracking a cat through FIP.
      </p>

      <h2>1. Data controller</h2>
      <p>
        The data controller (<em>administrator danych</em>) is <strong>{SITE.operator}</strong>. For any privacy
        matter — including exercising your rights below — contact us at{' '}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>2. What data we process</h2>
      <ul>
        <li><strong>Account data</strong> from your Google or Facebook login: your name, email address, profile
          picture, and the unique account identifier the provider gives us. Plus your language preference and your
          research-consent choice.</li>
        <li><strong>Content you enter</strong>: your cat’s profile (name, breed, sex, birth date, FIP form and phase,
          treatment plan) and health-tracking records (daily logs — weight, temperature, appetite, energy, litter box,
          symptoms, medication, notes — and bloodwork results). These describe your animal; any personal data is only
          what you choose to type into free-text notes.</li>
        <li><strong>Technical data</strong>: a strictly necessary session cookie to keep you signed in, a temporary
          cookie during login for security, and basic server logs (which may include your IP address) kept for
          security and to operate the service.</li>
      </ul>

      <h2>3. Why we process it, and the legal basis</h2>
      <ul>
        <li><strong>To provide the service</strong> — creating your account and storing your records so you can access
          them across devices. Legal basis: performance of our agreement with you (Art. 6(1)(b) GDPR) and our
          legitimate interest in running a secure, functional service (Art. 6(1)(f)).</li>
        <li><strong>To sign you in</strong> via Google/Facebook — necessary to provide access (Art. 6(1)(b)).</li>
        <li><strong>Optional FIP research</strong> — only if you actively opt in, we may share <strong>de-identified</strong>
          records for FIP research. Legal basis: your explicit consent (Art. 6(1)(a), and Art. 9(2)(a) where the data is
          health-related). You can withdraw consent at any time in <em>Account</em>, with no effect on the service.</li>
      </ul>

      <h2>4. Cookies</h2>
      <p>
        We use <strong>only strictly necessary cookies</strong>: a signed session cookie so you stay logged in, and a
        short-lived cookie protecting the login flow. We use <strong>no</strong> analytics, advertising, or third-party
        tracking cookies. Because these cookies are essential to a service you request, no cookie-consent banner is
        required.
      </p>

      <h2>5. Who your data is shared with</h2>
      <ul>
        <li><strong>We never sell or rent your data</strong>, and we show no ads.</li>
        <li><strong>Login providers</strong> (Google, Facebook) process your sign-in under their own privacy policies.</li>
        <li><strong>Hosting provider</strong> — our server and database run on infrastructure that processes data on our
          behalf (a processor under Art. 28 GDPR).</li>
        <li><strong>Read-only share links</strong>: if <em>you</em> create a share link for a cat, anyone who has that
          link can view that cat’s records until you disable the link.</li>
        <li><strong>FIP research</strong>: de-identified data only, and only if you opted in.</li>
      </ul>

      <h2>6. International transfers</h2>
      <p>
        Our servers are located in {SITE.hostingLocation}. Signing in with Google or Facebook may transfer your login
        data to those companies (including outside the EEA) under their own safeguards, such as Standard Contractual
        Clauses or an adequacy decision.
      </p>

      <h2>7. How long we keep it</h2>
      <p>
        We keep your data for as long as you use the service. You can delete individual cats and their records at any
        time in the app. To delete your entire account and all associated data, contact us at{' '}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Residual copies may remain in encrypted backups
        for a limited period before being overwritten.
      </p>

      <h2>8. Your rights</h2>
      <p>Under the GDPR you have the right to:</p>
      <ul>
        <li>access your data and receive a copy;</li>
        <li>rectify inaccurate data;</li>
        <li>erase your data (“right to be forgotten”);</li>
        <li>restrict or object to processing;</li>
        <li>data portability (receive your data in a portable format);</li>
        <li>withdraw consent at any time (for research sharing), without affecting prior lawful processing.</li>
      </ul>
      <p>
        To exercise any of these, email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. You also have
        the right to lodge a complaint with a supervisory authority — in Poland, the President of the Personal Data
        Protection Office (<em>Prezes Urzędu Ochrony Danych Osobowych</em>, ul. Stawki 2, 00-193 Warszawa,{' '}
        <a href="https://uodo.gov.pl" target="_blank" rel="noreferrer">uodo.gov.pl</a>).
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable technical measures — HTTPS in transit, signed session cookies, and per-account access controls
        so each user sees only their own cats. No online service can guarantee absolute security.
      </p>

      <h2>10. Children</h2>
      <p>This service is not directed at children and is intended for adult caregivers.</p>

      <h2>11. Changes</h2>
      <p>We may update this policy; the “last updated” date above reflects the current version.</p>

      <hr className="divider" />
      <p className="small muted">
        See also the <Link to="/faq">how-to guide</Link>. FIP Tracker is a tracking aid, not medical advice.
      </p>
    </>
  );
}

function PolishPrivacy() {
  return (
    <>
      <h1>Polityka prywatności</h1>
      <p className="muted small">Ostatnia aktualizacja: {SITE.policyUpdated}</p>

      <p>
        Niniejsza polityka wyjaśnia, jak <strong>{SITE.operator}</strong> („my”, usługa „FIP Tracker”) przetwarza dane
        osobowe, zgodnie z unijnym rozporządzeniem RODO (GDPR). FIP Tracker to darmowe, niekomercyjne narzędzie do
        monitorowania kota chorującego na FIP.
      </p>

      <h2>1. Administrator danych</h2>
      <p>
        Administratorem danych jest <strong>{SITE.operator}</strong>. We wszelkich sprawach dotyczących prywatności —
        w tym w celu realizacji praw wskazanych poniżej — skontaktuj się z nami pod adresem{' '}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>2. Jakie dane przetwarzamy</h2>
      <ul>
        <li><strong>Dane konta</strong> z logowania Google lub Facebook: imię i nazwisko, adres e-mail, zdjęcie profilowe
          oraz unikalny identyfikator konta przekazany przez dostawcę. Ponadto preferencję językową i wybór dotyczący
          zgody na badania.</li>
        <li><strong>Treści, które wprowadzasz</strong>: profil kota (imię, rasa, płeć, data urodzenia, postać i etap FIP,
          plan leczenia) oraz zapisy zdrowotne (dziennik: waga, temperatura, apetyt, energia, kuweta, objawy, leki,
          notatki — oraz wyniki krwi). Dotyczą one Twojego zwierzęcia; danymi osobowymi jest wyłącznie to, co sam(a)
          wpiszesz w polach notatek.</li>
        <li><strong>Dane techniczne</strong>: niezbędny plik cookie sesji utrzymujący zalogowanie, tymczasowy plik cookie
          zabezpieczający logowanie oraz podstawowe logi serwera (mogące zawierać adres IP), przechowywane ze względów
          bezpieczeństwa i w celu działania usługi.</li>
      </ul>

      <h2>3. Cele i podstawa prawna przetwarzania</h2>
      <ul>
        <li><strong>Świadczenie usługi</strong> — utworzenie konta i przechowywanie Twoich zapisów, byś mógł/mogła
          korzystać z nich na różnych urządzeniach. Podstawa: wykonanie umowy z Tobą (art. 6 ust. 1 lit. b RODO) oraz
          nasz prawnie uzasadniony interes w prowadzeniu bezpiecznej, sprawnej usługi (art. 6 ust. 1 lit. f).</li>
        <li><strong>Logowanie</strong> przez Google/Facebook — niezbędne do zapewnienia dostępu (art. 6 ust. 1 lit. b).</li>
        <li><strong>Opcjonalne badania nad FIP</strong> — wyłącznie jeśli aktywnie wyrazisz zgodę, możemy udostępnić
          <strong> zanonimizowane</strong> zapisy do badań nad FIP. Podstawa: Twoja wyraźna zgoda (art. 6 ust. 1 lit. a
          oraz art. 9 ust. 2 lit. a, gdy dane dotyczą zdrowia). Zgodę możesz wycofać w każdej chwili w sekcji
          <em> Konto</em>, bez wpływu na działanie usługi.</li>
      </ul>

      <h2>4. Pliki cookie</h2>
      <p>
        Używamy <strong>wyłącznie niezbędnych plików cookie</strong>: podpisanego pliku sesji, byś pozostawał(a)
        zalogowany(a), oraz krótkotrwałego pliku zabezpieczającego proces logowania. <strong>Nie</strong> stosujemy
        cookies analitycznych, reklamowych ani śledzących podmiotów trzecich. Ponieważ są one niezbędne do świadczenia
        żądanej usługi, baner zgody na cookies nie jest wymagany.
      </p>

      <h2>5. Komu udostępniamy dane</h2>
      <ul>
        <li><strong>Nigdy nie sprzedajemy ani nie wynajmujemy Twoich danych</strong> i nie wyświetlamy reklam.</li>
        <li><strong>Dostawcy logowania</strong> (Google, Facebook) przetwarzają Twoje logowanie na podstawie własnych
          polityk prywatności.</li>
        <li><strong>Dostawca hostingu</strong> — nasz serwer i baza działają na infrastrukturze przetwarzającej dane w
          naszym imieniu (podmiot przetwarzający, art. 28 RODO).</li>
        <li><strong>Linki do odczytu</strong>: jeśli <em>Ty</em> utworzysz link do udostępnienia kota, każdy, kto go ma,
          może przeglądać zapisy tego kota do momentu wyłączenia linku.</li>
        <li><strong>Badania nad FIP</strong>: wyłącznie dane zanonimizowane i tylko jeśli wyraziłeś(-aś) zgodę.</li>
      </ul>

      <h2>6. Przekazywanie poza EOG</h2>
      <p>
        Nasze serwery znajdują się w: {SITE.hostingLocation}. Logowanie przez Google lub Facebook może wiązać się z
        przekazaniem danych logowania tym firmom (także poza EOG) na podstawie ich własnych zabezpieczeń, takich jak
        standardowe klauzule umowne lub decyzja o adekwatności.
      </p>

      <h2>7. Jak długo przechowujemy dane</h2>
      <p>
        Przechowujemy Twoje dane tak długo, jak korzystasz z usługi. W aplikacji możesz w każdej chwili usunąć
        poszczególne koty i ich zapisy. Aby usunąć całe konto i wszystkie powiązane dane, napisz na{' '}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Kopie szczątkowe mogą pozostać w szyfrowanych
        kopiach zapasowych przez ograniczony czas, zanim zostaną nadpisane.
      </p>

      <h2>8. Twoje prawa</h2>
      <p>Zgodnie z RODO masz prawo do:</p>
      <ul>
        <li>dostępu do danych i otrzymania ich kopii;</li>
        <li>sprostowania nieprawidłowych danych;</li>
        <li>usunięcia danych („prawo do bycia zapomnianym”);</li>
        <li>ograniczenia przetwarzania lub wniesienia sprzeciwu;</li>
        <li>przenoszenia danych (otrzymania ich w formacie nadającym się do przeniesienia);</li>
        <li>wycofania zgody w dowolnym momencie (dot. udostępniania do badań), bez wpływu na wcześniejsze zgodne z prawem przetwarzanie.</li>
      </ul>
      <p>
        Aby skorzystać z tych praw, napisz na <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Masz też
        prawo wnieść skargę do organu nadzorczego — w Polsce jest to Prezes Urzędu Ochrony Danych Osobowych (ul. Stawki 2,
        00-193 Warszawa, <a href="https://uodo.gov.pl" target="_blank" rel="noreferrer">uodo.gov.pl</a>).
      </p>

      <h2>9. Bezpieczeństwo</h2>
      <p>
        Stosujemy rozsądne środki techniczne — HTTPS podczas transmisji, podpisane pliki cookie sesji oraz kontrolę
        dostępu na poziomie konta, tak że każdy użytkownik widzi wyłącznie własne koty. Żadna usługa online nie może
        zagwarantować absolutnego bezpieczeństwa.
      </p>

      <h2>10. Dzieci</h2>
      <p>Usługa nie jest skierowana do dzieci i jest przeznaczona dla dorosłych opiekunów.</p>

      <h2>11. Zmiany</h2>
      <p>Możemy aktualizować niniejszą politykę; data „ostatniej aktualizacji” powyżej odzwierciedla bieżącą wersję.</p>

      <hr className="divider" />
      <p className="small muted">
        Zobacz też <Link to="/faq">instrukcję obsługi</Link>. FIP Tracker to narzędzie pomocnicze, a nie porada medyczna.
      </p>
    </>
  );
}
