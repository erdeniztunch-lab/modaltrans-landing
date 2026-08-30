# Faz Faz Implementasyon Planı — Modaltrans Fleet Management Demo

> **Doküman ailesi**
> - [`modaltrans-knowledge.md`](modaltrans-knowledge.md) — şirketin iş/strateji analizi
> - [`fleet-management-concept.md`](fleet-management-concept.md) — tasarım kararları ve referans
> - **bu dosya** — nasıl inşa edileceği, faz faz
>
> Son güncelleme: 2026-08-30

---

## İlerleme

| Faz | Ad | Süre | Durum |
|:---:|---|---:|:---:|
| 0 | Temel ve kabuk | 55 dk | ✅ |
| 1 | Veri ve state çekirdeği | 70 dk | ✅ |
| 2 | Vehicles | 85 dk | ✅ |
| 3 | ⭐ Assign akışı | 110 dk | ✅ |
| 4 | Overview | 70 dk | ✅ |
| 5 | Vehicle drawer | 70 dk | ✅ |
| 6 | Trips ve Drivers | 65 dk | ⬜ |
| 7 | Koridor haritası ve canlı simülasyon | 80 dk | 🟡 |
| 8 | Rehberli tur | 50 dk | ⬜ |
| 9 | Cila, erişilebilirlik, metin | 65 dk | ⬜ |
| 10 | Gerekçe bölümü ve yayın | 40 dk | ⬜ |
| | **Toplam** | **~12.7 sa** | |

---

## Bağlam

**Neden bu iş yapılıyor?** Modaltrans'a yapılacak iş görüşmesinde gösterilmek üzere bir ürün
demosu. Şirketin kendi sitesinde `Filo Yönetimi — Yakında` / `Fleet Management — Coming Soon`
olarak listelenen, henüz var olmayan modülün nasıl tasarlanacağını gösteren, backend'siz ama
çalışır bir konsept.

**Hedeflenen sonuç:** Tek dosyalık, Artifact olarak yayınlanabilir, paylaşılabilir link üreten
çalışır bir demo. Birincil izleyici HR (teknik değil), ikincil izleyici link üzerinden gelecek
tasarım/ürün insanları.

**Netleşen kararlar:**

| Karar | Sonuç |
|---|---|
| Overview merkez görseli | **Koridor haritası** (hareketli SVG) |
| Teknik olmayan izleyici karşılaması | **Rehberli tur** (`▶ Play story`, 5 adım) |
| Efektif süre | **~12+ saat** → tüm fazlar sığıyor |
| Font | General Sans **gömülecek** (base64 data URI) |
| Gerekçe bölümü | **Var** — sayfa sonunda katlanır |

---

## Tasarım felsefesi → somut kurallar

Beş ilkenin bu projeye çevirisi. Dekoratif değil; her fazda uygulanacak kabul kriterleri.

### Y Combinator — "make something people want"

- Demo, bir sevkiyat şefinin **Pazartesi sabahı** yaşadığı problemi çözer; widget vitrini değil.
- **"Do things that don't scale":** demonun dokunduğu ~12 kayıt (3 atanmamış bacak, sıralanan
  araçlar, süresi dolan belgeler, geciken sefer) **elle yazılır**. Rastgele üretilmiş veri
  tekinsiz durur. Kalan ~30 dolgu kaydı seed'li RNG üretir.
- Tek hikâye eksiksiz anlatılır; beş hikâye yarım anlatılmaz.
- Her faz sonunda gösterilebilir bir şey olur — "launch early" fazlara uygulanmış hali.

### Don't Make Me Think (Krug)

- Her ekran, düşünmeden şu üçünü cevaplar: **neredeyim · burada ne var · şimdi ne yapmalıyım**.
- Durum = **renk + ikon + metin**. Asla tek başına renk.
- **Tıklanabilir olan tıklanabilir görünür.** Tüm satır/kart hedef olur, minik link değil.
  *(Modaltrans'ın gerçek sitesi bunda başarısız — `↗` ok butonları tıklanamıyor. Bilinçli olarak
  düzeltiyoruz; mülakatta söylenecek bir şey.)*
