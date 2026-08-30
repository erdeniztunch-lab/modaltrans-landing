# Modaltrans — Fleet Management Modülü (Konsept Demo)

> **Bu dosya nedir?** Mülakat için hazırlanacak, backend'siz ama çalışır görünen
> "Fleet Management" ürün demosunun tasarım ve implementasyon referansı.
> Şirketin iş/strateji analizi için `modaltrans-knowledge.md` dosyasına bak — bu dosya onun
> yerine geçmez, üstüne inşa eder.
>
> Durum: **karar aşaması tamam, kod yazılmadı.**
> Son güncelleme: 2026-08-30

---

## 0. Proje hedefi ve kısıtlar

| | |
|---|---|
| **Amaç** | Mülakatta gösterilecek portfolyo çalışması. Link başkalarına da gidebilir. |
| **Süre** | 1 gün |
| **İzleyici** | Birincil: HR (teknik olmayan). İkincil: link üzerinden tasarım/ürün tarafı. |
| **Dil** | Arayüz **İngilizce** |
| **Backend** | Yok. Tüm state client-side, deterministik seed veri. |
| **Teslim** | Tek dosya çalışan HTML → Artifact olarak yayınlanıp paylaşılabilir link |
| **Etik sınır** | Resmî bir Modaltrans ürünü değil. Sayfada görünür `Concept · Demo data` etiketi olacak. |

**Neden Filo Yönetimi?**
Modaltrans'ın mega menüsünde `Filo Yönetimi — Yakında` yazıyor ve entegrasyonlar sayfasında
`Fleet Management — Coming Soon` olarak listeleniyor. Yani:

1. Kıyaslanacak mevcut bir tasarım yok — sadece muhakeme değerlendirilir.
2. Şirketin kendi yol haritasına yapılmış somut bir katkı.
3. Var olan bir tasarım sistemini genişletme yeteneğini test ediyor (sıfırdan yapmaktan zor ve daha değerli).

---

## 1. Modaltrans bağlamı (özet)

Freight forwarder, BCO ve gümrük müşavirleri için uçtan uca lojistik SaaS.
Kuruluş 2015 (ilk ürün Nimbo), CEO Faruk Çelik, ~26–50 kişi.
Ofisler: İstanbul (Orhantepe, Kartal) + Londra (N14 6HF).
Site Webflow üzerinde; GSAP ScrollTrigger + Swiper + Finsweet Attributes.

**Mevcut 6 modül:** Freight · Finance · Advanced CRM · Customs · Warehouse · Reporting

**Çözümler (10):** Container Tracking, Carbon Tracking, Client Portal, e-AWB, Smart Documentation,
Mobile App, Financial Integrations, User Permissions, Courier Services, 24/7 Support

**AI katmanı:** "Genie" — her modülde AI var, filo modülünde de olmalı yoksa sistem dışı durur.

**Ölçek iddiası:** 300+ şirket · 15+ ülke · 3.000+ günlük aktif kullanıcı ·
2.5M+ booking · 4.8M+ fatura · 600K+ gümrük beyannamesi

### 1.1 Entegrasyonlar — filo için kritik olanlar

| Entegrasyon | Ne işe yarar | Filo için anlamı |
|---|---|---|
| **Arvento** | TR araç takip / telematik | **Telemetri kaynağı — zaten var** |
| **Mobiliz** | TR araç takip / telematik | **Telemetri kaynağı — zaten var** |
| **Motive** | ELD/telematik, "fleet & logistics data sync" | **Telemetri kaynağı — zaten var** |
| **U-ETDS** | TR zorunlu elektronik sefer/yük bildirimi | **Sefer nesnesi bunu besler** |
| **DFDS ENS** | Ro-Ro feribot + ENS beyanı | Sefer zincirinde feribot bacağı |
| **NCTS / Oregon** | Transit beyanı (TR, UK, DE, 20 ülke) | Sefer zincirinde transit bacağı |
| **HMRC CDS / GVMS** | UK ithalat/ihracat + kapı geçiş | Sefer zincirinde UK bacağı |
| **Bilge** | TR gümrük platformu | Beyan tarafı |
| **Pledge** | Karbon ölçümü | km → CO₂e akışı |
| **Xero / Sage / QuickBooks / Zoho / Logo / eFinans** | Muhasebe | Sefer maliyeti → fatura |
| **Shipsgo** | Konteyner takibi | Deniz tarafı (filo dışı) |

