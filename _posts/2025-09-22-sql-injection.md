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
1. [SQLi Türleri (Detaylı)](#1-sqli-türleri-detaylı)  
    1.1 [In-band SQLi](#11-in-band-sqli)  
        - [Error-based SQLi](#error-based-sqli)  
        - [Union-based SQLi](#union-based-sqli)  
    1.2 [Blind SQLi](#12-blind-sqli)  
        - [Boolean-based](#boolean-based-blind)  
        - [Time-based](#time-based-blind)  
    1.3 [Out-of-Band (OOB) SQLi](#13-out-of-band-oob-sqli)  
    1.4 [Second-Order SQLi](#14-second-order-sqli)  
    1.5 [Stacked Queries](#15-stacked-queries)  
2. [Veritabanı-Özgü Payload Örnekleri](#2-veritabanı-özgü-payload-örnekleri)  
3. [Pratik İstismar Senaryoları](#3-pratik-istismar-senaryoları)  
4. [Tespit & Test Yöntemleri](#4-tespit--test-yöntemleri)  
5. [Korunma / Mitigasyon](#5-korunma--mitigasyon)  
6. [Raporlama & Etik](#6-raporlama--etik)  
7. [CTF / Eğitim İpuçları](#7-ctf--eğitim-ipuçları)  
8. [Hızlı Payload Özeti](#8-hızlı-payload-özeti)  
9. [İleri Seviye Savunma & İzleme](#9-ileri-seviye-savunma--izleme)  
10. [Sonuç](#10-sonuç)  
11. [Kaynaklar](#11-kaynaklar)  

---

## 1) SQLi Türleri (Detaylı)

### 1.1 In-band SQLi

#### Error-based SQLi
```sql
' OR 1=1 --
' OR '1'='1' #
