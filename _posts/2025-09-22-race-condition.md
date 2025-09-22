---
layout: post
title: "Race Condition: Nedir, Nasıl Tespit Edilir ve Önlenir?"
date: 2025-09-22
tags: [web-security, race-condition, pentest, concurrency]
author: "07enesavci"
reading_time: true
summary: "Race Condition zafiyetinin kısa tanımı, tespit yaklaşımları ve korunma yolları — öz ve uygulanabilir rehber."
---

# Race Condition Nedir?

**Race condition**, birden fazla işlemin aynı kaynağa eş zamanlı veya yakın zamanlı erişmesi sonucu ortaya çıkan ve beklenmeyen ya da istenmeyen davranışlar oluşturabilen durumdur. Güvenlik bağlamında saldırganlar bu zamanlama alakasızlıklarından faydalanarak yetki atlatma, çift kullanım (double-spend) veya veri tutarsızlığı gibi kötü amaçlar gerçekleştirebilir.

> **Uyarı:** Aşağıdaki bilgiler eğitim/CTF/izinli pentest amaçlıdır. İzinsiz test veya saldırı yasa dışıdır.

---

## Neden önemlidir?
Race condition’lar genellikle uygulama mantığına derin etkide bulunur ve veritabanı/işlem seviyesinde tutarsızlıklara yol açar. Finansal işlemler, kupon/indirim kullanımı ve dosya işleme gibi kritik akışlarda ciddi ekonomik ve güvenlik sonuçları doğurabilir.

---

## Kısa tespit yaklaşımları
- Aynı endpoint’e **paralel/çoklu istekler** göndererek tutarsız sonuçlar arayın.  
- Oturum, bakiye veya kaynak işaretleme adımlarının kontrol ve kullanım arasındaki boşlukları inceleyin.  
- Burp Intruder, paralel curl/requests script’leri veya özel multithread PoC script’leri kullanın.  
- Testleri önce staging/lab ortamında yapın; prod’da doğrudan denemeyin.

---

## Temel korunma (özet)
- **Atomic işlemler / transaction** kullanın (ACID).  
- Kritik işlemlerde **row-level locking** veya `SELECT ... FOR UPDATE` gibi DB kilitleme yöntemleri uygulayın.  
- **Unique constraints** ve veritabanı seviyesinde kısıtlamalarla çift kullanım engelleyin.  
- **Idempotency keys** ve işlem token’ları kullanarak aynı isteğin tekrarını engelleyin.  
- Dağıtık sistemlerde **distributed locks** (ör. Redis Redlock) veya koordinasyon servisleri (Zookeeper) tercih edin.

---

## Kısa öneriler
- Kritik bölge (check → update) süresini mümkün olduğunca kısaltın.  
- Kilitleri uzun süre tutmayın; timeout ve retry/backoff mekanizmaları kullanın.  
- Otomatik testler ve izleme ile anormal paralel istekleri tespit edin.

---

## Raporlama & Etik
- PoC hazırlarken destructive komutlardan kaçının; etkisini gösterecek ama zarar vermeyecek örnekler sunun.  
- Etki (potansiyel finansal kayıp, veri tutarsızlığı vb.) ve düzeltme önerilerini net yazın.  
- Responsible disclosure sürecine uyun.

---

## Kısa özet
Race conditionlar zamanlama kaynaklı mantık zafiyetleridir. Korunmak için işlem atomikliği sağlanmalı, DB seviyesinde kısıtlamalar kullanılmalı ve idempotency ile distributed locking tercih edilmelidir.

## Kaynaklar
- OWASP: Race Conditions / TOCTOU (genel kaynaklar)  
- PostgreSQL docs — `SELECT ... FOR UPDATE`  
- Redis Redlock specification