> 🔑 **En önemli çıkarım:** Modaltrans zaten üç ayrı araç takip sistemiyle entegre
> (Arvento, Mobiliz, Motive) ve U-ETDS'e sefer bildirimi yapıyor — **ama bir filo modülü yok.**
> Telemetri akıyor, onu operasyona çeviren katman eksik.
>
> **Filo modülü bir takip ürünü değil, takip verisinin üstündeki operasyon katmanıdır.**

---

## 2. Tasarım sistemi (siteden çıkarılan gerçek tokenlar)

Kaynak: `modal-trans.webflow.shared.db9d747ba.min.css`

### 2.1 Renk — OKLCH tabanlı

```css
/* Marka — turuncu/kızıl */
--brand-050: oklch(.9898 .0107 27.63);
--brand-100: oklch(.9679 .0106 27.48);
--brand-200: oklch(.8839 .0527 27.46);
--brand-300: oklch(.7798 .108  31.86);
--brand-500: oklch(.6399 .189  32.51);   /* ≈ #F05322 — ana marka rengi */
--brand-600: oklch(.5932 .172  32.23);
--brand-700: oklch(.5168 .143  32.52);
--brand-800: oklch(.4438 .114  32.59);
--brand-900: oklch(.3801 .091  32.88);
--brand-fc5000: #FC5000;

/* Nötr — soğuk/mavimsi gri */
--gray-050: oklch(.9818 .002 250.9);
--gray-100: oklch(.9571 .004 249.4);
--gray-150: oklch(.94   .004 240);
--gray-300: oklch(.9019 .004 249.7);
--gray-500: oklch(.7511 .004 249.3);
--gray-600: oklch(.6136 .004 250.4);
--gray-800: oklch(.4079 .004 250.7);
--gray-900: oklch(.342  .002 254.4);
--gray-950: oklch(.1804 .013 259.6);

/* Siyah / beyaz skalaları */
--black-800: oklch(.2461 .005 251.3);
--black-850: oklch(.2285 .007 253.9);
--black-900: oklch(.1917 .007 254.8);
--black-950: oklch(.1804 .013 259.6);
--white-050: oklch(.9956 0 0);
--white-100: oklch(.9818 .002 250.9);
--white-200: oklch(.9571 .004 249.4);
--white-300: oklch(.9383 .004 250.3);

/* İkincil vurgu mavi */
--accent-blue: oklch(.596 .124 263.7);
--focus-ring:  #4d65ff;   /* outline: .125rem solid, offset .125rem */
```

**İmza gradientler** (sitede 19 isimlendirilmiş var, demoda kullanacaklarımız):

```css
--gradient-dusk-horizon:   linear-gradient(in oklab to top,
   oklch(.933 .015 259), oklch(.865 .038 261.2), oklch(.596 .124 263.7), oklch(.208 .059 265.2));
--gradient-deep-ocean:     linear-gradient(180deg in oklab,
   oklch(.938 .004 250.3) 5%, oklch(.596 .124 263.7) 40%, oklch(.180 .013 259.6) 90%, oklch(0 0 0));
--gradient-ocean-fire:     linear-gradient(90deg in oklab, oklch(.596 .124 263.7), oklch(.64 .189 32.51));
--gradient-midnight-depth: linear-gradient(in oklab to bottom, oklch(.228 .007 253.9), oklch(.180 .013 259.6));
--gradient-sunset-glow:    linear-gradient(135deg in oklab,
   oklch(.78 .108 31.9), oklch(.64 .189 32.5), oklch(.517 .143 32.5));
```

### 2.2 Tipografi

- **Aile:** `General Sans Variable` (Indian Type Foundry / Fontshare)
- ⚠️ Fontshare CDN, Artifact CSP'sinde **engelli**. Çözüm: variable TTF'i base64 data URI olarak
  dosyaya göm (~270KB, 16MB limitinin çok altında). Yedek stack:
  `-apple-system, "Segoe UI", sans-serif`
- **Ölçek (fluid, clamp):**

