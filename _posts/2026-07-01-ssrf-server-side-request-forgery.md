---
title: "SSRF (Server-Side Request Forgery): Bulut Çağında Kritik Bir Zafiyet"
date: 2026-07-01 10:00:00 +0300
tags: [ssrf, web-security, cloud-security, siber-guvenlik, owasp]
author: CyEn07
---

**Server-Side Request Forgery (SSRF)**, saldırganın uygulama sunucusunu
kandırarak **kendi seçtiği hedeflere istek attırmasıdır**. Sunucu, kurbanın
değil saldırganın belirlediği bir adrese bağlanır — ve genellikle bu adres,
dışarıdan erişilemeyen iç ağ kaynaklarıdır. Bulut mimarilerinin
yaygınlaşmasıyla SSRF, en kritik zafiyetlerden biri hâline geldi.

> Yalnızca kendi test ortamında veya yazılı izinli sistemlerde uygula.

## SSRF Nasıl Oluşur?

Uygulama, kullanıcıdan bir URL alıp o URL'ye sunucu tarafından istek
atıyorsa risk başlar. Klasik örnek: "URL'den resim içe aktar" özelliği:

```
POST /import
{ "imageUrl": "https://example.com/logo.png" }
```

Saldırgan bu URL'yi iç ağa çevirir:

```
{ "imageUrl": "http://169.254.169.254/latest/meta-data/" }
{ "imageUrl": "http://localhost:8080/admin" }
{ "imageUrl": "http://10.0.0.5:6379/" }
```

Sunucu bu isteği kendi ağ konumundan attığı için, dışarıya kapalı servislere
ulaşabilir.

## Neden Bu Kadar Tehlikeli? — Bulut Metadata

En yıkıcı SSRF senaryosu bulut sağlayıcıların **metadata servisidir**.
AWS'de `169.254.169.254` adresi, örneğe (instance) atanmış geçici kimlik
bilgilerini döndürebilir:

```
http://169.254.169.254/latest/meta-data/iam/security-credentials/<rol>
```

Bu uç noktadan alınan geçici AWS anahtarlarıyla saldırgan, sunucunun bulut
yetkileriyle işlem yapabilir. (Bu saldırı, IMDSv1 kullanan yapılandırmalarda
büyük veri ihlallerine yol açmıştır; IMDSv2 token zorunluluğu getirerek bunu
zorlaştırır.)

## SSRF ile Neler Yapılabilir?

- İç ağ port taraması (hangi iç servisler ayakta?)
- Kimlik doğrulaması olmayan iç panellere/API'lere erişim
- Bulut metadata'dan kimlik bilgisi çalma
- `file://`, `gopher://`, `dict://` gibi şemalarla protokol kötüye kullanımı
- Firewall arkasındaki servislere pivot yaparak saldırıyı derinleştirme

## Filtre Baypasları (Neden Basit Kara Liste Yetmez)

Geliştiriciler genelde "localhost ve 127.0.0.1'i engelledim" der; ama pek çok
baypas vardır:

```
http://127.0.0.1        ->  http://127.1
                            http://0.0.0.0
                            http://[::1]
                            http://2130706433        (decimal IP)
                            http://localtest.me      (127.0.0.1'e cozulur)
```

Ayrıca **DNS rebinding** ve yönlendirme (redirect) takipleri, alan adı
doğrulamasını atlatmak için kullanılır. Bu yüzden kara liste tabanlı savunma
kırılgandır.

## Korunma Yöntemleri

| Katman | Önlem |
|---|---|
| Girdi | Kullanıcıdan URL almak yerine önceden tanımlı seçenekler sun |
| Doğrulama | Kara liste değil, **beyaz liste** (izinli alan adları/şemalar) |
| Ağ | Uygulama sunucusundan metadata IP'sine ve iç ağa çıkışı firewall ile engelle |
| Bulut | IMDSv2'yi zorunlu kıl, gereksiz instance rolü verme |
| İstek | Yönlendirmeleri (redirect) takip etme veya sıkı sınırla |
| Şema | Yalnızca `http/https`'e izin ver; `file/gopher/dict` engelle |

En güçlü savunma, uygulamanın hassas iç kaynaklara ağ seviyesinde
erişememesidir (segmentasyon) — böylece SSRF olsa bile ulaşacak hedef kalmaz.

## Sonuç

SSRF'in tehlikesi, "güvenilen" sunucunun saldırgan adına konuşmasıdır: dış
dünyaya kapalı her şey, sunucunun bakış açısından erişilebilir hâle gelir.
Çözüm; beyaz liste doğrulaması, katı ağ segmentasyonu ve bulutta IMDSv2 gibi
sağlamlaştırmaların birlikte uygulanmasıdır.
