---
layout: post
title: "Broken Authentication (Bozuk Kimlik Doğrulama): Nedir, Nasıl Tespit Edilir ve Nasıl Önlenir?"
date: 2025-09-24
tags: [web-security, authentication, owasp, pentest]
author: "07enesavci"
summary: "Broken Authentication zafiyeti nedir, sık görülen örnekler, tespit yöntemleri, exploit/POC fikirleri ve kalıcı korunma (defensive) adımları."
---

# Broken Authentication (Bozuk Kimlik Doğrulama)

**Uyarı:** Bu yazı eğitim/CTF/izinli penetration testing amaçlıdır. Buradaki teknikleri sadece yetki verilen ortamlarda kullan. İzinsiz test ve istismar yasa dışıdır.

---

## 1. Kısa tanım
**Broken Authentication (Bozuk Kimlik Doğrulama)**, bir uygulamanın kimlik doğrulama ve oturum yönetimi işlemlerinde (login, password reset, session/token yönetimi, MFA, vs.) hatalar bulunduğu ve bunların saldırganlar tarafından hesap ele geçirme, hesap devralma, oturum çalma veya yetki yükseltme için istismar edilebildiği bir kategoridir. OWASP Top 10'da sıklıkla yüksek riskli olarak yer alır.

---

## 2. Neden tehlikeli?
- Doğrudan kullanıcı hesaplarının ele geçirilmesine sebep olur (e-posta, banka, yönetici hesapları vb.).  
- Veri sızıntısı, finansal kayıp, yetkisiz işlem ve pivot (hareket) imkânı verir.  
- Genelde otomasyon (credential stuffing, brute force) ile hızlı etkili olur.

---

## 3. Yaygın Broken Authentication örnekleri

1. **Zayıf / Tahmin edilebilir şifre politikası**: Kısıtlı parola kuralları veya düşük karmaşıklık.  
2. **Kaba kuvvet (brute force) ve credential stuffing koruması yok**: Rate limit, IP throttling, CAPTCHA yok.  
3. **Hatalı oturum yönetimi**: Oturum ID'leri tahmin edilebilir, session fixation açık, logout sonrası session invalidation yok.  
4. **Güvenli olmayan parola sıfırlama akışı**: Parola sıfırlama linkleri tahmin edilebilir, kısa expiration, token doğrulanmıyor.  
5. **İnsecure direct object references (IDOR) ile birleşince**: Başka bir hesapla işlem yapılabiliyor.  
6. **JWT / token hataları**: Signatures doğrulanmıyor, `alg: none` kabul ediliyor, token secret zayıf.  
7. **Multi-Factor Authentication (MFA) eksik veya yanlış uygulanmış**: Backup kodlar güvenli değil veya MFA bypass mümkün.  
8. **Credential exposure**: Parolaların plaintext veya zayıf hash (MD5/SHA1 salt olmadan) olarak saklanması.  
9. **Login CSRF / Login CSRF + session fixation**: Kullanıcı saldırgan hesabıyla oturum açtırılabilir.  
10. **Yan kanal/yanlış mesajlar**: Farklı hata mesajları kullanıcı varlığını doğruluyor (username enumeration).

---

## 4. Tespit / Penetration testing yaklaşımları (yetkili ortamlarda)

> Testleri yalnızca izin verilen hedeflerde yap, otomasyonla siteyi çökertme, rate limitleri aşma veya rızasız kullanıcı bilgilerini ele geçirme.

### 4.1 Bilgi toplama ve ön kontrol
- Login, signup, logout, password-reset, change-email, 2FA enable/disable endpoint'lerini bul.  
- Hata mesajlarını incele: `Invalid username` vs `Invalid password` gibi mesajlar kullanıcı varlığını sızdırır.  
- Session cookie/Authorization header nasıl set ediliyor? `Set-Cookie` parametrelerine bak (Secure, HttpOnly, SameSite).  
- Token üretim mantığını incele (JWT payload, expiry, secret ifşası).

### 4.2 Otomasyonlu testler (izinli)
- **Credential stuffing**: Veri sızıntılarından gelen kombolar test edilir (yetkiyle).  
- **Brute force**: Düşük hızda test; önce rate-limiting etkisi ölçülür.  
- **Session fixation**: Yeni session id oluşturup login sonrası değişip değişmediğini kontrol et.  
- **Password reset token testleri**: Token uzunluğu, öngörülebilirliği, reuse edilebilir-ness test edilir.  
- **JWT manipülasyonu**: `alg: none` testleri (ancak modern kütüphaneler bunu engeller), payload değiştirme, expiry rollback.  
- Araçlar: Burp Suite (Intruder, Repeater), wfuzz/gobuster (endpoint discovery), Hydra/Medusa (izinli brute force), custom Python scripts.

### 4.3 Örnek kontrol listesi
- Oturum id'leri uzun, kriptografik mi? (`/16` random değil).  
- Session fixation açık mı? (login sonrası session ID değişiyor mu?)  
- Parola sıfırlama tokenleri tek kullanımlık mı ve expiry var mı?  
- E-posta/ kullanıcı adı enumeration var mı?  
- 2FA opsiyonları var mı ve doğru uygulanmış mı?  
- Passwords hashing: bcrypt/argon2/scrypt kullanılıyor mu? Salt var mı?  
- Rate limiting/lockout/CAPTCHA var mı?  
- Admin/privileged opsiyonlar için ekstra doğrulama var mı?