```css
--fs-xs:   .75rem;
--fs-sm:   .875rem;
--fs-base: 1rem;
--fs-lg:   clamp(1rem,     .9rem  + .5vw,   1.125rem);
--fs-xl:   clamp(1.125rem, .93rem + .9vw,   1.5rem);
--fs-2xl:  clamp(1.5rem,   1.2rem + 1.5vw,  2rem);
--fs-3xl:  clamp(1.875rem, 1.4rem + 2.3vw,  2.5rem);
--fs-4xl:  clamp(2rem,     1.25rem+ 3.75vw, 3.75rem);
```

- Root font-size viewport'a göre `calc()` ile ölçekleniyor (sitede böyle) — demoda da uygula.
- `-webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;`

### 2.3 Uzay, köşe, gölge

```css
--size-xs: .25rem;  --size-s: .5rem;    --size-m: 1rem;    --size-l: 1.5rem;
--size-xl: 2rem;    --size-2xl: 3rem;   --size-3xl: 4rem;  --size-4xl: 5rem;  --size-huge: 6rem;
--padding-global: clamp(1.5rem, 6vw, 4rem);

--container-small:  52rem;
--container-medium: 68rem;
--container-large:  80rem;

/* Radius — sitede baskın olarak 1rem (55 kullanım) */
--radius-tiny: .25rem;  --radius-s: .5rem;   --radius-m: .75rem;
--radius-l: 1rem;       --radius-xl: 1.5rem; --radius-pill: 99rem;

/* Marka gölgesi */
box-shadow: 0 4px 12px 2px #f053221a;   /* rgba(240,83,34,.10) */
```

### 2.4 Sitenin görsel imzaları (demoda tekrarlanacak)

- Koyu gradient hero + `rounded-bottom` köşeler
- Scroll'da `is-inverted` sınıfı alan navbar
- `glassy-shadow` scrim: `mask-image: linear-gradient(to top, black 80%, transparent 100%)`
- Beyaz kart: `background-color-secondary` + `border-color-lightgray` + `box-shadow` + `rounded-small`
- Turuncu dairesel ok butonu (`bi-arrow-up-right`) kart köşesinde
- Bootstrap Icons (`bi-*`) ikon seti

---

## 3. Konumlandırma tezi

> **Fleet Management doesn't just track your trucks — it turns every trip into a
> compliant, costed, visible leg of the shipment your customer already sees.**

Modül üç şeyi sırasıyla yapar:

1. **Assign** — doğru aracı doğru sevkiyata, uyum kontrolüyle
2. **Declare** — U-ETDS / NCTS / GVMS otomatik beyan
3. **Cost** — sefer maliyeti sevkiyat P/L'sine, km emisyona

### 3.1 Neyi *değil*

