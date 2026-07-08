---
title: "Race Condition ve Mantık Hataları: Zamanlamayla Kırılan Uygulamalar"
date: 2026-07-07 10:00:00 +0300
tags: [business-logic, race-condition, web-security, pentest, siber-guvenlik]
author: CyEn07
---

Daha önce [business logic zafiyetlerine]({% post_url 2026-06-22-business-logic-zafiyetleri %})
genel bir giriş yapmıştık. Bu yazıda bu ailenin en sinsi üyelerinden birine
odaklanıyoruz: **race condition (yarış durumu)** ve zamanlamaya dayalı mantık
hataları. Bunlar kodun "syntax"ında değil, **eşzamanlılık varsayımlarında**
saklıdır — bu yüzden otomatik tarayıcılar neredeyse hiç yakalayamaz.

> İçerik kavramsaldır; yalnızca kendi test ortamında veya yazılı izinli
> sistemlerde uygula.

## Race Condition Nedir?

Bir race condition, iki veya daha fazla işlemin **paylaşılan bir duruma**
(bakiye, stok, kupon sayacı) neredeyse aynı anda erişmesiyle oluşur.
Uygulama "önce kontrol et, sonra uygula" mantığını atomik olmayan şekilde
yaparsa, kontrol ile uygulama arasındaki minik boşluk istismar edilebilir.
Buna **TOCTOU** denir: *Time-Of-Check to Time-Of-Use*.

## Klasik Senaryo: Bakiye/Kupon

Bir cüzdandan para çekme uç noktası düşünelim:

```
1. Bakiyeyi oku        (100 TL var mi?)
2. Yeterliyse dus       (bakiye -= 100)
```

Bu iki adım atomik değilse ve saldırgan **aynı anda 10 paralel istek**
gönderirse:

```
10 x  POST /wallet/withdraw {"amount": 100}
```

Tüm istekler 1. adımı "100 TL var" diye okuyabilir (henüz kimse düşmedi),
sonra hepsi düşer — sonuçta 100 TL'lik bakiyeden defalarca çekim onaylanır.
Aynı desen şurada da geçerlidir:

- Tek kullanımlık kuponun eşzamanlı çok kez uygulanması
- Son 1 adet stok için birden çok siparişin onaylanması
- "Hesap başına 1 kez" bonusun paralel isteklerle çoğaltılması

## Zamanlamaya Dayalı Diğer Mantık Hataları

### 1. State Machine (Durum Makinesi) İhlali

Çok adımlı bir akışta (sepet → ödeme → onay) sunucu, adımların **sırasını**
doğrulamıyorsa, saldırgan ödeme adımını atlayıp doğrudan "onay"a istek atabilir.

### 2. Değiştir-Onayla Yarışı

"Fiyatı gör" ile "satın al" arasında fiyatın değişebilmesi; ya da sepet
tutarını istemcinin göndermesi ve sunucunun tekrar doğrulamaması.

### 3. Rate-Limit / OTP Yarışı

OTP doğrulama veya parola deneme sayacının eşzamanlı isteklerde düzgün
sayılmaması (kilit mekanizması yarış içeriyorsa brute-force hızlanır).

## Nasıl Test Edilir?

1. Durum değiştiren (para, stok, kupon, bonus) uç noktaları belirle.
2. Aynı isteği **eşzamanlı** olarak çoklu gönder (ör. tek TCP bağlantısında
   "single-packet attack" veya paralel thread'ler).
3. Beklenenden fazla işlem onaylandı mı kontrol et (2 yerine 10 çekim gibi).
4. Çok adımlı akışlarda adımları atla / sırayı boz / tekrar gönder.

## Korunma Yöntemleri

| Önlem | Açıklama |
|---|---|
| Atomik işlemler | Kontrol + güncellemeyi tek atomik DB işleminde yap |
| Veritabanı kilidi | `SELECT ... FOR UPDATE` / satır kilidi ile eşzamanlı erişimi serile |
| Idempotency key | Aynı isteğin tekrarını benzersiz anahtarla tek sefere indir |
| Koşullu güncelleme | `UPDATE ... WHERE bakiye >= 100` — kontrolü tek atomik adımda kur |
| Sunucu tarafı durum | Akış sırasını ve tutarları asla istemciye güvenme, sunucuda doğrula |
| Uygun kilit/mutex | Kritik bölgeyi eşzamanlılığa karşı koru |

### Anahtar Fikir: Kontrol ve Uygulamayı Ayırma

Race condition'ların çoğu, "önce SELECT ile bak, sonra UPDATE ile uygula"
kalıbından doğar. Çözüm bu ikisini **tek atomik işleme** indirmektir:

```sql
UPDATE wallet SET balance = balance - 100
WHERE user_id = 42 AND balance >= 100;
```

Bu tek ifade, "yeterli bakiye varsa düş" kontrolünü ve güncellemeyi aynı anda
yapar; etkilenen satır sayısı 0 ise işlem reddedilir. Araya girecek boşluk
kalmaz.

## Sonuç

Race condition ve zamanlama tabanlı mantık hataları, uygulamanın "tek
kullanıcı, sıralı istek" varsayımının çöktüğü yerde ortaya çıkar. Bu açıkları
bulmak da kapatmak da eşzamanlılığı bir saldırgan gibi düşünmeyi gerektirir:
**paylaşılan her durumu atomik koru, sırayı ve tutarı daima sunucuda doğrula.**