- "Kelimelerin yarısını at, sonra kalanın yarısını at."
- Konvansiyon > zekâ. Standart tablo, standart drawer, standart sekme.
- Etiketsiz ikon yok.

### Lean

- **Dikey dilimler, yatay katmanlar değil.** Hiçbir faz, iki faz sonraki özellik için altyapı kurmaz.
- Her fazın **kesme çizgisi önceden tanımlı**. Kutu dolunca kalite değil kapsam kesilir.
- En riskli + en değerli iş erken yapılır → **Assign akışı Faz 3'te, Faz 8'de değil.**

### Benefit-driven

- Her etiket **sonucu** söyler, veri tipini değil.
- ✅ `3 road legs awaiting assignment` — ❌ `Unassigned records: 3`
- Her KPI tile'ında bir "ne anlama geliyor" alt satırı.
- Genie kartı gözlem değil **sonuç** yazar:
  *"3 vehicles' inspections expire within 14 days; 2 of them depart next week."*

### Understandable messaging

İzleyici bölünmüş: HR alan bilgisi yok, uzman izleyici var. Kural:

- **Jargon korunur** (uzmanlığı gösterir) ama **ilk temasta açıklanır**.
- `U-ETDS ⓘ` → *"Turkey's mandatory pre-departure trip declaration."*
- `GVMS ⓘ` → *"UK goods vehicle movement reference, required at the border."*
- Düz İngilizce anlatı **rehberli turda** taşınır; arayüz profesyonel kalır, sulandırılmaz.

---

## Demo anlatısı (her şeyi bu belirler)

Rehberli turun 5 adımı = ürünün tezi. Tüm fazlar bu cümlelere hizmet eder.

1. **"Six trucks need you before your customer calls."** → Overview, attention list
2. **"Three of them are shipments with no truck yet."** → atama ekranına giriş
3. **"The system checks compliance before you commit."** → ✅⚠️❌ paneli, sürücü saati engeli
4. **"One click files U-ETDS, costs the trip, and tells your customer."** → dalga etkisi
5. **"It's the same shipment your customer already sees."** → Trips + client portal olayı

---

## Teknik mimari kararları

**Tek dosya, vanilla JS, framework yok.** Gerekçe: CSP güvenli, build adımı yok, CDN riski yok.
Store + render ~200 satır ve tamamen kontrol edilebilir.

**Dosya içi modül düzeni** (yorum bloklarıyla ayrılmış, bu sırayla):

```
1. TOKENS      — CSS custom properties (concept §2'den birebir)
2. BASE        — reset, tipografi, tema
3. COMPONENTS  — button, chip, card, tile, table, drawer, toast, empty, tooltip
4. DATA        — elle yazılan hero kayıtlar + seed'li dolgu üretici
5. STORE       — state, actions, pub/sub
6. SELECTORS   — türetilmiş değerler (KPI'lar, attention list, ranking)
7. VIEWS       — route başına render fonksiyonu (template literal döner)
8. ROUTER      — hash tabanlı
9. TOUR        — rehberli tur adımları
10. BOOT
```

**Render stratejisi ve bilinen tuzağı**
View'lar HTML string döner, kök konteyner'a yazılır, olaylar **delegasyonla** dinlenir.

> ⚠️ Tam re-render odak ve scroll'u kaybettirir. Çözüm **Faz 1'de** kurulur:
> arama inputunun değeri state'te tutulur · re-render sonrası `data-focus-id` ile odak geri
> verilir · scroll pozisyonu view başına saklanır.
> Bu, 6. saatte can yakan cinsten bir hatadır; baştan halledilir.

