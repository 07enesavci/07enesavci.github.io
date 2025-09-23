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
1. [Tehdit Modeli — Neler Olabilir?](#1-tehdit-modeli---neler-olabilir)  
2. [En Yaygın Zafiyetler ve Vektörler (Kısa)](#2-en-yaygin-zafiyetler-ve-vektorler-kisa)  
3. [Tespit Yöntemleri (Defans Odaklı)](#3-tespit-yontemleri-defans-odakli)  
4. [Güvenli Tasarım ve Uygulama Prensipleri](#4-guvenli-tasarim-ve-uygulama-prensipleri)  
5. [Pratik Kod Örnekleri — Güvenli Kontroller (Güvenli ve Zararsız)](#5-pratik-kod-ornekleri--guvenli-kontroller-guvenli-ve-zararsiz)  
6. [Sunucu / Konfigürasyon Katmanı Güçlendirmeleri](#6-sunucu--konfigurasyon-katlami-guclendirmeleri)  
7. [CI/CD & Otomatik Tarama / Malware Scanning](#7-cicd--otomatik-tarama--malware-scanning)  
8. [Raporlama, PoC ve Etik](#8-raporlama-poc-ve-etik)  
9. [Kısa Özet & Kaynaklar](#9-kisa-ozet--kaynaklar)

---

## 1) Tehdit Modeli — Neler Olabilir?

Dosya yükleme fonksiyonunun hata yapmasıyla ortaya çıkabilecek ana riskler:
- **Uzaktan kod çalıştırma (RCE):** Yüklenen dosyanın sunucuda çalıştırılabilir bir konuma veya çalıştırılacak bir içerik tipine sahip olması.  
- **Dosya içerik/format spoofing:** Uzantı/MIME header yanıltılarak zararlı içerik yüklenmesi.  
- **Path traversal / overwrite:** Yetersiz sanitizasyon nedeniyle sunucudaki hassas dosyaların üzerine yazma.  
- **Sensitive data exposure:** Kullanıcı tarafından yüklenen dosyalarda gizli bilgi bulunması ve yanlış erişim kontrolleriyle sızması.  
- **Denial of Service (DoS):** Çok büyük dosyaların veya çok sayıda eş zamanlı yüklemenin kaynak tüketmesi.  
- **Client-side / DOM riskleri:** Kullanıcıya döndürülen kötü amaçlı HTML/JS (ör. stored XSS) içeren dosyalar.

Riskleri azaltmak için önce hangi varlıkların korunması gerektiğini ve saldırganın hangi motiflerle hareket edebileceğini (threat model) açıklığa kavuşturun.

---

## 2) En Yaygın Zafiyetler ve Vektörler (Kısa)

- **Uzantı bazlı güvenlik:** Sadece dosya uzantısına güvenmek yetersizdir.  
- **MIME tipine güvenmek:** `Content-Type` header kolayca taklit edilebilir.  
- **Dosya adı/sanitize eksikliği:** `../../etc/passwd` gibi path traversal.  
- **Webroot içinde saklama:** Yüklenen dosyaların doğrudan webroot altında tutulması, dosyanın URL üzerinden çalıştırılmasını kolaylaştırır.  
- **Yetersiz yetkilendirme:** Yüklenen dosyaların erişim kontrollerinin eksik olması (herkes erişebiliyor).  
- **Sunucu konfigürasyonu:** Upload dizininde script çalıştırma izni açık olması.

---

## 3) Tespit Yöntemleri (Defans Odaklı)

Savunma tarafında kesin tespit için kombinasyon:
- **Log analizi:** `POST /upload` istekleri, başarılı/başarısız kodlar, upload boyut ve kaynak IP kayıtları.  
- **Anormal trafik tespiti:** Aynı IP’den kısa sürede çok sayıda upload denemesi.  
- **Dosya meta analizi:** Yüklenen dosyaların magic-bytes (dosya imzası) ve extension uyuşmazlıklarının raporlanması.  
- **Erişim geçmişi:** Yüklenen dosyaya ilk kim erişti, hangi referer ile açıldı?  
- **Honeypot / Canary file:** Upload dizinine konulan canary dosyaya erişim, potansiyel kötü kullanım sinyali olabilir.  
- **Otomatik sandboxing / AV tarama:** Yüklenen dosaları izole bir ortamda tarayıp anomali tespit etme.

Uyarı: Tespitte otomatik silme yerine **karantinaya alma** ve manuel inceleme + AV/heuristic tarama kombinasyonu daha güvenlidir.

---

## 4) Güvenli Tasarım ve Uygulama Prensipleri

Özetle uygulanması gereken en güçlü önlemler:

1. **Whitelist (izinli uzantılar) kullanın** — yalnızca gerçekten gereken formatları kabul edin.  
2. **Dosya içeriğini doğrulayın (magic-bytes / signature)** — uzantı/MIME ile birlikte gerçek içeriği kontrol edin.  
3. **Dosyaları webroot dışına koyun** ve gerektiğinde sunucu üzerinden güvenli stream/serve edin (ör. authenticated download endpoint).  
4. **Rastgele, uzun ve çakışmaz dosya isimleri kullanın**; orijinal dosya adını doğrudan kullanmayın.  
5. **Dosya izinlerini en aza indirin** (ör. sadece read için uygulama kullanıcı erişimi).  
6. **Boyut limitleri ve quota** uygulayın; upload hızını sınırlayın.  
7. **Karantina bölgesi** oluşturun: AV/heuristic tarama yapan pipeline’dan sonra üretime taşıma.  
8. **Konfigürasyonla script çalıştırmayı devre dışı bırakın** (upload dizininde execute izni kapalı).  
9. **Rate limiting / throttling** ile brute-upload'ları engelleyin.  
10. **İşlem/istek doğrulaması**: CSRF token kontrolü, kimlik doğrulama gereksinimi vs.

---

## 5) Pratik Kod Örnekleri — Güvenli Kontroller (Güvenli ve Zararsız)

Aşağıdaki snippet’ler **savunma amaçlı**dır; kötüye kullanılabilecek payload içermez — sadece doğrulama/adım örneğidir.

### 5.1 Python — basit magic-byte kontrolü (sunucu tarafı)
```python
# Güvenli: dosya içeriğinin ilk birkaç byte'ını kontrol ederek basit bir doğrulama örneği
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

# kullanım (örneğin Flask içinde)
from flask import request

f = request.files.get('file')
if f:
    # dikkat: f.stream okunduktan sonra başa sarılması gerekebilir
    f.stream.seek(0)
    ftype = detect_file_type(f.stream)
    f.stream.seek(0)
    if ftype not in ('png','jpg','pdf'):
        # reddet veya karantinaya al
        raise ValueError("Unsupported file type")
