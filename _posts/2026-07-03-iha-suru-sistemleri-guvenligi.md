---
title: "İHA Sürü (Swarm) Sistemlerinde Siber Güvenlik"
date: 2026-07-03 10:00:00 +0300
tags: [swarm, iha, siha, uav-security, siber-guvenlik]
author: CyEn07
---

Tekli bir İHA'nın güvenliğini sağlamak zaten zor bir problemken, **sürü
(swarm) sistemleri** — onlarca veya yüzlerce aracın koordineli çalıştığı
mimariler — bu problemi bambaşka bir ölçeğe taşıyor. Bu yazıda sürü
sistemlerine özgü tehdit modelini ve savunma yaklaşımlarını ele alıyoruz.

> Bu yazı kavramsal/savunma odaklıdır. Gerçek sürü sistemlerine yönelik
> yetkisiz müdahale bu yazının konusu değildir.

## Sürü Sistemlerini Farklı Kılan Nedir?

Tekli bir İHA'da güvenlik sınırları nettir: yer kontrol istasyonu ↔ araç.
Sürü sistemlerinde ise ek olarak:

- **Araçlar arası haberleşme (inter-UAV communication):** Sürüdeki her araç,
  diğerleriyle doğrudan veya mesh ağ üzerinden veri paylaşır (konum, niyet,
  görev durumu).
- **Dağıtık karar alma (distributed decision making):** Formasyon, görev
  paylaşımı gibi kararlar genellikle merkezi bir otoriteye değil, konsensüs
  (consensus) algoritmalarına dayanır.
- **Ölçek:** Onlarca aracın her biri potansiyel bir giriş noktasıdır.

Bu farklar, güvenlik modelini "tek bir aracı koru" yaklaşımından "bir bütün
olarak dağıtık sistemin bütünlüğünü koru" yaklaşımına taşır.

## Sürüye Özgü Tehdit Kategorileri

### 1. Tek Bir Aracın Ele Geçirilmesinin Sürüye Yayılması

Sürü algoritmaları genellikle her aracın komşularından aldığı bilgiye
(konum, hız, niyet) güvenir. Eğer bir araç ele geçirilirse (firmware
zafiyeti, fiziksel müdahale vb.), bu araç sürüye **yanlış bilgi** yayarak
formasyonu bozabilir veya diğer araçları tehlikeli bir manevraya
yönlendirebilir — bu, "bir düğümün güveninin tüm ağa sirayet etmesi"
probleminin klasik bir örneğidir (Sybil / bizans hatası benzeri senaryolar).

### 2. Sahte Düğüm Enjeksiyonu (Sybil-benzeri Saldırı)

Sürü ağına, gerçek bir araçmış gibi davranan sahte bir düğüm (veya sinyal)
enjekte edilmesi. Kimlik doğrulaması zayıfsa, bu sahte düğüm:

- Konsensüs oylamasını manipüle edebilir.
- Formasyon algoritmasına yanlış konum/hız bilgisi vererek çarpışmaya
  zorlayabilir.
- Görev dağıtım mantığını (task allocation) bozarak bazı hedeflerin
  atlanmasına neden olabilir.

### 3. Haberleşme Ağının Bölünmesi (Network Partitioning)

Sürü içi haberleşmenin belirli bir kısmının kasıtlı olarak kesilmesi
(jamming, selective DoS), sürünün alt gruplara ayrılmasına ve tutarsız karar
almasına yol açabilir — bazı araçlar eski bilgiyle hareket etmeye devam
eder.

### 4. Merkezi Görev Planlayıcının Tek Hata Noktası Olması

Bazı "dağıtık" sistemlerde bile görev planlaması aslında tek bir yer
istasyonu/sunucudan geliyor olabilir. Bu durumda mimari "sürü" gibi görünse
de gerçek bir tek hata noktası (single point of failure) taşır; bu bileşen
ele geçirilirse tüm sürü etkilenir.

## Savunma Yaklaşımları

### Karşılıklı Kimlik Doğrulama (Mutual Authentication)

Sürüdeki her araç, komşularının kimliğini doğrulayabilmelidir (örn.
hafif ağırlıklı sertifika tabanlı veya ön paylaşımlı anahtar (pre-shared
key) mekanizmalarıyla). Bu, sahte düğüm enjeksiyonuna karşı temel savunma
katmanıdır.

### Bizans Hatasına Dayanıklı Konsensüs (Byzantine Fault Tolerance)

Konsensüs algoritmalarının, sürüdeki bazı düğümlerin kötü niyetli veya
arızalı olabileceği varsayımıyla tasarlanması (BFT tabanlı yaklaşımlar).
Böylece azınlıkta kalan ele geçirilmiş düğümler, sürünün genel kararını tek
başına bozamaz.

### Anomali Tespiti — Bireysel Değil, Sürü Seviyesinde

Tek bir aracın davranışına bakmak yerine, sürünün **kolektif davranışını**
izlemek: bir aracın konumu/hızı komşularına göre istatistiksel olarak
anlamsızsa (ör. aniden fizik kurallarına aykırı bir sıçrama), bu aracın
verisi düşük güvenilirlikli olarak işaretlenip karar alma sürecinden
dışlanabilir.

### Zarif Bozulma (Graceful Degradation)

Sürü, haberleşme kaybı veya bir alt grubun izole olması durumunda tamamen
kontrolsüz kalmak yerine, önceden tanımlı güvenli bir davranışa
(ör. mevcut pozisyonda bekleme, otomatik geri dönüş) geçebilmelidir.

### Görev Planlamasının Gerçekten Dağıtılması

Kritik görev kararlarının tek bir merkezi bileşene bağımlı olmaması;
mümkün olduğunca sürü içi konsensüs ile alınması, tek hata noktası riskini
azaltır.

## Özet Tablo

| Tehdit | Savunma |
|---|---|
| Ele geçirilmiş aracın yanlış bilgi yayması | Sürü seviyesinde anomali tespiti, güven skoru (trust score) |
| Sahte düğüm enjeksiyonu | Karşılıklı kimlik doğrulama, mesaj imzalama |
| Ağın bölünmesi / jamming | Zarif bozulma davranışları, çoklu haberleşme kanalı (redundancy) |
| Merkezi tek hata noktası | Kararların gerçek anlamda dağıtılması, BFT konsensüs |

## Sonuç

Sürü İHA sistemlerinde güvenlik, tekli araç güvenliğinin üzerine inşa edilen
ayrı bir katmandır: her aracın kendi başına güvenli olması yetmez, sürünün
**kolektif güvenilirliği** de ayrıca tasarlanmalıdır. Bu, dağıtık sistemler
literatüründeki (Bizans hataları, konsensüs, Sybil saldırıları) kavramların
doğrudan İHA/robotik alanına taşınmasını gerektiren, disiplinler arası bir
güvenlik problemi.