**Font gömme yöntemi**
General Sans Variable TTF, Modaltrans'ın kendi CDN'inde barındırılıyor. Base64 elle yazılmaz —
kabuk üzerinden indirilip dosyadaki `/*__FONT__*/` yer tutucusuna enjekte edilir.

**Deterministik veri:** `mulberry32` sabit seed. Her yüklemede aynı tablo → demo tekrarlanabilir.

**Dosyalar**

| Dosya | Ne |
|---|---|
| `fleet-management-demo.html` | Tek dosya demo (yeni) |
| `phase-by-phase-implementation-plan.md` | Bu dosya |
| `fleet-management-concept.md` | Tasarım referansı (değişmeyecek) |
| `modaltrans-knowledge.md` | İş analizi (dokunulmayacak) |

---

## Fazlar

Her faz: **Amaç → Yapılacak → Bitti sayılır → Gösterim cümlesi → Kesme çizgisi.**

---

### Faz 0 · Temel ve kabuk — 55 dk

**Amaç:** Modaltrans'ın görsel dili, çalışan bir uygulama iskeletine dönüşsün.

**Yapılacak**

- Tek HTML iskeleti, `<title>`, favicon
- `fleet-management-concept.md §2`'deki **tüm token seti** birebir CSS değişkenine
- General Sans Variable TTF → base64 data URI gömme; yedek `-apple-system, "Segoe UI"`
- Tema: `:root` (açık) → `@media (prefers-color-scheme: dark)` içinde
  `:root:not([data-theme="light"])` → `:root[data-theme="dark"]`. `localStorage` try/catch.
- Uygulama kabuğu: sol nav (Overview · Vehicles · Trips · Drivers), üst bar,
  `Concept · Demo data` rozeti, tema anahtarı
- Hash router + 4 boş route
- Primitifler: Button, Chip, Card, StatTile, Table, Drawer kabuğu, Toast host, EmptyState, Tooltip

**Bitti sayılır:** 4 route arasında gezinir, tema değişir, hiçbir renk token dışından gelmez.

**Gösterim:** *"İskelet Modaltrans'ın iskeleti."*

---

### Faz 1 · Veri ve state çekirdeği — 70 dk

**Amaç:** Backend yokluğunun hissedilmemesini sağlayan tek doğruluk kaynağı.

**Yapılacak**

- **Elle yazılan hero kayıtlar** (~12): 3 atanmamış road leg, atamada sıralanacak 5 araç,
  süresi dolan 2 belge, geciken 1 sefer, bakımı gecikmiş 1 araç
- Seed'li dolgu: 42 araç (18 own / 24 subcontracted), 26 sürücü, 16 sefer, 11 sevkiyat
- Veri concept §7 modeline birebir uyar; sayılar §4.5 benchmark bantlarında
  (€1.42/km, 9.8 L/100km, >%78 utilization)
- Store: `getState` / `dispatch` / `subscribe`
- Actions: `assignVehicle` · `renewDocument` · `scheduleMaintenance` · `advanceSimulation` · `undo`
- Selectors: `fleetUtilization` · `costPerKm` · `vehiclesNeedingAttention` · `activeTrips` ·
  `attentionList` · `rankVehiclesForLeg`
- Odak/scroll koruma mekanizması

**Bitti sayılır:** Konsoldan `dispatch(assignVehicle(...))` çağrılınca tüm selector'lar doğru değişir.

**Gösterim:** Görsel değil — ama her mutasyonun her yere yansımasını sağlayan şey bu.

---

### Faz 2 · Vehicles — 85 dk

**Amaç:** Asıl iş ekranı. "Çalışır gibi"nin yaşadığı yer.

**Yapılacak**

- `Own Fleet (18)` | `Subcontracted (24)` sekmeleri, sayaçlar canlı
- Tablo: `Plate` `Type` `Ownership` `Driver` `Current trip` `Location` `Status`
  `Next maintenance` `Doc status` `Cost/km`
