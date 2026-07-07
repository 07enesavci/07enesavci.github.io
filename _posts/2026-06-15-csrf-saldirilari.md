---
title: "CSRF (Cross-Site Request Forgery) Saldırıları ve Korunma Yöntemleri"
date: 2026-06-15 10:00:00 +0300
tags: [csrf, web-security, siber-guvenlik]
author: CyEn07
---

**CSRF (Cross-Site Request Forgery)**, bir kullanıcının oturumunun,
kullanıcının haberi/isteği olmadan başka bir siteden tetiklenen isteklerle
kötüye kullanılmasını sağlayan bir web güvenlik açığıdır. SQLi veya XSS
kadar sık konuşulmasa da, doğru koşullarda hesap ele geçirmeye kadar
gidebilir.

> Bu yazı savunma ve farkındalık amaçlıdır. Örnekler yalnızca kendi test
> ortamınızda veya yazılı izniniz olan sistemlerde denenmelidir.

## CSRF Nasıl Çalışır?

Tarayıcılar, bir siteye ait çerezleri (cookie) o siteye giden **her**
istekle birlikte otomatik olarak gönderir — isteğin nereden tetiklendiğine
bakmaksızın. CSRF bu davranışı istismar eder:

1. Kullanıcı, `bank.com` sitesinde oturum açmış durumdadır (cookie tarayıcıda
   saklı).
2. Kullanıcı, saldırganın hazırladığı kötü niyetli bir sayfayı (`evil.com`)
   ziyaret eder.
3. Bu sayfa, arka planda kullanıcının tarayıcısı üzerinden `bank.com`'a
   otomatik bir istek gönderir (örneğin bir form submit veya `<img>` etiketi
   ile GET isteği).
4. Tarayıcı bu isteğe kullanıcının `bank.com` çerezlerini otomatik ekler ve
   `bank.com`, isteği meşru kullanıcıdan gelmiş gibi işler.

### Klasik Örnek (GET tabanlı, savunmasız para transferi)

```html
<!-- evil.com üzerinde -->
<img src="https://bank.com/transfer?to=saldirgan&amount=1000" width="0" height="0" />
```

Kullanıcı bu sayfayı ziyaret ettiği an, tarayıcı görseli yüklemeye
çalışırken isteği tetikler ve oturum çerezi otomatik gönderilir.

### POST Tabanlı Otomatik Form

Daha modern uygulamalarda GET ile durum değiştiren işlemler nadir olsa da
POST formları da otomatik submit edilerek istismar edilebilir:

```html
<form action="https://bank.com/transfer" method="POST" id="f">
  <input type="hidden" name="to" value="saldirgan" />
  <input type="hidden" name="amount" value="1000" />
</form>
<script>document.getElementById("f").submit();</script>
```

## CSRF'nin Ön Koşulları

Bir isteğin CSRF'ye açık olması için genelde şu koşullar sağlanmalıdır:

- İstek, oturum durumuna (cookie) dayalı kimlik doğrulama kullanıyor olmalı
  (token tabanlı Authorization header'lar tarayıcı tarafından otomatik
  eklenmediği için genelde CSRF'ye daha dayanıklıdır).
- İstek, tahmin edilebilir/sabit parametrelerle yeniden oluşturulabilir
  olmalı.
- Uygulamada isteğin kaynağını doğrulayan bir mekanizma (CSRF token, SameSite
  cookie vb.) bulunmamalı.

## Korunma Yöntemleri

### 1. Anti-CSRF Token

En yaygın ve güvenilir yöntem. Sunucu, her form/oturum için tahmin
edilemez, rastgele bir token üretir; bu token forma gizli bir alan olarak
eklenir ve her durum değiştiren istekte (POST/PUT/DELETE) sunucu tarafında
doğrulanır.

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="a1b2c3...random...">
  <!-- diğer alanlar -->
</form>
```

Sunucu tarafında, gelen `csrf_token` değeri kullanıcının oturumuna
kaydedilen değerle eşleşmiyorsa istek reddedilir.

### 2. SameSite Cookie Özniteliği

Modern tarayıcılar `SameSite` cookie özniteliğini destekler:

- `SameSite=Strict` — cookie yalnızca aynı site üzerinden gelen isteklerde
  gönderilir.
- `SameSite=Lax` — üst düzey (top-level) navigasyonlarda GET istekleri için
  gönderilir, ama cross-site POST'larda gönderilmez (birçok CSRF senaryosunu
  engeller).
- `SameSite=None` — eski davranış, cross-site isteklerde de gönderilir
  (mutlaka `Secure` ile birlikte kullanılmalı).

```
Set-Cookie: session=xyz; SameSite=Lax; Secure; HttpOnly
```

`SameSite=Lax` günümüzde birçok tarayıcıda **varsayılan** davranıştır, bu da
CSRF'yi eskiye göre daha zor hale getirmiştir — ama tek başına yeterli bir
savunma olarak görülmemelidir.

### 3. Custom Header Kontrolü

AJAX tabanlı uygulamalarda, sunucunun yalnızca belirli bir custom header'ın
(örn. `X-Requested-With`) varlığını kontrol etmesi de bir savunma katmanı
olabilir; çünkü basit form/img tabanlı CSRF saldırıları custom header
ekleyemez (CORS kısıtlamaları nedeniyle).

### 4. Kritik İşlemler İçin Yeniden Kimlik Doğrulama

Şifre değiştirme, para transferi gibi kritik işlemlerde kullanıcıdan
şifresini tekrar girmesini istemek, token çalınsa bile ek bir güvenlik
katmanı sağlar.

## Sonuç

CSRF, SameSite cookie'lerin yaygınlaşmasıyla eskisi kadar sık görülmese de,
özellikle eski sistemlerde veya SameSite ayarı yanlış yapılandırılmış
uygulamalarda hâlâ ciddi bir risk. Sağlam bir savunma; **anti-CSRF token +
SameSite cookie + doğru CORS yapılandırması** üçlüsünün birlikte
kullanılmasından geçiyor.