- ❌ GPS/telematik ürünü değil (Arvento/Mobiliz/Motive'in işi)
- ❌ Şehir içi son-kilometre dağıtım değil
- ❌ Sürücü davranış skorlaması / kamera değil
- ❌ Rota optimizasyon motoru değil

### 3.2 Neden bu doğru

Modaltrans'ın tüm satış argümanı **"tek platform"**. Ayrı duran güzel bir filo ekranı
sadece "UI yapabiliyor" der. Değer, modülün diğer beş modüle bağlandığı yerde.

---

## 4. Bağlamsal gerçekler — bunlar demoyu "gerçek" yapar

### 4.1 Koridor: Türkiye ↔ Avrupa ↔ UK, Ro-Ro'lu TIR

Entegrasyonlardan okunuyor (DFDS ENS, NCTS, Oregon, HMRC CDS/GVMS).
Bu şehir içi dağıtım değil, uluslararası karayolu taşımacılığı. Sefer bir çizgi değil, zincir:

```
Loading → TR Customs (Bilge) → Ro-Ro Ferry (DFDS) → EU Transit (T1/NCTS)
        → UK Border (GVMS) → Delivery
```

### 4.2 Hibrit filo: öz mal + taşeron

Forwarder yazılımları asset-light (taşeron), filo yazılımları asset-heavy (öz mal) kurgulanır.
Modaltrans müşterisi **ikisi birden** — tipik tablo: 15 kendi TIR'ı, pikte 40 taşeron çeker.

→ Araç listesinde **Own Fleet / Subcontracted** ayrımı zorunlu. Çoğu aday bunu kaçırır.

### 4.3 U-ETDS — Türkiye'ye özgü, filo-doğal yükümlülük

Ulaştırma Elektronik Takip ve Denetim Sistemi. K1/K3 yetki belgeli her taşımacı:

- **her seferi başlamadan önce** sisteme bildirmek zorunda
- sefer iptal/tamamlanamama durumunda **30 dakika içinde** bildirim

Demoda sefer oluşturulunca `U-ETDS: Filed ✓` chip'i belirmeli. Tek başına konuşulacak detay.

### 4.4 Uyum matrisi — çift pazar

| Türkiye | UK |
|---|---|
| K1 / K3 Yetki Belgesi | O-Licence |
| Muayene | MOT + PMI |
| ADR (tehlikeli madde) | ADR |
| Egzoz emisyon | — |
| Trafik sigortası / Kasko | Insurance |
| SRC belgesi (sürücü) | Driver CPC (35h/5yıl) |
| **U-ETDS sefer bildirimi** | **Tachograph** |
| — | Walkaround check (O-Licence şartı) |
| — | DVSA / OCRS skoru |

**Takograf indirme kadansı (UK):** sürücü kartı ≤28 gün, araç ünitesi ≤90 gün, 12 ay saklama.

### 4.5 Sektör benchmark'ları — mock veri bunlara oturacak

| Metrik | Değer | Not |
|---|---|---|
| AB ortalama kamyon maliyeti | **€1.42 / km** | 2025 |
| İyi filolarda yakıt | **9.8 L / 100km** | ağır araç |
| İyi operatörlerde araç kullanım oranı | **> %78** | utilization |
| Forwarder brüt marjı | %3–8 | dosya bazında |

> Uydurma sayı kullanma. Her rakam bu bantların içinde olsun.

---

## 5. UX ilkeleri (araştırmadan)

1. **10 saniye kuralı** — Girişten "hangi araç ilgi istiyor" cevabına 10 saniyede varılmalı.
2. **Katmanlı KPI** — 4 birincil KPI (glance) → 4–6 tanı metriği (bir tık) → detay.
   40 KPI'ı eşit ağırlıkta gösteren dashboard işlevsizdir.
3. **Bakım üç kovaya ayrılır** — Overdue / To be scheduled / Scheduled.
4. **Rol bazlı görünüm** — dispatch: sefer ilerlemesi + sürüş saati.
   finance: kullanım oranı + araç başına gelir. compliance: belge süreleri.
5. **Uyum bir "güvenlik ağı"dır** — Modaltrans'ın gümrük sayfasındaki kendi dili:
   *"Sistemimiz uyumluluk güvenlik ağınızdır."* Filoya bu dili taşı.

---

## 6. Bilgi mimarisi

```
Fleet Management
├─ Overview      ← 4 KPI + attention list + corridor map + Genie insight
├─ Vehicles      ← [Own Fleet | Subcontracted] · asıl tablo
├─ Trips         ← sefer yaşam döngüsü + beyan durumları
└─ Drivers       ← sürüş saatleri, belgeler, uygunluk
```

**Ayrı sayfa OLMAYACAKLAR:**

- **Maintenance** → Overview'da uyarı + Vehicles'ta filtre + Vehicle drawer'da sekme
- **Compliance** → Vehicle/Driver drawer'da sekme + Overview uyarısı

Gerekçe: 1 günde 6 sığ sayfa yerine 4 dolu sayfa. Ölü nav item, demoyu demodan çıkarır.

**Vehicle Detail = slide-over drawer**, ayrı sayfa değil.
Üç yerden açılır (Vehicles, Trips, Drivers) → hem ucuz hem uygulama hissi güçlü.

---

## 7. Veri modeli

```
Vehicle
  id, plate (TR "34 ABC 123" | UK "AB24 XYZ"), type, ownership: own|subcontracted,
  subcontractor?, status: available|on_trip|maintenance|out_of_service,
  currentDriverId?, currentTripId?, position {lat,lng,updatedAt}, odometerKm,
  telemetrySource: arvento|mobiliz|motive,
  documents: [{ type, number, validUntil, status }],
  maintenance: [{ type, dueKm|dueDate, status: overdue|due|scheduled|done }],
  costs: { fuelPerKm, tollsPerKm, avgCostPerKm }

Driver
  id, name, nationality, licences: [{ type, validUntil }],   // SRC | CPC | ADR | Passport | Visa
  hoursRemaining (AETR), status: available|driving|rest|off,
  currentVehicleId?, tachoLastDownload

Trip  (= "Sefer")
  id, ref, shipmentId, vehicleId, driverId,
  origin, destination, plannedStart, plannedEnd,
  legs: [{ type: loading|customs_tr|ferry|transit_eu|border_uk|delivery,
           status, eta, actual, ref? }],
  declarations: { uetds, ncts, ens, gvms },   // each: not_required|draft|filed|accepted
  cost: { fuel, tolls, ferry, perDiem, total, currency },
  co2eKg, distanceKm

Shipment  (Navlun'dan gelen, salt okunur)
  id, ref, customer, mode: road, cargo, weight, adr?, incoterm,
  pickupWindow, deliveryWindow, roadLegStatus: unassigned|assigned|in_transit|delivered
```

---

## 8. ⭐ Ana akış — demonun omurgası

### "Assign a vehicle to an unassigned road leg"

**Adım 1 · Tetikleyici**
Overview → attention list → `3 road legs awaiting assignment` → tıkla

**Adım 2 · Eşleştirme ekranı**
Solda atanmamış road leg'ler (Navlun'dan), sağda uygun araçlar —
**uygunluğa göre sıralı, alfabetik değil.** Sıralama kriterleri:
konum yakınlığı · müsaitlik penceresi · ADR yeterliliği · belge geçerliliği · sürücü kalan saati

