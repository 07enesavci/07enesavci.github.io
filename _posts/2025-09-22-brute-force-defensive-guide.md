---
layout: post
title: "Brute-Force Saldırıları: Türleri, Tespit ve Savunma (Etik Rehber)"
date: 2025-09-22
tags: [web-security, brute-force, defense, pentest]
author: "07enesavci"
reading_time: true
summary: "Brute-force türleri, araçların yüksek seviyede tanımı, tespit yöntemleri ve pratik savunma adımları — etik ve eğitim odaklı."
---

# Brute-Force Saldırıları: Türleri, Tespit ve Savunma (Etik Rehber)

**Özet:** Bu yazı brute-force saldırıların mantığını, araçların ne işe yaradığını (yüksek seviyede), ve uygulamaları korumak için pratik, etik ve uygulanabilir savunma tavsiyelerini toplar. Eğitim amaçlı lab ortamları ve responsible disclosure süreçlerine dair öneriler de içerir.

> **Uyarı:** Buradaki bilgiler eğitim/defans/izinli pentest amaçlıdır. İzinsiz denemeler yasa dışıdır.

---

## İçerik
1. Brute-force nedir? (kısa)  
2. Sık görülen hedefler ve etki alanları  
3. Araçlar — ne işe yararlar? (yüksek seviye)  
4. Tespit yöntemleri (logs, anomali, rate, honeypots)  
5. Savunma & mitigasyon (pratik adımlar)  
6. Etik pentest yaklaşımı (izin, scope, PoC, raporlama)  
7. Güvenli laboratuvarlar ve öğrenme yolları  
8. Kısa özet & kaynaklar

---

## 1) Brute-Force Nedir? (Kısa)

Brute-force, bir hedefte (ör. kullanıcı hesabı, SSH servisi, admin paneli) doğrulama mekanizmasını tekrarlı denemelerle geçmeye çalışmak için otomatik isteklerin kullanıldığı saldırı sınıfıdır. Amaç genellikle zayıf/varsayılan/parola listelerinden doğru kimlik bilgilerinin bulunmasıdır.

---

## 2) Sık Görülen Hedefler ve Etki Alanları

- SSH / RDP / uzak erişim servisleri  
- Web login panelleri (kullanıcı/admin)  
- API endpoint’leri (token/oturum)  
- Kurumsal SSO / B2B servisleri

---

## 3) Araçlar — Ne İşe Yararlar? (Yüksek Seviye)

- **Hydra:** Çok protokollü, otomatik kimlik denemeleri için kullanılan bir test aracıdır (yüksek seviyede değerlendirme).  
- **Burp Suite Pro:** Web isteklerini yakalayıp değiştirmek, Intruder ile otomatik denemeler yapmak için kullanılan kapsamlı bir araç.  
- **Özel paralel script’ler / multithread client’lar:** Ölçeklendirilmiş testler için.  
> Hepsi yalnızca **izinli** testlerde kullanılmalı.

---

## 4) Tespit Yöntemleri (Defender Perspektifi)

- Başarısız girişlerin hızla artması (IP veya hesap bazında).  
- Coğrafi/işlem anomali tespiti.  
- IDS/IPS / WAF uyarıları ve honeypot tetiklemeleri.  
- SIEM korelasyonu ve eşik tabanlı alarmlar.

---

## 5) Savunma & Mitigasyon (Pratik)

- **MFA** uygulayın.  
- **Rate limiting**, account lockout veya progressive delay mekanizmaları koyun.  
- **Strong password policy** ve breached-password kontrolleri kullanın.  
- **Short-lived tokens** ve revocation mekanizmaları.  
- Merkezi logging ve otomatik bloklama (fail2ban / WAF kuralları).  
- Hata mesajlarını minimal gösterin (doğrulama ayrıntısı verme).

---

## 6) Etik Pentest Yaklaşımı (Yüksek Seviye)

1. Yazılı izin / scope belirleme.  
2. Pasif recon → düşük riskli test → kontrollü yüksek-risk test (minimize etki).  
3. Güvenli PoC, etkisini gösteren ama destructive olmayan kanıt.  
4. Rapor + remediation önerisi + fix doğrulama.

---

## 7) Güvenli Laboratuvarlar & Öğrenme

- TryHackMe, HackTheBox, OWASP Juice Shop, lokal VM/docker lab kurulumları.

---

## 8) Kısa Özet & Kaynaklar

- Brute-force otomasyon ve ölçek ile çalışır; savunma hızlı tespit ve engellemeye dayanır.  
- MFA, rate limiting, SIEM korelasyonu temel savunmalardır.  
- Öğrenirken her zaman yasal/lab ortam kullan.

---

**Not:** Bu rehber savunma ve etik kullanım odaklıdır.
