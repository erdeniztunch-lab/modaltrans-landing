# Modaltrans

## TL;DR

- Modaltrans, freight forwarder ve gümrük müşavirlerinin iş dosyasını (job file) uçtan uca yöneten bulut tabanlı bir **vertical SaaS**: teklif → booking → operasyon → gümrük beyanı → fatura tek kayıtta akıyor. ([modaltrans.com/freight-management](https://modaltrans.com/freight-management))
- Şirket lojistik sektörünün içinden çıkmış; ilk ürünün adı Nimbo, bugünkü platform 2016'da ilk bulut MVP'siyle başlamış. Kuruluş yılı kaynaklara göre 2012–2015 arasında çelişiyor. ([about-us](https://modaltrans.com/about-us), [PitchBook](https://pitchbook.com/profiles/company/528122-35))
- İki regülasyon coğrafyasına derin gömülmüş: Türkiye (Bilge, U-ETDS, Logo, eFinans, Arvento) ve Birleşik Krallık (HMRC CDS, NCTS, GVMS, ENS). Asıl teknik varlık bu entegrasyon katmanı. ([integrations](https://modaltrans.com/integrations))
- Şirketin kendi iddiası: 300+ şirket, 15+ ülke, 3.000+ günlük aktif kullanıcı, kümülatif 600K+ gümrük beyanı ve 4.8M fatura. ([modaltrans.com](https://modaltrans.com/), [about-us](https://modaltrans.com/about-us))
- Üçüncü taraf listelerde plan fiyatları $295 / $795 / $1.395 ay bandında görünüyor — yani ürün açıkça SMB ve alt orta segment fiyatlaması yapıyor. ([Capterra](https://www.capterra.com/p/228019/Modaltrans/))
- Açıklanmış bir yatırım turu yok; tek finansal sinyal Nisan 2023'te Alchemist Accelerator katılımı. Şirket gelir üretiyor, ~26 çalışan görünüyor. ([PitchBook](https://pitchbook.com/profiles/company/528122-35), [Crunchbase](https://www.crunchbase.com/organization/modaltrans))
- 2026 ARR'si **$2–3M bandında** olması makul; en iyi senaryoda $4M üzeri. `[estimate]`
- En büyük rakip Türkiye'de kendi başına bir startup değil: WiseTech Global'in 2018'de satın aldığı, 400+ lojistik hizmet sağlayıcısına hizmet veren ve Türkiye'deki e-imzalı özet beyanların ~%60'ını işleyen **Ulukom**. ([ulukom.com.tr](https://www.ulukom.com.tr/tr/hakkimizda-96-pg.html))
- Gerçek moat: regülasyon entegrasyonları + finans/gümrük arşivinin sistem-of-record olması. Kolay kopyalanan: UI, container tracking (Shipsgo üzerinden alınıyor), muhasebe entegrasyonları ve generic AI özellikleri.
- En büyük yapısal risk müşteri başına özelleştirme kültürü: bir müşteri şirketi övürken "bizim taleplerimiz doğrultusunda geliştirilebilir bir program" diyor — bu satış avantajı ama ürün borcudur. ([Hizmetix, Kasım 2024](https://hizmetix.com.tr/scslog-lojistik-teknoloji-ve-inovasyonla-lojistikte-yeni-bir-doneme-imza-atiyor/))

---

## 1. Şirket

Modaltrans bir yazılım şirketi kuran yazılımcılar tarafından değil, sorunu yaşayan lojistikçiler tarafından kurulmuş. Şirket bunu kendi diliyle "lojistiğin senden ne istediğini dinle, sonra onu kodla" diye anlatıyor ([about-us](https://modaltrans.com/about-us)). Bu, bir pozisyonlama cümlesi olmanın ötesinde şirketin bugünkü ürün yapısını ve en büyük riskini birlikte açıklıyor.

Kronoloji şirketin kendi anlatımıyla şöyle: 2015 lansman, 2016 ilk bulut MVP, 2017 Almanya ve Türkiye NCTS entegrasyonları, 2020 Brexit sonrası UK NCTS, 2021 UK operasyonu, 2022 CHIEF ve CDS, 2023 konteyner ve hava kargo takibi, 2024 tender yönetimi, 2025 AI ([about-us](https://modaltrans.com/about-us)). Kuruluş yılı kaynaklar arasında tutarsız: kendi sitesi 2015, PitchBook 2012, Crunchbase yılı gizlemiş ([PitchBook](https://pitchbook.com/profiles/company/528122-35), [Crunchbase](https://www.crunchbase.com/organization/modaltrans)). En savunulabilir okuma, 2012–2013 civarında Nimbo adıyla proje/hizmet işi olarak başlayıp 2015–2016'da ürünleşmesi. `[assumption]`

Bu kronolojinin okunması gereken yeri şu: **şirketi büyüten şey ürün özelliği değil, regülasyon olayları.** 2017 NCTS, 2020 Brexit, 2022 CDS geçişi — her biri lojistik firmalarının yazılım değiştirmek zorunda kaldığı anlar. Modaltrans'ın UK'ye açılması bir "global expansion" kararından çok Brexit'in yarattığı zorunlu yenileme dalgasına binmek. Bu, hem şirketin en zeki hamlesi hem de büyüme motorunun kendi kontrolünde olmadığının kanıtı.

İki ofis var: İstanbul (Kartal/Orhantepe) ve Londra (N14) ([contact-us](https://modaltrans.com/contact-us)). UK tüzel kişiliği MODALTRANS LTD, 5 Kasım 2020'de kurulmuş, SIC kodu 62012 yazılım geliştirme, aktif ve hesapları güncel ([Companies House](https://find-and-update.company-information.service.gov.uk/company/13000332)). Yani UK varlığı gerçek bir operasyon, sadece adres değil.

**Tek cümle:** Modaltrans, KOBİ ve orta ölçekli freight forwarder'lar için operasyon–gümrük–finans üçlüsünü tek kayıt üzerinde birleştiren, Türkiye ve UK regülasyonlarına derin gömülü bulut tabanlı bir sektörel işletim sistemi.

---

## 2. Müşteri

Şirket üç segment tanımlıyor: logistics service providers, beneficial cargo owners, customs brokers ([solutions](https://modaltrans.com/solutions)). Ama ürünün ağırlık merkezi net biçimde birincisi. Modül eşleşmesine bakınca CRM, warehouse ve freight management doğrudan LSP'ye, customs hem LSP hem broker'a, finance ve reporting herkese işaretlenmiş. Cargo owner segmenti şu an gerçek bir ürün hattı değil, satış yüzeyi. `[estimate]`

Modaltrans'tan önceki workflow'u tarif etmek zor değil, çünkü sektörde hâlâ standart: teklif Excel'de hazırlanır ve e-postayla gider, booking ayrı bir tabloya girilir, operasyon WhatsApp ve telefonla yürür, gümrük beyanı ayrı bir programda (Türkiye'de Bilge arayüzü ya da Ulukom, UK'de CDS yazılımı) yeniden veri girilerek yapılır, fatura muhasebe programına üçüncü kez elle girilir, müşteri "yükün nerede" diye telefon eder. Aynı veri üç-dört kez yazılır ve dosya kârlılığı ancak ay sonunda, çoğu zaman yanlış hesaplanır.

Modaltrans'ın değiştirdiği tam olarak bu: teklif booking'e dönüşürken finansal kalemler taşınıyor, gümrük beyanı aynı dosyadan üretiliyor, fatura muhasebeye (Xero, Sage, QuickBooks, Zoho, Logo, eFinans) senkronlanıyor, müşteri portal üzerinden kendi yükünü izliyor ([freight-management](https://modaltrans.com/freight-management), [integrations](https://modaltrans.com/integrations)). Value proposition tek kelimeyle **"tekrar veri girme"nin ortadan kalkması**, ikinci olarak da sevkiyat bazında anlık kâr/zarar görünürlüğü. Bu ikincisi forwarder'lar için gerçekten alım kararı değiştiren şey, çünkü marjları %3–8 bandında ve dosya bazında zarar edip bunu ay sonuna kadar fark etmemek yaygın bir sorun.

Müşteri profili hakkında en somut üçüncü taraf veri SCSLOG: Türkiye–İtalya parsiyel taşımacılık yapan, Milano'da 2.550 m² antrepolu, haftada 250–350 ton taşıyan bir firma ([Hizmetix](https://hizmetix.com.tr/scslog-lojistik-teknoloji-ve-inovasyonla-lojistikte-yeni-bir-doneme-imza-atiyor/)). Referans listesindeki diğer isimler Gökbora (Türkiye merkezli uluslararası taşımacı), Supreme ve Oregon ([logistics-service-providers](https://modaltrans.com/logistics-service-providers)). Software Advice'taki tek doğrulanmış yorumcu 11–50 çalışanlı bir lojistik şirketi ([Software Advice](https://www.softwareadvice.com/scm/modaltrans-profile/)).

Ölçek matematiği bunu doğruluyor: 300+ şirket ve 3.000+ günlük aktif kullanıcı, müşteri başına ortalama ~10 aktif kullanıcı demek ([modaltrans.com](https://modaltrans.com/), [about-us](https://modaltrans.com/about-us)). Bu enterprise değil; 5–50 kullanıcılı, tek veya iki ülkede çalışan, 20–200 kişilik forwarder profili. `[estimate]`

**Zaman içindeki değişim hakkında dürüst olmak gerekirse:** 2024 ve 2026 arasındaki müşteri sayısı değişimini doğrulayacak arşivlenmiş veri bulamadım; sitenin geçmiş versiyonlarına erişim engellendi. Elimizdeki tek zaman serisi kümülatif metrikler (600K+ beyan, 4.8M fatura) ve bunlar da tarihsiz. Bu yüzden "300+" rakamının ne kadar süredir aynı olduğunu bilmiyoruz — pazarlama sayfalarında güncellenmeden duran bir rakam olma ihtimali gerçek. `[unknown]`

---

## 3. Ürün

Modüller: Freight Management, Finance Management, Advanced CRM, Customs Management, Warehouse Management, Reporting; üzerine Client Portal, Mobile App, e-AWB, Container Tracking, Carbon Tracking, Smart Documentation ([modules](https://modaltrans.com/modules)).

Feature listesi yerine her modülün gerçekte ne işi çözdüğü:

| Modül | Problem | Kullanıcı | Değer |
|---|---|---|---|
| Freight | Teklif→booking→operasyon zincirinde veri kopması | Operasyon şefi, satış | Dosya bazında anlık P&L |
| Customs | Beyanın ayrı programda yeniden yazılması, ceza riski | Gümrük operatörü, müşavir | Aynı dosyadan beyan üretimi |
| Finance | Faturanın muhasebeye üçüncü kez girilmesi | Muhasebe | Otomatik fatura + ERP senkronu |
| CRM | Teklif geçmişi ve müşteri bakiyesinin kimsede olmaması | Satış, yönetim | Hızlı çoklu-opsiyon teklif |
| Client Portal | "Yük nerede" telefonlarının operasyonu yemesi | Müşterinin kendisi | Destek yükünün müşteriye devri |
| Warehouse | Antrepo stoğunun sevkiyattan kopuk olması | Depo | Stok–sevkiyat aynı kayıtta |
| Reporting | Kârlı hat/müşteri bilgisinin sezgisel olması | Yönetim | Hat ve müşteri bazında kârlılık |

**Bu ürün ne?** TMS değil — TMS'in çekirdeği rota optimizasyonu, yük eşleştirme ve taşıyıcı ihalesi; Modaltrans'ta bunlar ya yok ya çevresel. ERP de değil — insan kaynakları, satın alma, üretim yok. En doğru tanım **Freight Forwarding Management System**: forwarder'ın iş dosyası etrafında kurulmuş, üzerine gümrük compliance ve finans katmanı eklenmiş dikey bir sistem-of-record. Pazarlama dilindeki "logistics operating system" ifadesi bugün için abartılı ama yönü doğru gösteriyor: şirketin hedefi bir modül satmak değil, forwarder'ın günlük çalıştığı ekranı sahiplenmek.

Kategori olarak: **vertical SaaS + regulated workflow software.** İkinci kısım önemli, çünkü şirketin savunulabilirliği birinci kısımdan değil ikincisinden geliyor.

Ürünün teknik yüzeyi hakkında bir gözlem: uygulama Rails tabanlı ve Office 365 / Google OAuth ile giriş sunuyor ([demo.modaltrans.com](https://demo.modaltrans.com/)). Yani modern bir monolit, tek kod tabanı üzerinde çok kiracılı bir ürün. Bu hız avantajı, ama müşteriye özel geliştirme kültürüyle birleştiğinde uzun vadede en tehlikeli kombinasyondur.

---

## 4. Pazar

Modaltrans üç pazarın kesişiminde: TMS, freight forwarding software ve customs/trade compliance. Global TMS pazarı 2026'da ~$9,7 milyar, 2031'e kadar %8,9 CAGR ile ~$14,9 milyara gidiyor; bulut segmenti %61 pay ve %9,6 büyüme, SME segmenti %9,7 ile en hızlı büyüyen dilim ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/transportation-management-system-market)).

Bu rakamların Modaltrans için anlamlı olan kısmı toplam büyüklük değil, üç yapısal gerçek:

**Birincisi, pazar parçalı.** İlk 10 oyuncu gelirin ~%57'sini alıyor, geri kalanı yüzlerce bölgesel oyuncuya dağılmış. Bunun sebebi gümrük ve fatura regülasyonlarının ulusal olması: bir yazılımın Türkiye'de çalışması Bilge, U-ETDS ve e-fatura entegrasyonu, UK'de çalışması CDS ve GVMS entegrasyonu gerektiriyor. Bu, global oyuncular için bile ülke ülke maliyet, bölgesel oyuncular için ise koruma duvarı.

**İkincisi, switching cost yüksek ama giriş engeli asimetrik.** Bir forwarder yazılım değiştirdiğinde beyan arşivini, fatura geçmişini ve operasyon alışkanlığını taşımak zorunda; bu yüzden ortalama sözleşme ömrü uzun ve churn düşük. Ama aynı sebep yeni müşteri kazanmayı da zorlaştırıyor — Modaltrans'ın satış döngüsü büyük ihtimalle uzun ve referans/ağız yoluyla ilerliyor. `[estimate]`

**Üçüncüsü, satın alma davranışı segmente göre keskin ayrışıyor.** Orta pazar platformları kullanıcı başına $100–400/ay, enterprise legacy suitler $500–2.000/kullanıcı artı $50–100K implementasyon alıyor; CargoWise SME onboarding'i tipik olarak 6–12 ay sürüyor ve implementasyon £80–150K bandında ([GoFreight](https://gofreight.com/blog/best-freight-management-software), [Phlo Systems](https://phlo.io/blog/cargowise-alternatives-for-sme-customs-brokers-and-freight-forwarders-in-2026)). Modaltrans'ın $295–1.395/ay fiyatlaması bu tablonun tam altında konumlanıyor ([Capterra](https://www.capterra.com/p/228019/Modaltrans/)).

Yani pazar büyük ve büyüyor ama Modaltrans'ın oynadığı yer pazarın en çekici dilimi değil, en erişilebilir dilimi: enterprise'ın ödeyemeyeceği kadar küçük, manuel çalışmaya devam edemeyecek kadar da regüle olmuş firmalar.

---

## 5. Rekabet

**Direct competitors (Türkiye).** Asıl rakip Ulukom. 1987'de kurulmuş, 2018'de WiseTech Global tarafından satın alınmış, 400+ lojistik hizmet sağlayıcısına hizmet veriyor ve Türkiye'deki e-imzalı özet beyanların yaklaşık %60'ı bu yazılımdan geçiyor; ~70 modüllü bir lojistik ERP'si var ([ulukom.com.tr](https://www.ulukom.com.tr/tr/hakkimizda-96-pg.html)). Bu, Modaltrans'ın pazarında bir startup'la değil, global bir dev tarafından desteklenen yerleşik bir kurumla yarıştığı anlamına geliyor. Modaltrans'ın avantajı arayüz, bulut mimarisi, kurulum hızı ve fiyat; dezavantajı derinlik, kurumsal güven ve WiseTech'in dağıtım gücü.

**Enterprise alternatives.** CargoWise (WiseTech), Descartes, Magaya, e2open — Crunchbase bile Modaltrans'ın rakiplerini project44, Motive ve e2open olarak listeliyor ([Crunchbase](https://www.crunchbase.com/organization/modaltrans)), ki bu listeleme yanlıştır: project44 bir visibility ağı, Motive telematik. Gerçek enterprise alternatifi CargoWise. Bir forwarder CargoWise'ı 100+ ülkede çalışıyorsa, çok tüzel kişilikliyse ve IT ekibi varsa seçer. Kullanıcıların büyük kısmının fonksiyonların ~%15'ini kullandığı ve tek ülkede çalışan brokerların 150 ülkelik kapsamı sübvanse ettiği eleştirisi tam olarak Modaltrans'ın açtığı boşluk ([Phlo Systems](https://phlo.io/blog/cargowise-alternatives-for-sme-customs-brokers-and-freight-forwarders-in-2026)).

**Adjacent alternatives.** UK tarafında tradePhlo (beyan başına £25 veya £99/ay), BoxTop, CAS, Descartes OneView; ABD/global tarafta GoFreight, Magaya, Shipwell. Bunlar Modaltrans'ın tam ürününü değil, bir modülünü daha ucuza ve daha odaklı satıyor. Türkiye'de ise Logo gibi genel ERP'ler + ayrı gümrük programı kombinasyonu yaygın.

**Internal / manual workflows.** Gerçekte en büyük rakip bu. Excel + e-posta + WhatsApp + ayrı gümrük programı kombinasyonu hâlâ pazarın çoğunluğu. Modaltrans'ın satış konuşmasının bir rakibi yenmek değil, alışkanlığı kırmak üzerine kurulu olması bundan.

**Neden Modaltrans yerine başkası seçilir?** Çok ülkeli operasyon; büyük hacimli ABD/Asya ticareti; CargoWise ekosistemine bağlı acente ağı; kurumsal satın alma süreçlerinde referans sayısı ve analist raporu talebi (Modaltrans'ın Gartner sayfası var ama gerçek bir Gartner tanınırlığı yok — [gartner sayfası](https://modaltrans.com/gartner)); ya da sadece tek bir problemi (yalnız gümrük, yalnız depo) çözmek isteyen alıcı.

**Neden Modaltrans seçilir?** Türkiye + UK koridorunda çalışan bir forwarder için tek bir sistemde hem Bilge/U-ETDS hem CDS/NCTS bulmak nadir. Buna hızlı kurulum, düşük fiyat, Türkçe destek ve talebe göre geliştirme esnekliği ekleniyor. Bu kombinasyon dar ama gerçek bir kazanma alanı yaratıyor.

---

## 6. Business

**Bilinenler.** Fiyatlama üçüncü taraf listelerde $295 / $795 / $1.395 aylık plan bandında, ücretsiz deneme var ([Capterra](https://www.capterra.com/p/228019/Modaltrans/)); şirketin kendi sitesinde açık fiyat yok, satış demo üzerinden yürüyor ([Software Advice](https://www.softwareadvice.com/scm/modaltrans-profile/)). Açıklanmış yatırım turu yok; tek kayıtlı işlem Nisan 2023'te Alchemist Accelerator ([PitchBook](https://pitchbook.com/profiles/company/528122-35)). Çalışan sayısı PitchBook'ta 26, Crunchbase ve ZoomInfo'da 11–50 bandı ([Crunchbase](https://www.crunchbase.com/organization/modaltrans), [ZoomInfo](https://www.zoominfo.com/c/modaltrans/473275520)). Yönetim: Faruk Çelik (co-founder & CEO), Ugur Yilmaz (CTO), Aydogan Öztürk (COO) ([ZoomInfo](https://www.zoominfo.com/c/modaltrans/473275520)).

**ARR tahmini.** 300 müşteri × tahmini yıllık müşteri geliri: `[estimate]`

| Senaryo | Ort. ACV | ARR | Mantık |
|---|---|---|---|
| Conservative | ~$4.000 | ~$1,2M | Çoğunluk TR'de, TRY fiyatlı, alt plan; "300+" rakamı şişkin |
| Base | ~$8.000 | ~$2,4M | Karma TR/UK taban, orta plan ağırlıklı, kısmi modül satışı |
| Upside | ~$14.000 | ~$4,2M | UK payı yüksek, çoklu modül, özel geliştirme geliri dahil |

Çapraz kontrol: ZoomInfo geliri "<$5M" olarak tahmin ediyor ([ZoomInfo](https://www.zoominfo.com/c/modaltrans/473275520)) ve ~30 kişilik bir ekipte çalışan başına $70–90K gelir, Türkiye maliyet tabanlı bir SaaS için makul bir aralık. Base senaryo bu iki kontrolle de tutarlı. Kritik nokta şu: **Türkiye maliyet tabanı + UK gelir tabanı kombinasyonu, bu ölçekte kârlı olmayı mümkün kılıyor.** Yatırım almamış olmak burada zayıflık değil, muhtemelen tercih.

Gelir modelinde muhtemel ikinci kalem müşteriye özel geliştirme. Bu kısa vadede nakit, uzun vadede marj ve hız kaybı.

---

## 7. Product Strategy

Ürün stratejisi üç hamleden okunuyor.

**Yatay genişleme (cross-sell).** Freight çekirdeğinden finance, customs, CRM ve warehouse'a doğru büyüme. Bu, aynı müşteriye daha çok modül satma stratejisi ve forwarder'ın kullandığı sistem sayısını azalttığı için doğru bir hamle. Sınırı şu: her yeni modül, o modülün odaklı rakibiyle (özel muhasebe yazılımı, özel WMS) karşılaştırılır ve genellikle daha sığ kalır.

**Kenar genişlemesi (portal ve mobil).** Client Portal, ürünü forwarder'ın çalışanlarından forwarder'ın müşterisine taşıyor ([client-portal](https://modaltrans.com/solutions/client-portal)). Bu stratejik olarak en değerli hamle, çünkü kullanıcı tabanını çalışan sayısıyla sınırlı olmaktan çıkarıp müşteri ağına açıyor. Ağustos 2026'da WhatsApp entegrasyonunun çıkması aynı yönde: müşteriyle iletişimi ürünün içine çekmek ([blog](https://modaltrans.com/blog)).

**Regülasyon derinleşmesi.** NCTS TR/DE/UK, CDS, GVMS, ENS, U-ETDS, e-fatura. Bu en az seksi ama en çok değer üreten yatırım alanı.

**Sıradaki büyük ürün fırsatı** bence bunların hiçbiri değil: **forwarder'ın gelen e-posta kutusunu iş dosyasına çeviren katman.** Forwarding hâlâ bir e-posta ve PDF işi; teklif talebi, booking onayı, konşimento, gümrük evrağı hep serbest metin ve ekli dosya olarak geliyor. Modaltrans'ın AI Email Agent'ı ve PDF→kayıt çıkarımı bu yönü işaret ediyor ([integrations](https://modaltrans.com/integrations)). Bunu koltuk başına değil işlem başına fiyatlayabilirlerse, hem ACV tavanı yükselir hem de rekabet ekseni "daha iyi ekran"dan "daha az insan"a kayar.

**Ürün riskleri**, ağırlık sırasıyla:

1. **Müşteriye özel geliştirme.** SCSLOG'un övgüsü ("bizim taleplerimiz doğrultusunda geliştirilebilir") ürünün en büyük satış argümanı ve en büyük teknik borcu ([Hizmetix](https://hizmetix.com.tr/scslog-lojistik-teknoloji-ve-inovasyonla-lojistikte-yeni-bir-doneme-imza-atiyor/)). 300 müşteri × özel istek, tek kod tabanında sürdürülebilir değil.
2. **Feature sprawl ve UX karmaşası.** Altı modül, on-küsur çözüm, 50+ entegrasyon iddiası ama sayfada 21 isimli entegrasyon ([integrations](https://modaltrans.com/integrations)). Genişlik derinliğin önüne geçtiğinde ürün "her şeyi yapıyor ama hiçbirini iyi yapmıyor" algısına düşer.
3. **Entegrasyon bakım yükü.** Gümrük sistemleri sürekli değişir; her değişiklik zorunlu, gelir getirmeyen mühendislik işidir. Bu yük moat'in bedeli.
4. **AI özelliklerinin metalaşması.** "PDF'ten veri çıkar", "kayıtlar hakkında sohbet et" özellikleri 2026'da farklılaştırıcı değil, artık masaya giriş bileti.
5. **Ekip kapasitesi.** ~26–40 kişilik bir ekip; hem iki ülkenin regülasyonunu, hem altı modülü, hem AI'ı, hem özel geliştirmeyi aynı anda taşıyor. Odak kaybı burada gerçek bir tehlike.

---

## 8. AI

Modaltrans'ın AI yaklaşımını dürüstçe okumak gerekirse: **şu an ürünün üstüne eklenmiş bir katman, çekirdeğe gömülmüş bir mimari değil.** Sitede sayılanlar e-posta otomasyonu, kayıtlar hakkında konuşan asistan, PDF'ten veri çıkarımı, akıllı beyan üretimi ve doğal dille raporlama; sağlayıcı olarak ChatGPT, Claude ve Gemini adı geçiyor ([modaltrans.com](https://modaltrans.com/), [about-us](https://modaltrans.com/about-us)). Yol haritasında AI 2025 maddesi olarak duruyor — yani şirket kendisi de bunu yeni bir ekleme olarak konumluyor.

Buna rağmen AI'ın Modaltrans için sıradan bir SaaS şirketinden daha anlamlı olmasının bir sebebi var: **bu sektörde AI'ın işleyeceği veri şirketin içinde zaten var.** 600K+ gümrük beyanı, 4,8M fatura ve milyonlarca booking kaydı, hem yapılandırılmış hem de sektöre özgü ([about-us](https://modaltrans.com/about-us)). Bir yatay AI oyuncusunun bu veriye erişimi yok.

Fırsat alanları, gerçekçi sırayla:

- **Maliyet/otomasyon:** Beyan hazırlama ve dosya açma süresinin kısalması. Doğrudan müşteri ROI'si üretir, satılabilir.
- **Retention:** AI'ın ürettiği veri (tarife eşleştirme, hata önleme) müşterinin geçmişine bağlı olduğu için switching cost'u artırır.
- **Revenue:** İşlem başına fiyatlama açılırsa yeni bir gelir ekseni. Şu an yok. `[estimate]`
- **Data moat:** Teorik olarak en güçlü kart — HS kod tahmini, gümrük hata önleme, hat bazlı fiyat tahmini gibi modeller ancak bu ölçekte tarihsel veriyle çalışır. Pratikte müşteri verisinin sözleşmeyle kullanılabilir olması gerekir; bunun yapıldığına dair kamuya açık bir sinyal yok. `[unknown]`
- **Differentiation:** En zayıf halka. Chatbot ve PDF okuma her rakipte var.

**"AI-native logistics operating system" olabilir mi?** Teknik olarak evet, kültürel olarak zor. Bunun için ürünün varsayılan giriş noktasının ekran değil ajan olması, yani kullanıcının form doldurmak yerine gelen e-postayı onaylaması gerekir. Bu, mevcut ekranların üstüne AI eklemekle değil, ekranların rolünü küçültmekle olur — ve müşteriye özel geliştirme talepleriyle dolu bir yol haritasında böyle bir mimari yeniden yazımına yer açmak kolay değil. `[assumption]`

---

## 9. Company State

2026 itibarıyla sinyaller şunlar: ürün sevkiyatı sürüyor (Haziran 2026 satış performans takibi, Ağustos 2026 WhatsApp entegrasyonu — [blog](https://modaltrans.com/blog)), UK tüzel kişiliğinin hesapları güncel ([Companies House](https://find-and-update.company-information.service.gov.uk/company/13000332)), müşteri sayısı iddiası 300+ ve coğrafya 15+ ülke.

Buna karşılık büyümenin hızlandığına dair kanıt yok: yatırım turu yok, basında büyüme haberi yok, açık pozisyon ilanları kamuya açık kaynaklarda görünmüyor, üçüncü taraf inceleme platformlarında toplam **iki** doğrulanmış yorum var ([Capterra](https://www.capterra.com/p/228019/Modaltrans/), [GetApp UK](https://www.getapp.co.uk/software/2049476/modaltrans)). Kendi mühendis işe alım sitelerinin (modalhr.com) var olması ekip büyütme niyetini gösteriyor ama hacmini göstermiyor.

**Aşama tanımı: product-market fit'i kanıtlanmış, sermayesiz büyüyen, henüz scale-up olmamış vertical SaaS.** Gerekçe: 300 müşteri ve 3.000 günlük aktif kullanıcı PMF'in ötesinde bir sayı; 10 yılı aşkın süredir ayakta ve gelir üreten bir ürün. Ama scale-up'ın işaretleri — dış sermaye, pazarlama makinesi, üçüncü ülkeye açılım, kamuya açık büyüme metrikleri, yoğun işe alım — yok. Şirket muhtemelen kârlı ya da başa baş, nakit akışıyla büyüyor ve yılda %20–40 bandında artıyor. `[estimate]`

Bu kötü bir yer değil; sadece iki farklı geleceğin ortasındaki yer. Bir tarafta sürdürülebilir, sahibine iyi para kazandıran bölgesel bir yazılım şirketi; diğer tarafta sermaye alıp UK/AB koridorunda agresif büyüyen bir kategori oyuncusu. Şirket şu an ilkine daha yakın duruyor.

---

## 10. Strengths / Risks / Opportunities

**Güçlü yanlar**
1. İki ülkenin gümrük ve finans regülasyonuna aynı anda gömülü olmak — kopyalanması yıllar alan, sıkıcı ve pahalı bir varlık.
2. Sistem-of-record konumu: fatura, beyan ve dosya arşivi ürünün içinde olduğu için çıkış maliyeti yüksek.
3. Segment-fiyat uyumu: CargoWise'ın pahalı ve ağır, nokta çözümlerin ise dağınık kaldığı boşlukta tek platform sunuyor.

**Riskler**
1. WiseTech'in Türkiye'deki Ulukom üzerinden aşağı segmente inmesi — Modaltrans'ın en savunmasız olduğu senaryo.
2. Müşteriye özel geliştirme kültürünün ürün hızını ve marjı yemesi.
3. İki ülkeye bağımlılık: Türkiye kur/ekonomi şoku veya UK'de bir regülasyon konsolidasyonu geliri doğrudan vurur.

**Fırsatlar**
1. E-posta/döküman → iş dosyası dönüşümünün AI ile otomatikleştirilip işlem bazlı fiyatlanması.
2. Client Portal üzerinden forwarder'ın müşterisine ulaşmak; oradan cargo owner segmentine organik giriş.
3. Aynı regülasyon oyununu üçüncü bir coğrafyada tekrarlamak (AB üye ülkeleri, Körfez) — playbook zaten iki kez çalışmış.

---

## 11. My Take

Modaltrans'a bir startup gibi bakmak yanıltıcı. Bu şirket bir ürün fikriyle kurulmuş bir girişim değil; lojistikçilerin kendi acılarını kodlayarak ve müşterileri dinleyerek on yılda katman katman inşa ettiği bir **sektörel altyapı işi**. Hikaye 2012–2015'te Nimbo adıyla bir hizmet/ürün melezi olarak başlıyor, 2016'da buluta geçiyor, sonra büyüme kararlarını şirket değil regülasyon veriyor: NCTS 2017'de kapıyı açıyor, Brexit 2020'de UK'yi altın tepside sunuyor, CDS geçişi 2022'de yenileme dalgası yaratıyor. Bugünkü şirket 2013'tekinin daha büyük hali değil; farklı bir şey — o zaman bir Türk lojistik yazılımıydı, bugün iki regülasyon rejiminde çalışan iki ülkeli bir platform.

**Tez: Modaltrans aslında bir yazılım ürünü değil, iki ülkenin gümrük ve finans mevzuatını çalışır halde tutan bir compliance altyapısıdır — freight yönetimi bu altyapının satılabilir ambalajıdır.** Bu ayrımı görmek önemli, çünkü şirketin neden ucuz fiyatla yaşayabildiğini, neden churn'ünün düşük olduğunu ve neden bir enterprise devinin onu kolayca ezemediğini aynı anda açıklıyor. Ekranlar kopyalanabilir; Bilge, U-ETDS, CDS ve NCTS'i aynı anda ayakta tutmak kopyalanamaz — sadece aynı yılları harcayarak elde edilir.

**En güçlü tarafı:** Türkiye maliyet tabanı üzerine kurulmuş bir mühendislik ekibiyle, UK/AB fiyatına regüle iş akışı satabiliyor olması. Bu yapısal arbitraj, sermaye almadan kârlı büyümeyi mümkün kılıyor ve şirkete rakiplerinin sahip olmadığı bir şey veriyor: zaman.

**En büyük riski:** Aynı esneklik, ürünü yavaşça bir yazılım evine dönüştürüyor. Her müşterinin talebini kodlayan bir kültür, 30 müşteride sevimli, 300 müşteride yönetilebilir, 1.000 müşteride felçtir. Modaltrans şu an tam bu eşikte ve bu eşiği aşmanın tek yolu bazı müşterilere hayır demeyi öğrenmek — ki bu, şirketin kuruluş DNA'sının tam tersi.

**En büyük fırsatı:** Forwarding'in hâlâ bir e-posta işi olması. Ürün zaten dosyanın merkezinde oturuyor; o dosyayı açan insanı ortadan kaldıran ilk oyuncu, seat-based fiyatlamadan volume-based fiyatlamaya geçer ve ACV'sini 3-5 katına çıkarır. Modaltrans'ın verisi bunu yapmaya yeter, mimarisinin yetip yetmeyeceği belli değil.

**3–5 yıl:** İki makul yol var. Birincisi — ve daha olası olanı — şirket kârlı, 500–800 müşterili, $5–8M ARR'lı, Türkiye–UK–AB koridorunda güçlü bir niş lider olarak devam eder ve bir noktada stratejik bir alıcının (WiseTech'in yaptığı türden bir hamle) radarına girer. İkincisi, AI ajanı gerçekten çekirdeğe gömülür, işlem bazlı fiyatlamaya geçilir ve şirket dış sermaye alarak AB pazarında agresif büyümeye çalışır. Bugünkü sinyaller — sermaye almamış olmak, sessiz PR, müşteri talebiyle yönlenen yol haritası — birinci yolu işaret ediyor. İkincisine geçmek için gereken şey daha fazla para değil, daha keskin bir hayır deme kası. `[assumption]`