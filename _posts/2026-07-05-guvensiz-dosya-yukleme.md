---
title: "Güvensiz Dosya Yükleme: Web Shell'den RCE'ye Giden Yol"
date: 2026-07-05 10:00:00 +0300
tags: [file-upload, web-security, rce, siber-guvenlik, owasp]
author: CyEn07
---

Dosya yükleme, neredeyse her web uygulamasında bulunan bir özelliktir: profil
fotoğrafı, belge, ek dosya... Ama düzgün korunmadığında **güvensiz dosya
yükleme**, saldırganın sunucuya çalıştırılabilir kod (web shell) bırakıp
uzaktan komut çalıştırmasına (RCE) kadar giden ciddi bir zafiyettir.

> Yalnızca kendi test ortamında veya yazılı izinli sistemlerde uygula.

## Temel Risk: Çalıştırılabilir Dosya Yükleme

Saldırgan, sunucunun yorumlayabileceği bir dosya yükleyip ona doğrudan
erişebilirse, o dosya sunucuda çalışır. Klasik PHP web shell:

```php
<?php system($_GET['cmd']); ?>
```

`shell.php` olarak yüklenip `https://site.com/uploads/shell.php?cmd=id`
şeklinde çağrılırsa, saldırgan sunucuda komut çalıştırır.

## Sık Görülen Baypas Teknikleri

Zayıf filtreler çeşitli yollarla atlatılır:

### 1. Uzantı Hileleri

```
shell.php.jpg      shell.pHp       shell.php5
shell.phtml        shell.php%00.jpg   (null byte)
```

### 2. Content-Type Sahtekârlığı

Sunucu yalnızca `Content-Type: image/png` başlığına güveniyorsa, saldırgan bu
başlığı elle `image/png` yapıp içeriği PHP bırakabilir.

### 3. Magic Byte + Polyglot

Dosyanın başına geçerli bir resim imzası (magic bytes) eklenip devamına kod
yazılır; hem "resim" gibi görünür hem de yorumlanınca kod çalışır:

```
GIF89a; <?php system($_GET['cmd']); ?>
```

### 4. Yol Geçişi (Path Traversal)

Dosya adı doğrulanmıyorsa, dosya beklenen klasörün dışına yazdırılabilir:

```
filename = "../../var/www/html/shell.php"
```

## Sadece RCE Değil

Güvensiz yükleme başka etkiler de doğurur:

- **XSS:** Yüklenen SVG/HTML dosyası tarayıcıda script çalıştırabilir.
- **DoS:** Çok büyük dosyalarla disk/bellek tüketimi (ZIP bomb dahil).
- **Antivirüs/depolama zehirlenmesi:** Zararlı içeriğin sunucuda barınması.

## Korunma Yöntemleri

| Önlem | Açıklama |
|---|---|
| Uzantı beyaz listesi | Sadece izinli uzantılara izin ver (kara liste değil) |
| İçerik doğrulama | Uzantıya değil, gerçek dosya türüne (magic byte + kütüphane) bak |
| Yeniden adlandırma | Yüklenen dosyaya rastgele/güvenli bir ad ver, kullanıcı adını kullanma |
| Yürütmeyi kapat | Yükleme klasöründe script çalıştırmayı engelle (web sunucu ayarı) |
| Ayrı depolama | Dosyaları uygulama kök dizini dışında veya bir CDN/object storage'da tut |
| Boyut/oran limiti | Maksimum boyut ve yükleme hız limiti uygula |

### Kritik İlke: Yükleme Klasöründe Çalıştırmayı Engelle

En etkili tekil önlem, dosyaların servis edildiği yerde **kod çalıştırmayı
tamamen kapatmaktır**. Dosya "resim" bile olsa yorumlanamıyorsa, web shell
işe yaramaz. Bunu web sunucusu yapılandırmasıyla (ör. o dizinde PHP/exec
kapalı) veya dosyaları hiç kod çalıştırılamayan bir object storage'da tutarak
sağlarsın.

## Sonuç

Güvensiz dosya yüklemede tek bir kontrole güvenmek (yalnızca uzantı ya da
yalnızca Content-Type) neredeyse her zaman atlatılır. Doğru yaklaşım katmanlı
savunmadır: beyaz liste + gerçek içerik doğrulama + güvenli yeniden
adlandırma + **yükleme dizininde çalıştırmayı kapatma.** Bu katmanlar birlikte,
yüklenen bir dosyanın RCE'ye dönüşme ihtimalini pratikte ortadan kaldırır.
