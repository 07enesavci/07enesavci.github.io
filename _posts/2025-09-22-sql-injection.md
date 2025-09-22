---
layout: post
title: "SQL Injection: Türleri, Örnekler ve Korunma Yöntemleri"
date: 2025-09-22
tags: [web-security, sqli, pentest, database]
author: "07enesavci"
reading_time: true
summary: "SQL Injection nedir, türleri, örnek payload'lar, tespit yöntemleri ve korunma adımları."
---

# SQL Injection (SQLi) Nedir?

SQL Injection (SQLi), web uygulamalarının veritabanı sorgularını kullanıcı girdisiyle doğrudan oluşturması sonucu ortaya çıkan, saldırganın veritabanına kötü amaçlı SQL kodu enjekte etmesine imkan tanıyan kritik bir zafiyettir. Hedefler bilgi sızdırma, veri manipülasyonu, kimlik doğrulama baypası veya hatta sistem ele geçirme olabilir.

> **Uyarı:** Bu makale **eğitim/CTF/izinli pentest** amaçlıdır. Payload ve teknikler yalnızca yetki verilen hedeflerde kullanılmalıdır. İzinsiz saldırılar yasa dışıdır.

---

## İçerik

1. SQLi türleri (In-band, Blind, OOB, Second-order, Stacked queries)  
2. Her tür için örnek payload’lar ve açıklamalar  
3. Veritabanı-özgü payload örnekleri (MySQL, MSSQL, PostgreSQL, Oracle)  
4. Pratik istismar senaryoları  
5. Tespit & test yöntemleri  
6. Korunma/mitigasyon  
7. Raporlama ve etik  
8. CTF ipuçları  
9. Hızlı payload özeti  
10. İleri seviye savunma & izleme  
11. Sonuç ve kaynaklar  

---

## 1) SQLi Türleri (Detaylı)

### 1.1 In-band SQLi
Sonuçların doğrudan uygulama yanıtında görülebildiği türdür.  

#### Error-based SQLi
Veritabanı hata mesajları kullanılarak bilgi çıkarılır.

**Örnek payload’lar:**
```sql
' OR 1=1 --
' OR '1'='1' #
' AND (SELECT 1 FROM (SELECT COUNT(*), CONCAT((SELECT @@version),FLOOR(RAND()*2)) x FROM information_schema.tables GROUP BY x) a) --