**Adım 3 · Uyum kontrolü — kritik an**
Araç seçilince yan panelde canlı doğrulama çalışsın:

```
✅  ADR certificate    valid until 12 Mar 2027
✅  O-Licence          valid
⚠️  MOT                expires in 11 days — trip ends 4 days before, OK
❌  Driver hours       3h45m remaining, leg requires 6h20m
    → Suggest: assign co-driver, or M. Yılmaz (9h available)
```

Kırmızı varken "Assign" butonu kilitli; öneriyi kabul edince açılır.

**Adım 4 · Onay → dalga etkisi**
Tek tıkla şunların hepsi olsun ve **ekranda görünsün**:

| Nereye | Ne olur |
|---|---|
| Vehicle | `Available` → `On trip` |
| Trip | Zincir oluşur: Loading → TR Customs → Ro-Ro → NCTS → GVMS → Delivery |
| **U-ETDS** | Bildirim taslağı → `Filed ✓` |
| Finance | Tahmini maliyet (yakıt + HGS + feribot + harcırah) → sevkiyat P/L |
| Carbon | km × araç tipi → CO₂e → Carbon Tracking |
| Client Portal | Müşteri zaman çizelgesine olay düşer |
| Overview | KPI sayaçları güncellenir, uyarı listeden çıkar |

**Adım 5 · Toast + Undo**

> Bu tek akış Modaltrans'ın **altı sütununa da** dokunuyor.
> Demonun finali bu. Mülakatta anlatılacak hikâye bu.

---

## 9. İkincil akışlar

1. **Belge yenileme** — Overview uyarısı → araç drawer'ı → belge yenile → uyarı kaybolur, sayaç düşer
2. **Canlı takip** — Haritada araç ilerler, ETA kayar, gecikme uyarısı düşer (timer ile)
3. **Genie sorusu** — Hazır soru çipleri: *"Which vehicles are underutilized this month?"*
4. **Boş durum** — Filtreyi hiç sonuç kalmayacak kadar daralt → tasarlanmış empty state

---

## 10. "Çalışır gibi" hissini veren detaylar (öncelik sırasıyla)

1. **Empty / loading / error durumları** — en yüksek getirili detay. Sahtelik hissi eksik
   durumlardan gelir, "güzel olmamaktan" değil.
2. **Zaman geçmesi** — araçlar hareket etsin, ETA değişsin, ~20sn sonra bir uyarı düşsün
3. **Mutasyonun her yere yansıması** — atama sonrası liste + dashboard sayacı + drawer + toast,
   hepsi aynı anda güncellensin. Tek yerde değil.