---

## 5. Pratik POClar (Eğitim amaçlı, sadece izinli ortamlar)

### 5.1 Username enumeration (örnek)
- Kayıtlı olmayan kullanıcı için gelen hata: `User not found`  
- Kayıtlı kullanıcı için gelen hata: `Incorrect password`  
Bu farklılık brute-force sırasında önce hangi kullanıcıların var olduğunu belirlemeye yarar.

### 5.2 Session fixation (manuel POC)
1. Saldırgan siteyi ziyaret eder, kendi tarayıcısında bir session id alır (`sess=ATTACKERSESSION`).  
2. Saldırgan kurbana özel link gönderir (ör: `https://target.site/set_session?sess=ATTACKERSESSION` veya HTTP resp ile cookie set ettirir).  
3. Kurban bu session ile login olursa, saldırgan aynı sess id ile oturumu kullanabilir — eğer login sonrası session id yenilenmiyorsa.

> Not: Modern framework'ler genelde `session_regenerate_id()` sağlar; yoksa açık var demektir.

---

## 6. Kalıcı ve pratik korunma (defensive)

### 6.1 Parola saklama
- **İyi hash**: `bcrypt`, `argon2` veya `scrypt` kullan. Argon2 önerilir (ayarlanabilir memory/time).  
- **Salt**: Her kullanıcıya özgü salt (genelde hash fonksiyonları bunu sağlar).  
- **Work factor**: Donanıma göre work factor ayarla. (Ör: bcrypt cost 12+ veya Argon2 memory/time uygun).  
- **Parola policy**: Zorunlu uzunluk (en az 8-12), parola blacklist (123456 vb), dizin kontrolü (HaveIBeenPwned API ile banned password check).  
- **Hash algoritmalarını güncelle**: Eskimiş hash algolarından migrate planı yap.

### 6.2 Brute-force ve credential stuffing'e karşı
- **Rate limiting**: IP veya account bazında istek sınırlaması.  
- **Progressive delays ve account lockout**: 5 başarısız girişten sonra kısa süreli kilitleme.  
- **CAPTCHA**: şüpheli davranışlarda (çok sayıda başarısız giriş) CAPTCHA göster.  
- **Credential stuffing detection**: Çoklu IP’den aynı kullanıcı veya çoklu kullanıcıdan aynı IP patternleri tespit et.  
- **Notify user on suspicious login**: Yeni cihaz/konumdan girişte e-posta/SMS bildirimi.

### 6.3 Oturum (Session) yönetimi
- **Session ID güvenliği**: Uzun, rastgele, kriptografik güvenli üretim.  
- **Session fixation prevention**: Login sonrası `session_regenerate_id()` yap.  
- **Logout**: Logout işleminde session invalidate / destroy yapılmalı.  
- **Cookie flags**: `Secure`, `HttpOnly`, `SameSite=Strict/Lax` ayarla.  
- **Idle ve absolute timeout**: Oturumlarda idle timeout (ör. 15–30 dk), absolute max duration (ör. 24 saat).  
- **Store sensitive token metadata**: IP/device fingerprint, expiry, issued_at, renew logic.

### 6.4 Parola sıfırlama ve e-posta doğrulama
- **Tek kullanımlık, uzun, kriptografik token** üret (`>= 128 bit` entropy).  
- Token short expiry (örn. 1 saat).  
- Token sadece bir kez kullanılabilir, kullanıldıktan sonra invalidate et.  
- Password reset linkleri HTTPS olsun; reset tokenler URL'de yer alırken bile hash'lenmiş token karşılaştırılabilir (DB'de token hash sakla).  
- Email içerikleri minimal bilgi verip account existence leak etmemeli.

### 6.5 MFA (Multi-Factor Authentication)
- **MFA zorunlu veya önerilen**: SMS yerine TOTP (Authenticator apps) veya FIDO2/Hardware keys daha güvenli.  
- **Recovery code güvenliği**: Tek kullanımlık, güvenli saklama ve sınırlı kullanımlı.  
- **MFA bypass koruması**: MFA disable işlemleri ekstra doğrulama ister.

### 6.6 JWT & tokenler
- **Secret yönetimi**: Güçlü, rotate edilebilir secret.  
- **Doğru `alg` kontrolü**: `alg` header'ı sunucu tarafından kısıtlanmalı (accept only HS256 or RS256 with proper verification).  
- **Short expiry & refresh token pattern**: Access token kısa (örn. 15m), refresh token güvenli ve revoke edilebilir.  
- **Blacklist/revoke**: Logout/compromise durumunda tokenleri blacklist et.

---

## 7. Framework örnekleri (kısa kod-snippet)

### 7.1 Node.js (Express) — Güçlü parola hash
```js
// bcrypt ile kayıt
const bcrypt = require('bcrypt');
const saltRounds = 12;
const plain = 'user-password';

bcrypt.hash(plain, saltRounds).then(hash => {
  // DB'ye hash kaydet
});
