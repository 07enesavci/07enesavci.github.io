---
layout: post
title: "Race Condition: Nedir, Nasıl Tespit Edilir ve Önlenir?"
date: 2025-09-23
tags: [web-security, race-condition, pentest, concurrency]
author: "07enesavci"
summary: "Race Condition zafiyetinin tanımı, örnekleri, tespit yöntemleri ve korunma yolları."
---

# Race Condition Nedir?

Race condition, birden fazla işlemin aynı kaynağa eş zamanlı erişmesi sonucu beklenmeyen davranışların ortaya çıkmasına denir. Güvenlik bağlamında bu, saldırganların zamanlama farklılıklarını kullanarak sisteme zarar vermesine yol açabilir.

---

## İçerik
1. Race condition nedir?  
2. Güvenlikte tipik örnekler (ör. banka transferi, kupon kullanımı, dosya yükleme)  
3. Tespit yöntemleri (manuel test, Burp Intruder, script)  
4. Korunma yolları (lock mekanizması, transaction, atomic işlemler)  
5. CTF/lab örnekleri  
