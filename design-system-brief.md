# Design System Brief — Modaltrans Fleet Management

> **Bu dosya nedir?** Claude Design'a verilecek talep dokümanı. Ne istediğimi, hangi
> problemleri çözmesi gerektiğini ve bana nasıl teslim edilmesi gerektiğini tanımlar.
>
> **Doküman ailesi**
> - [`modaltrans-knowledge.md`](modaltrans-knowledge.md) — şirket analizi
> - [`fleet-management-concept.md`](fleet-management-concept.md) — ürün kararları, ham tokenlar
> - [`phase-by-phase-implementation-plan.md`](phase-by-phase-implementation-plan.md) — inşa planı
> - [`fleet-management-demo.html`](fleet-management-demo.html) — Faz 0, ilk geçiş token katmanı
> - **bu dosya** — design system talebi
>
> Son güncelleme: 2026-08-30

---

## 1. Temel tez — bu bir çeviri işi

Modaltrans'ın sitesinden çıkardığım tokenlar **bir pazarlama sistemine ait**:
akışkan `clamp()` tipografi 3.75rem'e kadar, koyu gradient hero'lar, fotoğraf kartları,
her yerde `1rem` köşe, cömert boşluk.

Bizim yapacağımız şey bir **operasyon uygulaması**: yoğun tablo, çok durumlu satır,
hızlı tarama, klavye, dar sütunlar.

> **Pazarlama sistemini olduğu gibi ürüne uygularsak ürün şişer ve okunmaz.**
> 1rem padding'li tablo hücresi, 28px chip'te 1rem radius, tablo içinde akışkan tipografi
> — üçü de kırılır.

**Design system'in işi:** markayı tanınabilir tutarak ürün yüzeyine çevirmek.
Yeni bir marka icat etmek değil; mevcut markanın **ürün lehçesini** yazmak.

Başarı ölçütü: bir Modaltrans çalışanı ekranı görünce "bu bizim" desin,
bir dispatcher da günde 8 saat bakabilsin.

---

## 2. Çeviri kuralları (pazarlama → ürün)

Design system bu altı kararı vermeli ve gerekçelendirmeli.

| Konu | Sitede (pazarlama) | Üründe ne olmalı |
|---|---|---|
| **Tipografi** | `clamp()` akışkan, 3.75rem'e kadar | **Sabit** ürün ölçeği (12/13/14/16/20/24). Akışkan yalnızca sayfa başlığı ve hero'da. Tabloda akışkan tipografi hizayı bozar. |
| **Yoğunluk** | 1rem tabanlı bol boşluk | **4px temel grid.** Satır yüksekliği hedefi: rahat 44px, yoğun 36px. İki yoğunluk modu istiyorum. |
| **Radius** | Baskın `1rem` (55 kullanım) | **Boyuta bağlı rampa.** Küçük bileşen küçük köşe: chip 4px, buton/input 8px, kart 12–16px, drawer/modal 16px. |
| **Gradient** | 19 isimli gradient, her yerde | **Sadece 2 yerde:** Overview hero şeridi ve koridor haritası zemini. Veri arkasında asla. |
| **Gölge** | Marka renkli yumuşak gölge | **3 kademeli elevation:** kart (neredeyse düz) → popover/drawer → modal. Marka renkli gölge sadece birincil butonda. |
| **Turuncu** | Marka rengi, dekoratif | **Yalnızca aksiyon ve seçili durum.** Dekoratif kullanım yok — çünkü statü rengiyle çakışıyor (bkz. §3.1). |

---

## 3. Renk

### 3.1 ⚠️ Çözülmesi gereken gerçek problem

Marka rengi `oklch(.6399 .189 32.51)` ≈ `#F05322` — **turuncu-kızıl**.
Klasik "danger" kırmızısı da aynı hue bölgesinde. Faz 0'da bu çakışmayı yaşadım.

