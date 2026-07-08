---
title: "Ağ Güvenliği Temelleri: Saldırı Yüzeyinden Savunmaya"
date: 2026-07-06 10:00:00 +0300
tags: [ag-guvenligi, network-security, siber-guvenlik, pentest]
author: CyEn07
---

Web uygulama zafiyetleri saldırganın kapıdan girmesini sağlar; **ağ
güvenliği** ise saldırganın içeri girdikten sonra ne kadar yayılabileceğini
ve trafiğin ne kadar korunduğunu belirler. Bu yazıda ağ güvenliğinin temel
kavramlarını, en sık görülen saldırıları ve savunma yaklaşımlarını ele
alıyoruz.

> Anlatılan teknikler yalnızca kendi laboratuvar ortamında veya yazılı izinli
> testlerde uygulanmalıdır.

## Ağ Katmanında Saldırı Yüzeyi

Bir ağın saldırı yüzeyi kabaca üç başlıkta toplanır:

1. **Açık servisler:** Dışarıya (veya iç ağa) açık portlar ve üzerlerinde
   çalışan servisler (SSH, RDP, SMB, veritabanları...).
2. **Trafiğin korunması:** Verinin şifreli mi düz metin mi aktığı.
3. **Segmentasyon:** Bir bölgenin ele geçirilmesinin diğerlerine sıçrayıp
   sıçramadığı.

## Keşif (Reconnaissance)

Hemen her ağ saldırısı keşifle başlar. Saldırgan hangi hostların ayakta,
hangi portların açık ve hangi servis sürümlerinin çalıştığını haritalar.
Yaygın araç `nmap`:

```
nmap -sV -p- 10.0.0.0/24
```

Savunmacı açısından bu, "benim dışarıya/iç ağa ne gösterdiğimi" bilmek
demektir. Görünmeyen bir portu kimse hedefleyemez — bu yüzden **saldırı
yüzeyini küçültmek** ilk savunmadır.

## Sık Görülen Ağ Saldırıları

### 1. MITM (Man-in-the-Middle)

Saldırgan, iki taraf arasındaki trafiğe araya girer. Yerel ağda tipik yöntem
**ARP spoofing**: saldırgan kendini ağ geçidiymiş gibi tanıtıp trafiği
üzerinden geçirir. Trafik şifresizse (düz HTTP, düz protokoller) içeriği
okur/değiştirir.

### 2. Pasif Dinleme (Sniffing)

Anahtarlanmamış veya yanlış yapılandırılmış ağlarda saldırgan, kendisine ait
olmayan paketleri yakalayabilir. Şifresiz kimlik bilgileri (FTP, Telnet, düz
HTTP) burada sızar.

### 3. DoS / DDoS

Servisi veya bant genişliğini tüketerek erişilemez kılma. Hacim tabanlı
(flood), protokol tabanlı (SYN flood) veya uygulama katmanı olabilir.

### 4. Lateral Movement (Yanal Hareket)

Saldırgan bir makineyi ele geçirdikten sonra ağ içinde diğer sistemlere atlar.
Düz/segmentsiz ağlarda tek bir zafiyetli host, tüm ağın düşmesine yol açabilir.

## Savunma Katmanları

### Segmentasyon (En Önemli İlke)

Ağı işlevine göre bölgelere ayır (kullanıcı ağı, sunucu ağı, yönetim ağı,
DMZ). Bir bölge ele geçirilse bile saldırganın diğerlerine geçmesi zorlaşır.
Modern yaklaşım **Zero Trust**: "iç ağdayım, o hâlde güvenilirim" varsayımını
reddeder; her erişim ayrıca doğrulanır.

### Şifreleme

Trafiği her yerde şifrele: web için HTTPS/TLS, uzaktan yönetim için SSH,
kablosuz için WPA3. Düz metin protokolleri (Telnet, FTP, düz HTTP) devre dışı
bırak.

### Firewall ve En Az Yetki

| Önlem | Açıklama |
|---|---|
| Firewall (deny-by-default) | Varsayılan yasak, sadece gereken portlar açık |
| Egress filtreleme | Dışarı çıkan trafiği de sınırla (OOB sızıntı/C2 için) |
| Servis sıkılaştırma | Kullanılmayan servisleri kapat, sürümleri güncel tut |
| NIDS/NIPS | Anormal trafiği tespit/engelle (ör. tarama, flood) |
| VPN + MFA | Uzaktan erişimi şifreli tünel + çok faktörlü doğrulama ile koru |

### İzleme ve Loglama

Saldırıların çoğu, keşif ve yanal hareket sırasında iz bırakır. Merkezi
loglama (SIEM) ve anomali tespiti, "ele geçirildikten sonra fark etme"
süresini kısaltır.

## Sonuç

Ağ güvenliği tek bir üründe değil, katmanların birlikte çalışmasında saklıdır:
**saldırı yüzeyini küçült, her yeri şifrele, ağı segmentlere ayır, en az
yetkiyle çalış ve sürekli izle.** İyi tasarlanmış bir ağda tek bir zafiyet
felakete dönüşmez; segmentasyon ve izleme sayesinde saldırgan hem yavaşlar hem
görünür hâle gelir.
