---
title: "İHA/SİHA Sistemlerinde Siber Güvenliğe Giriş: Saldırı Yüzeyi"
date: 2026-07-01 10:00:00 +0300
tags: [iha, siha, uav-security, drone, siber-guvenlik]
author: 07enesavci
---

İnsansız hava araçları (İHA) ve silahlı/gözlem amaçlı SİHA sistemleri artık
sadece askeri alanda değil; tarım, lojistik, haritalama ve güvenlik
sektörlerinde de yaygın olarak kullanılıyor. Bu yaygınlaşma, sistemleri siber
saldırganlar için de cazip bir hedef haline getiriyor. Bu yazıda bir İHA/SİHA
ekosisteminin tipik saldırı yüzeyine genel bir bakış atacağız.

> Bu yazı tamamen eğitim ve farkındalık amaçlıdır. Gerçek bir İHA'ya, RF
> spektrumuna veya GPS sinyaline müdahale etmek (jamming, spoofing vb.)
> çoğu ülkede ciddi yasal yaptırımlara tabidir ve yalnızca yetkili,
> kontrollü test ortamlarında (RF-shielded lab, yazılı izin vb.) ele
> alınmalıdır.

## Tipik Bir İHA Sisteminin Bileşenleri

Bir İHA/SİHA operasyonunu genel olarak dört katmanda inceleyebiliriz:

1. **Hava aracı (airframe + uçuş kontrolcüsü):** Otopilot yazılımı (ör.
   ArduPilot, PX4), sensörler (IMU, barometre, GPS alıcısı), motor
   kontrolcüleri (ESC).
2. **Haberleşme bağlantısı:** Telemetri linki (genellikle MAVLink üzerinden),
   video downlink, uzaktan kumanda (RC) sinyali.
3. **Yer kontrol istasyonu (GCS):** Operatörün uçuşu planladığı ve izlediği
   yazılım (ör. QGroundControl, Mission Planner) ve bu yazılımın çalıştığı
   bilgisayar/tablet.
4. **Destek altyapısı:** Bulut tabanlı filo yönetim panelleri, API'ler,
   firmware güncelleme sunucuları.

Her katman kendine özgü bir tehdit modeli barındırır.

## Saldırı Yüzeyi Kategorileri

### 1. RF ve Haberleşme Katmanı

- **Sinyal karıştırma (jamming):** Kontrol veya telemetri frekansına gürültü
  enjekte ederek bağlantının kopmasına neden olma.
- **Sahte GPS sinyali (spoofing):** Aracın gerçek konumundan farklı bir konum
  algılamasını sağlayarak rota manipülasyonu.
- **Tekrar oynatma (replay) saldırıları:** Şifrelenmemiş veya zayıf
  kimlik doğrulamalı RC/telemetri paketlerinin yakalanıp yeniden
  gönderilmesi.

### 2. Protokol Katmanı

- MAVLink gibi telemetri protokollerinin şifreleme/imzalama
  yapılandırılmadan kullanılması.
- Yer kontrol istasyonu ile hava aracı arasındaki bağlantıda TLS/şifreleme
  eksikliği.

### 3. Yazılım / Firmware Katmanı

- Otopilot firmware'inde güncellenmemiş bilinen zafiyetler (CVE).
- Güvenli olmayan firmware güncelleme mekanizmaları (imzasız paketler).
- Yer kontrol istasyonu yazılımındaki klasik uygulama güvenliği açıkları
  (yetersiz girdi doğrulama, güvensiz depolama vb.).

### 4. Bulut / Filo Yönetimi Katmanı

- API anahtarlarının sızması, yetersiz yetkilendirme kontrolleri.
- Çoklu kiracılı (multi-tenant) filo yönetim panellerinde izolasyon
  eksiklikleri.

## Savunma Yaklaşımları

| Katman | Önlem |
|---|---|
| RF/Haberleşme | Frekans atlamalı (frequency-hopping) sistemler, sinyal gücü izleme, anomali tespiti |
| Protokol | MAVLink 2.0 imzalama (message signing), telemetri linkinde şifreleme |
| Firmware | İmzalı firmware güncellemeleri, düzenli yama yönetimi, secure boot |
| GCS | Uygulama güvenliği testleri, en az yetki prensibi, ağ segmentasyonu |
| Bulut | Güçlü kimlik doğrulama (MFA), API rate limiting, düzenli denetim |

## Sonuç

İHA/SİHA güvenliği, klasik web/ağ güvenliği bilgisiyle RF ve gömülü sistem
güvenliğinin kesiştiği disiplinler arası bir alan. Bu serinin sonraki
yazılarında MAVLink protokolünün güvenlik mekanizmalarını ve tipik yer
kontrol istasyonu zafiyetlerini daha detaylı ele alacağız.