**Design system'den beklediğim karar:** turuncu ve kırmızı bir arada, aynı ekranda,
tereddütsüz ayrılabilir olmalı. Muhtemel yollar (seçim design system'in):

- Danger'ı hue olarak uzaklaştır (~15–20 crimson) **ve** doygunluk/açıklıkta ayır
- Danger'ı yalnızca dolgu değil kenarlık+ikon kombinasyonuyla taşı
- Marka turuncusunu ürün içinde yalnızca dolu butonda kullan, statüde asla

Hangisi seçilirse seçilsin: **yan yana örnek göster.** Bir tabloda `Overdue` rozeti ile
`Assign` birincil butonu aynı satırda dursun ve ayrışsın.

### 3.2 Semantik katman şart

Ham skala (brand-050…900, gray-050…950) doğrudan kullanılmayacak.
Aradaki **rol katmanı** design system'in ana çıktısı:

```
bg · surface · surface-2 · surface-3 · rail
border · border-strong
text · text-2 · text-muted · text-inverse
accent · accent-hover · accent-soft · on-accent
ok-fg/bg · warn-fg/bg · bad-fg/bg · info-fg/bg · neutral-fg/bg
focus-ring
shadow-card · shadow-pop · shadow-modal
```

Koyu tema **rol katmanında** çözülmeli, bileşende değil. Bileşen CSS'i tek olmalı.

### 3.3 Koyu tema kuralları

- Her rol iki temada da tanımlı; hiçbir renk yalnızca bir blokta yaşamıyor
- Koyu temada gölge yerine **yüzey açıklığı** hiyerarşi taşır
- Statü renkleri koyu temada ayrıca tanımlanır (açık temanın renkleri koyuda okunmaz)
- Marka turuncusu koyu zeminde parlar — hover için daha **açık** ton gerekir

---

## 4. ⭐ Durum taksonomisi — en değerli çıktı

Üründe **beş ayrı statü boyutu** var. Her biri kendi renklerini seçerse ekran karmaşaya döner.
Design system bunları **tek bir semantik haritaya** oturtmalı.

| Boyut | Değerler |
|---|---|
| **Vehicle status** | `available` · `on trip` · `maintenance` · `out of service` |
| **Document status** | `valid` · `expiring soon` · `expired` |
| **Maintenance** | `scheduled` · `due` · `overdue` |
| **Trip status** | `planned` · `active` · `delayed` · `completed` |
| **Declaration** | `not required` · `draft` · `filed` · `accepted` |

**İstediğim teslimat:** aşağıdaki gibi doldurulmuş tek bir tablo —

```
Değer          → Semantik  → Token       → İkon        → Etiket metni
available        success     ok-*          check-circle  "Available"
on trip          info        info-*        truck         "On trip"
expiring soon    warning     warn-*        clock         "Expires in 11d"
overdue          danger      bad-*         warn-triangle "Overdue"
draft            neutral     neutral-*     file          "Draft"
...
```

**Kurallar:**
- Renk asla tek başına bilgi taşımaz → her zaman **renk + ikon + metin**
- Aynı semantik, farklı boyutlarda aynı görünür (`expiring` ile `due` aynı sarıysa aynı görünmeli)
- `not required` görsel olarak sessizleşir, hata gibi görünmez
- Sayı içeren rozetler (`Expires in 11d`) sabit genişlikte titremez

---

## 5. Tipografi ve yoğunluk

- **Aile:** General Sans Variable (gömülü, CDN yok). Yedek: `-apple-system, "Segoe UI"`
- **Ürün ölçeği:** sabit adımlar — 12 / 13 / 14 / 16 / 20 / 24 px karşılıkları
- **Sayılar:** `font-variant-numeric: tabular-nums` — tabloda ve KPI'da zorunlu
- **Plaka** gibi tanımlayıcılar: hafif harf aralığı + `600` ağırlık, ayrı bir `.identifier` stili
- Ağırlık kullanımı: 400 gövde · 500 etiket/nav · 600 başlık ve vurgu. **700 kullanılmayacak**
- Satır uzunluğu: gövde metni 70 karakteri geçmez

**İki yoğunluk modu istiyorum:** `comfortable` (varsayılan) ve `compact`.
Aralarındaki fark yalnızca padding ve satır yüksekliği olmalı — tipografi değişmemeli.

---

## 6. Komponent envanteri

Öncelikli. **P0 olmadan uygulama çalışmaz**, P2 varsa iyi olur.

### P0 — Primitifler

| Bileşen | İstenen varyant ve durumlar |
|---|---|
| **Button** | primary · secondary · ghost · danger × sm/md × icon-only. Durumlar: default, hover, active, focus-visible, disabled, **loading** |
| **Input** | text · search (öndeki ikon + `/` kısayol ipucu) · number. Durumlar: default, focus, error, disabled, with-value |
| **Select / Dropdown** | tetikleyici + menü + seçili işaret + gruplu liste |
| **Checkbox / Radio** | indeterminate dahil (tablo başlık seçimi için) |
| **Chip / Badge** | statü varyantları (§4) · sayaç · kaldırılabilir filtre chip'i · outline |
| **Tooltip** | jargon açıklamaları için — `U-ETDS ⓘ`. Klavyeyle de açılmalı |
| **Icon** | Bootstrap Icons (site de onu kullanıyor). Boyut: 14/16/20 |
| **Skeleton** | satır, kart, tile varyantları |
| **Focus ring** | tek token, her bileşende aynı |

### P0 — Kompozitler

| Bileşen | Not |
|---|---|
| **Data table** | Bu **en kritik bileşen**. Sütun tipleri: metin, tanımlayıcı (plaka), sayı (sağa dayalı, tabular), statü, tarih, aksiyon. Sıralanabilir başlık, hover satır, seçili satır, sticky başlık, sticky ilk sütun, yoğun/rahat mod, **tüm satır tıklanabilir** |
| **Toolbar** | arama + filtre grubu + sıralama + sonuç sayısı + toplu aksiyon çubuğu |
| **Stat tile** | etiket + değer + trend + mikro sparkline + **fayda alt satırı** |
| **Card** | başlık + ipucu + gövde + isteğe bağlı aksiyon |
| **Empty state** | ikon + başlık + açıklayıcı metin + kurtarıcı aksiyon. **Özür dilemez, yardım eder** |
| **Drawer** | slide-over, başlık + sekmeler + kaydırılan gövde + sabit alt aksiyon çubuğu |
| **Toast** | mesaj + aksiyon (Undo) + otomatik kapanma |
| **Tabs** | alt-çizgi (sayfa içi) ve segmented (Own/Subcontracted) — iki ayrı stil |
| **Nav rail item** | varsayılan, hover, aktif, sayaçlı |

### P1 — Ürüne özel bileşenler

Bunlar jenerik değil; **bu ürünün fikrini taşıyan** bileşenler. En çok değeri burada bekliyorum.

| Bileşen | Ne yapar |
|---|---|
| **Attention list row** | Gruplu, sayaçlı, tıklanabilir. Overview'ın en önemli bileşeni. "Ne yapmalıyım" sorusunu cevaplar |
| **Compliance check row** | ✅⚠️❌ + kontrol adı + gerekçe + öneri aksiyonu. Demonun kritik anı |
| **Trip chain / stepper** | 6 halkalı yatay zincir: Loading → TR Customs → Ro-Ro → NCTS → GVMS → Delivery. Durumlar: done · current · pending · blocked. Dar ekranda dikeye dönmeli |
| **Vehicle rank card** | Atamada sağ sütun: araç + sürücü + uygunluk skoru + **"neden bu sırada" tek satır gerekçe** |
| **Declaration chip group** | `U-ETDS ✓` `NCTS ✓` `GVMS ⏳` — tooltip'li, hizalı |
| **Split view** | Sol liste / sağ detay + alt aksiyon çubuğu. Atama ekranının iskeleti |
| **Genie insight card** | AI önerisi. Markanın AI dilini taşır ama abartmaz — **gözlem değil sonuç** yazar |
| **Map pin + legend** | Koridor haritası için: durum renkli pin, seçili hali, kümelenme, açıklama |
| **Hours bar** | Sürücü AETR sürüş saati göstergesi — kalan/kullanılan, eşik uyarısı |
| **Coach mark** | Rehberli tur baloncuğu + spotlight overlay + adım sayacı |

### P2 — Varsa iyi

Modal, Pagination, Segmented control, Avatar/initials, Sparkline varyantları,
Progress ring, Filter popover, Date range picker (statik olabilir).

---

## 7. Ekran mockup'ları

Tüm ekranları istemiyorum — **ikisini tam çöz, gerisini ben türetirim.**

1. **Overview @ 1440** — hero şeridi, 4 KPI, attention list, Genie kartı, koridor haritası.
   *Bu ekran "10 saniye kuralı"nı geçmeli: girişten "neye bakmalıyım" cevabına 10 saniyeden az.*
2. **Vehicles @ 1440** — toolbar, sekmeler, dolu tablo, seçili satır, yoğun mod.
   *Ayrıca **boş durumu** ayrı bir artboard olarak isterim — en çok ihmal edilen ve
   en çok fark yaratan ekran budur.*

Ek olarak faydalı olur (zorunlu değil): **Assign split view @ 1440** ve
**Vehicles @ 390** (mobilde tablo → kart listesi dönüşümü).

---

## 8. Erişilebilirlik — pazarlığa kapalı

- Metin kontrastı **≥ 4.5:1**, büyük metin ve ikonlar ≥ 3:1 — açık **ve** koyu temada
- **Renk asla tek başına bilgi taşımaz** (§4)
- Görünür `:focus-visible` ring, tek token, her interaktif öğede
- Dokunma hedefi ≥ 24px (tercihen 32px)
- Klavye: `Tab` mantıklı sıra · `/` arama · `Esc` drawer/tur kapatma
- Drawer ve modalde odak tuzağı, kapanınca odak tetikleyiciye döner
- `prefers-reduced-motion: reduce` → hareket durur, **veri kalır**

---

## 9. Hareket

Az ve amaçlı. İstediğim: **tek bir süre/easing tablosu**, bileşen bazında değil.

- Mikro (hover, chip): 120ms
- Geçiş (drawer, popover): 200ms, `cubic-bezier(.32,.72,0,1)`
- Vurgu (toast, coach mark): 200ms
- Harita pin hareketi: sürekli ama yavaş, dikkat çalmaz
- **Hiçbir animasyon kullanıcıyı bekletmez.** Süslemek için gecikme eklenmez

---

## 10. Teknik kısıtlar (Claude Design çıktısı bunlara uymalı)

| Kısıt | Sebep |
|---|---|
| Renkler **OKLCH** | Mevcut sistem OKLCH; hex'e dönerse ton tutarlılığı kaybolur |
| Dış font yok | Fontshare CSP'de engelli — General Sans gömülü |
| Dış görsel/ikon servisi yok | Her şey inline SVG. Bootstrap Icons |
| Tek dosya, framework yok | Vanilla CSS + JS. Tailwind/utility sınıf üretme |
| CSS custom properties | Component başına sabit renk yazma — hep token referansı |
| Sayfa ≤ 16MB | Gömülü font dahil |

---

## 11. Bana nasıl teslim edilsin

Öncelik sırasıyla. **1 ve 2 olmazsa olmaz.**

1. **`tokens.css`** — kopyala-yapıştır hazır. Ham skala + semantik rol katmanı + açık/koyu.
   Yorumlarla gruplu.
2. **Durum taksonomisi tablosu** (§4) — doldurulmuş halde.
3. **Komponent sayfası** — bileşen başına bir artboard, **tüm durumlar etiketli**
   (default/hover/focus/disabled/loading/error). Sadece "güzel hali" değil.
4. **Yoğunluk/ölçü notları** — padding, yükseklik, gap değerleri **px cinsinden**.
   "Boşluk bol olsun" değil, `padding: 8px 12px` gibi.
5. **İki ekran mockup'ı** (§7) + boş durum artboard'ı.
6. **Yazı tonu notu** — buton etiketleri, boş durum metinleri, hata mesajları için 3-5 örnek.

**İstemediğim:** marka kılavuzu, logo çalışması, pazarlama sayfası, illüstrasyon,
ikon tasarımı, uzun gerekçe metinleri. Bunlar zaten var ya da gereksiz.

---

## 12. Kapsam dışı

Login · ayarlar · onboarding · bildirim merkezi · kullanıcı profili ·
fatura/ödeme ekranları · e-posta şablonu · mobil uygulama ·
çoklu dil (arayüz İngilizce sabit).

---

## 13. Design system'in cevaplaması gereken sorular

Bunlar açık kararlar. Cevapları görmek istiyorum, "tercih meselesi" değil.

1. **Turuncu ve kırmızı aynı ekranda nasıl ayrışır?** (§3.1) — yan yana örnekle.
2. **Tablo satır yüksekliği ne?** Rahat ve yoğun modda kaç px, aradaki fark ne?
3. **Gradient üründe nerede görünür, nerede yasak?** İki kullanım yeri onaylı mı?
4. **`1rem` radius ürün ölçeğinde nereye kadar korunur?** Chip'e kadar iner mi, nerede kırılır?
5. **Koyu temada hiyerarşi gölgeyle mi yüzey açıklığıyla mı taşınır?**
6. **Beş statü boyutu kaç semantik renge indirgenir?** Beş yeter mi, altıncıya ihtiyaç var mı?
7. **Marka turuncusu seçili tablo satırında kullanılır mı**, yoksa nötr mü kalır?
8. **KPI tile'ında trend göstergesi** ok mu, yüzde mi, sparkline mı — üçü birden mi?

---

## 14. Başarı ölçütü

Design system şu üç testi geçerse iyidir:

1. **Tanınma:** Ekran görüntüsü Modaltrans'ın sitesinin yanına konunca aynı aileden görünür.
2. **Dayanıklılık:** 42 satırlık bir tabloda, 5 farklı statü boyutu aynı anda görünürken
   ekran hâlâ sakin.
3. **Devredilebilirlik:** Ben bu dosyadaki bileşenleri, tasarımcıya tekrar sormadan
   kodlayabiliyorum.
