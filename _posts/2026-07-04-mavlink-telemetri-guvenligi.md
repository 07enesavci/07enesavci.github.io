---
title: "MAVLink Protokolü ve Telemetri Güvenliği"
date: 2026-07-04 10:00:00 +0300
tags: [mavlink, iha, telemetri, protokol-guvenligi, siber-guvenlik]
author: CyEn07
---

Bir önceki yazıda İHA/SİHA sistemlerinin genel saldırı yüzeyine değinmiştik.
Bu yazıda, açık kaynak dünyasında en yaygın kullanılan telemetri protokolü
olan **MAVLink**'in güvenlik tarafına daha yakından bakıyoruz.

> Aşağıdaki bilgiler protokolün savunma/analiz perspektifinden anlaşılması
> içindir; gerçek uçuş sistemlerine yetkisiz müdahale bu yazının konusu
> değildir ve yasal değildir.

## MAVLink Nedir?

MAVLink (Micro Air Vehicle Link), yer kontrol istasyonu (GCS) ile İHA
arasındaki haberleşmeyi standartlaştıran, hafif ve açık kaynaklı bir mesaj
protokolüdür. ArduPilot ve PX4 gibi popüler otopilot yazılımlarının
neredeyse tamamı bu protokolü kullanır.

Protokol; konum, hız, batarya durumu, komut (waypoint, RTL, arm/disarm vb.)
gibi bilgileri küçük, verimli binary mesajlar halinde taşır.

## MAVLink 1 vs MAVLink 2

MAVLink'in ilk sürümünde (MAVLink 1) mesajlar için **kimlik doğrulama veya
şifreleme bulunmuyordu**. Bu da şu riskleri doğuruyordu:

- Herhangi biri RF frekansını dinleyip trafiği pasif olarak analiz edebilir.
- Uygun donanıma sahip bir saldırgan, komut mesajlarını taklit ederek
  (spoof) araca sahte komutlar gönderebilir.

MAVLink 2 ile birlikte gelen en önemli güvenlik özelliği **mesaj imzalama
(message signing)** oldu:

- Her mesaja, paylaşılan bir gizli anahtar (secret key) ve artan bir zaman
  damgası (timestamp) kullanılarak bir imza (signature) eklenir.
- Alıcı taraf, imzayı doğrulayamadığı veya zaman damgası geçersizse mesajı
  reddeder.
- Bu mekanizma; **tekrar oynatma (replay)** ve **mesaj sahteciliği
  (spoofing)** saldırılarına karşı önemli bir savunma katmanı sağlar.

## Message Signing Neden Varsayılan Değil?

MAVLink 2 mesaj imzalamayı destekler, ancak **varsayılan olarak etkin
değildir** — geliştiricinin veya operatörün bunu ayrıca yapılandırması
gerekir. Pratikte birçok kurulumda bu adım atlanır, bu da protokolün
sunduğu güvenliğin fiilen kullanılmamasına neden olur.

Bir güvenlik değerlendirmesi yaparken sorulması gereken temel sorular:

1. Telemetri linkinde MAVLink 2 message signing aktif mi?
2. Paylaşılan anahtar nasıl dağıtılıyor ve saklanıyor?
3. GCS ile İHA arasındaki fiziksel/RF katmanda ek bir şifreleme
   (ör. donanım seviyesinde AES) var mı?
4. Zaman damgası senkronizasyonu (time sync) nasıl sağlanıyor; saat kayması
   (clock drift) replay penceresini büyütüyor mu?

## Savunma Önerileri (Özet)

- MAVLink 2 kullanın ve **message signing'i mutlaka etkinleştirin**.
- Paylaşılan anahtarları GCS tarafında güvenli şekilde saklayın (düz metin
  config dosyasında bırakmayın).
- Mümkünse haberleşme linkine ek bir şifreleme katmanı (ör. VPN tüneli,
  donanımsal şifreleme) ekleyin.
- Telemetri trafiğini anomali tespiti için pasif olarak izleyin (beklenmeyen
  komut dizileri, ani konum sıçramaları vb.).

## Sonuç

MAVLink, İHA ekosisteminin en kritik protokollerinden biri ve güvenlik
özellikleri (özellikle message signing) doğru yapılandırıldığında ciddi bir
koruma sağlıyor. Ancak bu özelliklerin "var olması" ile "aktif ve doğru
yapılandırılmış olması" arasındaki fark, gerçek dünyadaki güvenlik
seviyesini belirleyen asıl unsur.