4. **Klavye + odak** — Tab gezinme, `/` aramaya odak, `Esc` drawer kapatma, focus-visible ring
5. **Responsive + açık/koyu tema** — OKLCH token sistemi zaten hazır, tema neredeyse bedava
6. **Undo** — her yıkıcı/önemli aksiyonda

---

## 11. Ekran spec'leri

### 11.1 Overview

- **Hero şeridi:** koyu `gradient-dusk-horizon`, `rounded-bottom` — site imzası
- **4 birincil KPI (glance layer):**
  `Fleet utilization %` · `Cost per km` · `Vehicles needing attention` · `Active trips`
  Her biri: değer + trend oku + mikro sparkline
- **Attention list** — en önemli bileşen. Gruplu:
  `Awaiting assignment (3)` · `Documents expiring (2)` · `Maintenance overdue (1)` · `Delayed trips (1)`
  Her satır tıklanabilir ve ilgili yere götürür.
- **Corridor map** — stilize inline SVG (TR–AB–UK). Araç pinleri, tıklayınca drawer.
  ⚠️ Dış harita servisi CSP'de engelli; zaten SVG daha "ürün" duruyor.
- **Genie insight kartı** — 1–2 cümle, aksiyon linkli:
  *"3 vehicles' inspections expire within 14 days; 2 of them are assigned to trips departing next week."*

### 11.2 Vehicles

- Üstte tab: `Own Fleet (18)` | `Subcontracted (24)`
- Toolbar: arama (`/` kısayolu) · filtreler (status, type, ADR, document status, base) · sıralama
- Kolonlar: `Plate` `Type` `Ownership` `Driver` `Current trip` `Location` `Status`
  `Next maintenance` `Doc status` `Cost/km`
- Satır seçimi + toplu işlem (örn. "Export", "Schedule maintenance")
- Durum çipleri: renk + ikon + metin (sadece renk değil — erişilebilirlik)
- Satıra tıkla → **Vehicle drawer**

### 11.3 Vehicle drawer

Sekmeler: `Overview` · `Compliance` · `Maintenance` · `Costs` · `Trips` · `Telemetry`

- **Compliance:** belge tablosu, kalan gün rozetli, yenile aksiyonu
- **Maintenance:** üç kova — Overdue / Due / Scheduled
- **Costs:** yakıt + geçiş + toplam, km başına, basit grafik
- **Telemetry:** `Source: Arvento` chip'i, son güncelleme zamanı, hız/konum/motor saati
  → *bu chip, entegrasyon farkındalığını gösteren en ucuz ve en etkili detay*

### 11.4 Trips

- Liste + sefer zinciri görselleştirmesi (stepper)
- Her sefer satırında beyan durumu çipleri: `U-ETDS ✓` `NCTS ✓` `GVMS ⏳`
- Filtre: aktif / planlanan / tamamlanan / gecikmeli

### 11.5 Drivers

- Kolonlar: `Name` `Licences` `Hours remaining` `Status` `Current vehicle` `Tacho last download`
- Sürüş saati bar'ı (AETR), takograf indirme gecikmesi uyarısı

---

## 12. Mock veri kuralları

- **Plakalar:** TR `34 ABC 123`, `06 TR 4571`, `35 KLM 890` · UK `AB24 XYZ`, `LM71 KDF`
- **Araç tipleri:** Tractor + Curtainsider · Tractor + Reefer · Container chassis ·
  Box van · Tipper
- **Rotalar (gerçek koridorlar):**
  İstanbul → Köstence → Dover · Mersin → Trieste · Ambarlı → Rotterdam ·
  Gebze → Sofya → Belgrad · Bursa → Calais → Birmingham
- **Taşeronlar:** gerçekçi ama uydurma şirket adları (gerçek şirket adı kullanma)
- **Sürücü adları:** TR + UK karışık (çift pazar yansısın)
- **Para birimi:** EUR birincil, TRY/GBP ikincil — sitedeki gibi çok para birimli
- **Deterministik seed** — her yüklemede aynı veri gelsin, demo tekrarlanabilir olsun

---

## 13. Dil ve metin kuralları