- Arama (`/` odaklar) · filtreler (status, type, ADR, doc status) · sıralama
- Durum çipleri: renk + ikon + metin
- Satır seçimi + toplu işlem çubuğu
- **Boş durum** — tasarlanmış, yardımcı, özür dilemeyen
- Yükleme skeleton'u (ilk boyama + filtre değişiminde ~300 ms)
- Tüm satır tıklanabilir (Krug kuralı)

**Bitti sayılır:** Filtre sıfır sonuca indirilebilir ve karşılığında iyi bir boş durum çıkar.

**Gösterim:** *"42 aracın gerçek tablosu — arayın, süzün, sıfıra indirin."*

**Kesme çizgisi:** Toplu işlem çubuğu.

---

### Faz 3 · ⭐ Assign akışı — 110 dk

**Amaç:** Demonun omurgası. **Bu faz asla kesilmez.**

**Yapılacak**

- Giriş: atanmamış road leg'den `Assign vehicle`
- Bölünmüş görünüm: solda atanmamış bacaklar, sağda **uygunluğa göre sıralı** araçlar
- Sıralama fonksiyonu: konum yakınlığı · müsaitlik penceresi · ADR yeterliliği ·
  belge geçerliliği · sürücü kalan saati — her araçta "neden bu sırada" tek satır gerekçe
- **Uyum kontrolü paneli** (kritik an):

```
✅  ADR certificate    valid until 12 Mar 2027
✅  O-Licence          valid
⚠️  MOT                expires in 11 days — trip ends 4 days before, OK
❌  Driver hours       3h45m remaining, leg requires 6h20m
    → Suggest: assign co-driver, or M. Yılmaz (9h available)
```

- ❌ varken `Assign` kilitli; öneri kabul edilince açılır
- Onay → **dalga etkisi, hepsi ekranda görünür**:
  araç `Available → On trip` · 6 halkalı sefer zinciri oluşur · `U-ETDS: Filed ✓` ·
  maliyet sevkiyat P/L'sine · CO₂e Carbon Tracking'e · client portal olayı · Overview sayaçları
- Toast + **Undo**

**Bitti sayılır:** Tek tık, uygulamanın 6 ayrı yerinde gözle görülür değişiklik yapar.

**Gösterim:** *"Bir tık: uyum kontrol edildi, beyan verildi, maliyet düştü, müşteri haberdar."*

---

### Faz 4 · Overview — 70 dk

**Amaç:** 10 saniye kuralı. İlk izlenim ekranı.

**Yapılacak**

- Koyu `gradient-dusk-horizon` hero şeridi, `rounded-bottom` (site imzası)
- 4 birincil KPI: `Fleet utilization` · `Cost per km` · `Needs attention` · `Active trips`
  — her biri değer + trend + mikro sparkline + benefit alt satırı
- **Attention list** (en önemli bileşen), gruplu ve tıklanabilir:
  `Awaiting assignment (3)` · `Documents expiring (2)` · `Maintenance overdue (1)` · `Delayed (1)`
- Genie insight kartı — sonuç cümlesi + aksiyon linki
- Harita alanı rezerve edilir (Faz 7 doldurur)

**Bitti sayılır:** Soğuk açılıştan "neye bakmam lazım" cevabına 10 saniyeden az.

**Gösterim:** *"Girdiğiniz anda hangi aracın sizi beklediğini görüyorsunuz."*

---

### Faz 5 · Vehicle drawer — 70 dk

**Amaç:** Derinlik. Ekran sayısı artırmadan içerik derinliği.

**Yapılacak**

- Slide-over; Vehicles / Trips / Drivers üçünden de açılır
- Sekmeler: `Overview` `Compliance` `Maintenance` `Costs` `Trips` `Telemetry`
- **Compliance:** belge tablosu, kalan gün rozeti, `Renew` aksiyonu
- **Maintenance:** üç kova — Overdue / Due / Scheduled
- **Costs:** yakıt + geçiş + toplam, km başına, basit bar
- **Telemetry:** `Source: Arvento` çipi, son güncelleme, hız/konum/motor saati
  → *entegrasyon farkındalığını gösteren en ucuz ve en etkili detay*
