---
layout: post
title: "Business Logic Flaws: Nedir, Nasıl Tespit Edilir ve Önlenir?"
date: 2025-09-26
tags: [web-security, business-logic, pentest, application-security]
author: "07enesavci"
summary: "Business Logic Flaws, uygulamaların iş mantığındaki zayıflıklardan kaynaklanan güvenlik açıklarıdır. Bu yazıda tanım, örnekler, tespit yöntemleri ve korunma yollarını inceliyoruz."
---

# Business Logic Flaws Nedir?

**Business Logic Flaws (BLF)**, bir web uygulamasının iş kurallarındaki tasarım hatalarından kaynaklanan zafiyetlerdir.  
Diğer zafiyetler (SQLi, XSS vb.) gibi doğrudan teknik değil, uygulamanın **nasıl çalışması gerektiğine dair mantığın** yanlış uygulanmasından doğar.  

Bu tip açıklar genellikle:
- Kullanıcıların beklenmedik yollarla iş akışını manipüle etmesine,
- Yetkisiz işlemler yapmasına,
- Finansal kayıplara veya veri ihlallerine
sebep olur.

---

## Örnek Senaryolar

### 1. Kupon Kodlarının Mantıksal Yanlış Kullanımı
Bir e-ticaret sitesinde aynı kuponun sınırsız kullanılabilmesi, kullanıcıların defalarca indirimden yararlanmasına neden olabilir.

### 2. Para Transferinde Mantık Açığı
Bankacılık uygulamasında transfer miktarı negatif değer girildiğinde, saldırganın kendi hesabına para eklemesi.

### 3. Adım Atlatma (Workflow Manipulation)
Bir kayıt sürecinde e-posta doğrulaması yapılmadan "Hesap Onaylandı" adımına geçilebilmesi.

### 4. Limit Kontrolünün Eksikliği
API’de günlük işlem limiti tanımlı olmasına rağmen, limitin istemci tarafında kontrol edilmesi → saldırgan kolayca limiti aşabilir.

---

## Tespit Yöntemleri

Business Logic Flaws genellikle otomatik tarayıcılarla tespit edilmez, çünkü bu açıklar **uygulamanın iş kurallarını anlamayı** gerektirir.  
Bu yüzden manuel test kritik önem taşır.

1. **Uygulama Akışını Anlamak**  
   - Kullanıcı yolculuğu (login → sepet → ödeme → onay) detaylı incelenmeli.
   
2. **Beklenmeyen Girdilerle Test**  
   - Negatif miktarlar, tekrar eden işlemler, atlanan adımlar.

3. **Yetki Kontrollerini Denetlemek**  
   - Normal kullanıcı admin işlemi yapabiliyor mu?
   - İşlemler sadece frontend tarafında mı doğrulanıyor?

4. **Durum Geçişlerini Manipüle Etmek**  
   - API çağrılarını farklı sırada yapmak.
   - Session değerlerini değiştirmek.

---

## Korunma Yöntemleri

- **Net İş Kuralları Belirleyin** → Uygulamanın nasıl çalışması gerektiği dokümante edilmeli.  
- **Sunucu Taraflı Doğrulama** → Kritik kontroller hiçbir zaman yalnızca istemci tarafında bırakılmamalı.  
- **Rol ve Yetki Kontrolleri** → Kullanıcı rolleri (admin, user, guest) sıkı şekilde ayrılmalı.  
- **Test Senaryoları** → Sadece teknik değil, mantıksal test senaryoları da QA sürecine eklenmeli.  
- **Threat Modeling** → Olası kötüye kullanım yolları önceden düşünülmeli.  

---

## Sonuç

Business Logic Flaws, çoğu zaman **teknik zafiyetlerden daha tehlikeli** olabilir çünkü doğrudan iş süreçlerini hedef alır.  
Bir SQL Injection tarayıcı ile yakalanabilir ama iş mantığı açığını bulmak için **yaratıcılık ve iş akışını anlama** gerekir.  

> **Not:** Bu yazı yalnızca eğitim, CTF ve izinli pentest çalışmaları için hazırlanmıştır. İzinsiz saldırılar **yasadışıdır**.

---