- **Arayüz İngilizce.** Sitenin Türkçe tarafındaki çeviri hataları burada tekrarlanmayacak.
- Modül adı: **Fleet Management** — mevcut adlandırma kalıbına uyuyor
  (Freight Management, Finance Management, Customs Management, Warehouse Management)
- Yerel terimler İngilizce metinde de korunur: `U-ETDS`, `NCTS`, `GVMS`, `T1`, `ADR`, `O-Licence`, `MOT`
- Boş durum metinleri yardımcı olsun, özür dilemesin
- Tek isim, tek kavram — sitede `7/24 Canlı Destek` / `7/24 Gerçek Destek` / `Canlı Sohbet`
  gibi üçlü isim karmaşası var; burada asla olmayacak

---

## 14. Teknik kısıtlar (Artifact ortamı)

| Kısıt | Etki | Çözüm |
|---|---|---|
| Dış görsel/tile/fetch engelli | Harita servisi kullanılamaz | Inline SVG harita |
| Fontshare CDN engelli | General Sans yüklenemez | TTF'i base64 data URI olarak göm |
| Sadece belirli CDN'ler açık | cdnjs, jsdelivr/npm, code.jquery, cdn.tailwindcss | Gerekirse cdnjs, sürüm pinli |
| Google Fonts açık | fonts.googleapis + gstatic | Yedek font oradan gelebilir |
| Sayfa ≤ 16MB | data URI'ler dahil | Font gömme sorun değil |
| `localStorage` çalışır | ama try/catch şart | Tema tercihi için kullan |
| Dış link ile dosya indirme engelli | CSV export gerçekten inmez | Export butonu koyma ya da toast ile sahtele |

---

## 15. Kapsam kararı

**İçeride**
Overview · Vehicles (own/subcontracted) · Vehicle drawer · Trips · Drivers ·
Assign akışı (uyum kontrolü dahil) · empty/loading durumları · responsive · açık+koyu tema ·
klavye erişimi · Genie kartı · `Concept · Demo data` etiketi

**Dışarıda**
Login · ayarlar · gerçek harita servisi · rota optimizasyonu · sürücü mobil uygulaması ·
çoklu dil (EN sabit) · gerçek export · safety scoring · IFTA · lastik/ceza/kaza takibi

---

## 16. Açık kararlar

| # | Karar | Durum |
|---|---|---|
| 1 | Overview'da **(a)** hareketli SVG koridor haritası mı, **(b)** aktif seferler zaman şeridi mi? | ⏳ Kullanıcıda. Öneri: **(a)** — 10 saniye kuralı + link tanımadık kişilere gidecek |
| 2 | General Sans gömülsün mü, yakın alternatif mi? | Öneri: **göm** |
| 3 | Yanına kısa bir "design rationale" bölümü eklensin mi? | Link paylaşılacağı için: **evet, sayfa sonunda katlanır bölüm** |

---

## 17. Kaynaklar

**Modaltrans**

- <https://modaltrans.com/tr/> · `/moduller` · `/cozumler` · `/entegrasyonlar` · `/hakkimizda`
- <https://modaltrans.com/integrations> — Arvento, Mobiliz, Bilge, Logo, eFinans, Vomsis doğrulaması
- CSS: `modal-trans.webflow.shared.db9d747ba.min.css`

**Filo yönetimi / UX**

- <https://heavyvehicleinspection.com/blog/post/modern-fleet-management-ui-ux-dashboard-kpis-guide>
- <https://www.superblocks.com/blog/fleet-management-dashboard>
- <https://pcssoft.com/products/tms/carrier/fleet-management/>
- <https://gomotive.com/products/>

**Regülasyon**

- <https://mdpgroup.com/blog/10-adimda-ulastirma-elektronik-takip-ve-denetim-sistemi-u-etds/>
- <https://www.kamyoon.com/blog/uetds-yuk-bildirimi>
- <https://fleetrabbit.com/blogs/post/fleet-management-software-uk>
- <https://www.fleetcheck.co.uk/fleetinsights/topics/tachograph-compliance-a-practical-guide-for-fleet-managers/>

**Sektör yapısı**

- <https://acropolium.com/blog/how-to-turn-custom-freight-forwarding-software-to-your-advantage/>
- <https://www.logifie.com/blog/freight-forwarder-vs-carrier-road-freight-europe>