- `Esc` kapatır, odak tuzağı, açılınca ilk odak başlığa

**Bitti sayılır:** Drawer'da belge yenilenince Overview'daki `Documents expiring` sayacı düşer.

**Gösterim:** *"Belgeyi buradan yeniliyorsunuz, uyarı ana ekrandan kayboluyor."*

**Kesme çizgisi:** Costs grafiği → statik rakam.

---

### Faz 6 · Trips ve Drivers — 65 dk

**Amaç:** Faz 3'te oluşan seferin yaşadığı yer + çift pazar uyum kanıtı.

**Yapılacak**

- **Trips:** liste + 6 halkalı sefer zinciri stepper'ı
  (Loading → TR Customs → Ro-Ro → NCTS → GVMS → Delivery)
- Beyan çipleri: `U-ETDS ✓` `NCTS ✓` `GVMS ⏳` — hepsinde ⓘ tooltip
- Filtre: active / planned / completed / delayed
- **Drivers:** `Name` `Licences` `Hours remaining` `Status` `Current vehicle` `Tacho last download`
- AETR sürüş saati barı; takograf gecikme uyarısı (>28 gün)

**Bitti sayılır:** Faz 3'te oluşturulan sefer burada zinciriyle görünür.

**Gösterim:** *"Az önce oluşturduğumuz sefer, beyanlarıyla birlikte burada."*

**Kesme çizgisi:** Drivers ayrı ekran yerine drawer sekmesi.

---

### Faz 7 · Koridor haritası ve canlı simülasyon — 80 dk

**Amaç:** İlk 10 saniyenin görsel kancası.

**Yapılacak**

