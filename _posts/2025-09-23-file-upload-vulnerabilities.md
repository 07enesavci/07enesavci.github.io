---
layout: post
title: "File Upload Vulnerabilities: Tehditler, Tespit ve Güvenli Uygulama"
date: 2025-09-23
tags: [web-security, file-upload, secure-coding, pentest]
author: "07enesavci"
reading_time: true
summary: "Dosya yükleme özellikleri web uygulamalarında güçlü bir kullanım kolaylığı sunar; yanlış uygulandığında ise ciddi güvenlik riskleri doğurur. Bu yazıda tehdit modelinden tespit ve savunmaya kadar pratik, uygulanabilir rehber bulacaksınız."
---

# File Upload Vulnerabilities: Tehditler, Tespit ve Güvenli Uygulama

Dosya yükleme fonksiyonalitesi; profil fotoğrafları, doküman paylaşımı, rapor ekleri gibi yaygın kullanım senaryoları için hayatîdir. Ancak sunucu tarafında yetersiz kontrollerle birleştiğinde saldırganlara uzaktan kod çalıştırma, bilgi sızdırma veya servis bozma gibi ciddi imkânlar sağlar. Bu yazı, riskleri özetler, tespit yöntemleri sunar ve **savunma odaklı** güvenli uygulama önerileri verir.

> **Uyarı:** İçerik savunma ve eğitim amaçlıdır. İzinsiz testler yasa dışıdır — lab ortamında veya yazılı izin ile çalışın.

---

## İçerik
1. [Tehdit Modeli — Neler Olabilir?](#tehdit-modeli)  
2. [En Yaygın Zafiyetler ve Vektörler](#en-yaygin-zafiyetler)  
3. [Tespit Yöntemleri (Defans Odaklı)](#tespit-yontemleri)  
4. [Güvenli Tasarım ve Uygulama Prensipleri](#guvenli-tasarim)  
5. [Pratik Kod Örnekleri — Güvenli Kontroller](#kod-ornekleri)  
6. [Sunucu / Konfigürasyon Katmanı Güçlendirmeleri](#sunucu-konfigurasyon)  
7. [CI/CD & Otomatik Tarama / Malware Scanning](#cicd-tarama)  
8. [Raporlama, PoC ve Etik](#raporlama)  
9. [Kısa Özet & Kaynaklar](#kisa-ozet)  

---

## 1) Tehdit Modeli — Neler Olabilir? {#tehdit-modeli}

- Uzaktan kod çalıştırma (RCE)  
- Dosya içerik/format spoofing  
- Path traversal / overwrite  
- Sensitive data exposure  
- Denial of Service (DoS)  
- Client-side riskler (ör. stored XSS)

---

## 2) En Yaygın Zafiyetler ve Vektörler {#en-yaygin-zafiyetler}

- Uzantı bazlı güvenlik zayıflığı  
- MIME type manipülasyonu  
- Dosya adı / path traversal  
- Webroot içinde saklama  
- Yetersiz yetkilendirme  
- Yanlış sunucu konfigürasyonu  

---

## 3) Tespit Yöntemleri (Defans Odaklı) {#tespit-yontemleri}

- Log analizi  
- Anormal trafik tespiti  
- Magic-byte ve uzantı uyuşmazlıkları  
- Erişim geçmişi izleme  
- Canary file / honeypot  
- AV & sandbox scanning  

---

## 4) Güvenli Tasarım ve Uygulama Prensipleri {#guvenli-tasarim}

- Whitelist ile dosya türü kontrolü  
- Magic-byte doğrulaması  
- Webroot dışı saklama  
- Rastgele dosya adı  
- En düşük izin prensibi  
- Boyut limitleri / hız sınırlamaları  
- Karantina alanı  
- Upload dizininde execute kapatma  
- Rate limiting  
- CSRF & auth kontrolü  

---

## 5) Pratik Kod Örnekleri — Güvenli Kontroller {#kod-ornekleri}

### Python (Magic-byte doğrulama)
```python
MAGIC_DICT = {
    b'\x89PNG\r\n\x1a\n': 'png',
    b'\xff\xd8\xff': 'jpg',
    b'%PDF-': 'pdf',
}

def detect_file_type(byte_stream):
    head = byte_stream.read(8)
    for magic, typ in MAGIC_DICT.items():
        if head.startswith(magic):
            return typ
    return None