- Stilize **inline SVG** TR–AB–UK koridoru (dış harita servisi CSP'de engelli)
- Gerçek koridorlar: İstanbul→Köstence→Dover · Mersin→Trieste · Ambarlı→Rotterdam ·
  Bursa→Calais→Birmingham
- Araç pinleri, durum renkli; tıklayınca drawer
- Ticker: pozisyonlar ilerler, ETA kayar, ~20 sn'de bir gecikme uyarısı düşer
- `prefers-reduced-motion` desteklenir — hareket kapanır, veri kalır
- Sekme arka plandayken `visibilitychange` ile durur

**Bitti sayılır:** Sayfa açık bırakılınca gözle görülür şekilde "yaşıyor".

**Gösterim:** *"Filo gerçekten hareket ediyor; uyarılar kendiliğinden düşüyor."*

**Kesme çizgisi:** Ticker kapatılıp statik harita bırakılır.

---

### Faz 8 · Rehberli tur — 50 dk

**Amaç:** HR'ın kaybolmaması.

**Yapılacak**

- Üst barda `▶ Play story` butonu
- 5 adım = yukarıdaki demo anlatısı; her adım ilgili route'a gider, ilgili öğeyi vurgular
- Baloncuk: 1 cümle benefit dili + `Skip` / `Next` + `2/5` sayacı
- `Esc` çıkar; tamamlanınca `Replay` sunar
- Uzman izleyici tek tıkla atlar — engel değil, rampa
- Vurgu için spotlight overlay (`box-shadow` deliği), ayrı kütüphane yok

**Bitti sayılır:** Hiç yönlendirilmemiş biri turu bitirince ürünün ne yaptığını anlatabiliyor.

**Gösterim:** *"Linki tıklayan herkes hikâyeyi 90 saniyede alıyor."*

**Kesme çizgisi:** 5 adım → 3 adım (1, 3, 4).

---

### Faz 9 · Cila, erişilebilirlik, metin — 65 dk

**Amaç:** Demoyu "yapılmış" değil "bitmiş" göstermek.

**Yapılacak**

- Klavye: mantıklı Tab sırası, `/` arama, `Esc` drawer/tur, `focus-visible` ring (`#4d65ff`)
- Responsive: 3 kırılım; dar ekranda tablo → kart listesi; yatay scroll asla body'de değil
- Koyu tema denetimi: her token iki temada da tanımlı, `body` arka planı açık token
- **Metin geçişi:** her etiket sonuç mu söylüyor? Yarısı atılabilir mi?
- Jargon tooltip'leri: U-ETDS, NCTS, GVMS, ADR, O-Licence, MOT, AETR, tacho
- Durum renklerinin kontrast kontrolü; renk tek başına bilgi taşımıyor denetimi
- `aria-label`, `role`, canlı bölge duyurusu (toast)

**Bitti sayılır:** Fareye hiç dokunmadan ana akış baştan sona tamamlanabiliyor.

**Gösterim:** *"Klavyeyle, koyu temada, telefonda — hepsinde aynı ürün."*

---

### Faz 10 · Gerekçe bölümü ve yayın — 40 dk

**Amaç:** Link tanımadık kişilere gidecek; kararların arkasındaki düşünce görünür olsun.

**Yapılacak**

- Sayfa sonunda **katlanır "Design rationale"** bölümü: neden filo modülü, neden bu IA,
  neden U-ETDS, neden own/subcontracted ayrımı, neyi bilerek yapmadım
- `Concept · Demo data` rozeti görünür ve açık — resmî Modaltrans ürünü değil
- Artifact yayını: başlık, favicon, açıklama
- **Uçtan uca duman testi:** 5 adımlı anlatı yayınlanmış URL üzerinde baştan sona koşulur

**Bitti sayılır:** Yayınlanmış link temiz bir tarayıcıda açılıp hikâye eksiksiz izlenebiliyor.

---

## Kesme merdiveni

Geriye düşülürse bu sırayla kesilir:

1. Vehicles toplu işlem çubuğu
2. Drawer'daki Costs grafiği → statik rakam
3. Drivers ayrı ekranı → drawer sekmesi
4. Canlı simülasyon ticker'ı → statik harita
5. Rehberli tur 5 adım → 3 adım

**Asla kesilmez:** Assign akışı · Overview attention list · boş durumlar · `U-ETDS Filed ✓` çipi.

---

## Doğrulama

Sunucu/test koşucusu yok — tarayıcıda elle doğrulanır.

**1 · Yerel duman testi** — `fleet-management-demo.html` doğrudan tarayıcıda açılır.

**2 · Ana akış (kabul testi)**

- Overview'da `3 road legs awaiting assignment` görünüyor mu?
- Tıkla → atama ekranı; araçlar uygunluğa göre mi sıralı, gerekçe satırı var mı?
- Sürücü saati yetersiz aracı seç → `Assign` **kilitli** mi? Öneriyi kabul et → açılıyor mu?
- Onayla, sonra **altı iddiayı tek tek doğrula**: araç durumu · sefer zinciri ·
  `U-ETDS Filed ✓` · maliyet · CO₂e · Overview sayacı
- `Undo` → altısı da geri alınıyor mu?

**3 · İkincil akışlar** — belge yenileme sayacı düşürüyor mu; filtreyi sıfıra indir → boş durum;
20 sn bekle → simülasyon uyarısı düşüyor mu.

**4 · Kalite geçişleri**

- Klavye: `Tab` / `/` / `Esc` ile ana akış fare olmadan tamamlanır
- Tema: açık, koyu, sistem (üçü de)
- Genişlik: 375 / 768 / 1440 px — body'de yatay scroll yok
- `prefers-reduced-motion: reduce` → hareket durur, veri kalır
- Konsol hatasız

**5 · Yayın sonrası** — publish edilen URL temiz tarayıcıda açılır, tur baştan sona koşulur,
font ve SVG harita doğru yükleniyor mu bakılır (CSP sürprizleri burada çıkar).
