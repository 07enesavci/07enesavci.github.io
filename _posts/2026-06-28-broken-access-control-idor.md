---
title: "Broken Access Control ve IDOR: OWASP'ın 1 Numaralı Riski"
date: 2026-06-28 10:00:00 +0300
tags: [broken-access-control, idor, web-security, siber-guvenlik, owasp]
author: CyEn07
---

**Broken Access Control (Bozuk Erişim Kontrolü)**, OWASP Top 10 (2021)
listesinin **1 numaralı** riskidir — ve bunun bir sebebi var: son derece
yaygın, otomatik araçlarla zor bulunur ve etkisi genellikle doğrudan veri
sızıntısı veya hesap ele geçirmedir. Bu yazıda en sık görülen alt türü olan
**IDOR** başta olmak üzere erişim kontrolü zafiyetlerini ele alıyoruz.

> İçerik eğitim amaçlıdır; yalnızca kendi sistemlerinde veya yazılı izinli
> testlerde uygula.

## Erişim Kontrolü Nedir, Nerede Kırılır?

Erişim kontrolü iki soruyu yanıtlar:

1. **Authentication (Kimlik doğrulama):** "Sen kimsin?"
2. **Authorization (Yetkilendirme):** "Bunu yapmaya iznin var mı?"

Broken Access Control, ikinci sorunun sunucu tarafında düzgün
sorulmamasıdır. En klasik örneği IDOR'dur.

## IDOR (Insecure Direct Object Reference)

Uygulama, bir kaynağa erişimi doğrudan kullanıcının verdiği bir tanımlayıcıya
(ID) göre veriyor ama **o kaynağın gerçekten o kullanıcıya ait olup
olmadığını kontrol etmiyorsa** IDOR oluşur:

```
GET /api/invoices/1005    <-- benim faturam
GET /api/invoices/1006    <-- baskasinin faturasi; ama gorebiliyorum!
```

Sunucu sadece "giriş yapılmış mı?" diye bakıp `1006`'yı döndürürse, herhangi
bir kullanıcı ID'yi artırıp başkalarının verisine ulaşır. Aynı sorun `POST`,
`PUT`, `DELETE` için daha da tehlikelidir (başkasının kaydını değiştirme/silme).

## Sık Görülen Broken Access Control Kalıpları

### 1. Yatay Yetki Yükseltme (Horizontal)

Aynı yetki seviyesindeki başka bir kullanıcının verisine erişmek — klasik
IDOR senaryosu (kullanıcı A, kullanıcı B'nin siparişini görüyor).

### 2. Dikey Yetki Yükseltme (Vertical)

Normal kullanıcının, admin'e özel bir uç noktaya erişebilmesi:

```
POST /admin/users/42/delete
```

Uç nokta yalnızca istemci tarafında (menüyü gizleyerek) korunuyorsa, doğrudan
istek atan biri işlemi çalıştırabilir. **UI'da gizlemek erişim kontrolü
değildir.**

### 3. Client-Side Enforcement (İstemci Tarafı Kontrol)

Rol bilgisinin JWT/çerezde "düzenlenebilir" bir alanda tutulması veya
"admin=false" gibi bir değerin istemciden gelmesi:

```
Cookie: role=user   ->   Cookie: role=admin
```

### 4. Metod / Yol Manipülasyonu

`GET /api/user` korunuyor ama `POST` unutulmuş; ya da `/api/v2/` korunuyor
ama eski `/api/v1/` açık kalmış.

## Test Yaklaşımı

1. İki farklı kullanıcı hesabı aç (A ve B).
2. A ile bir kaynak oluştur, ID'sini not et.
3. B'nin oturumuyla aynı kaynağa erişmeyi dene (ID'yi değiştirerek).
4. ID'leri artır/azalt, tahmin edilebilir mi bak (1001, 1002...).
5. Admin uç noktalarını normal kullanıcı oturumuyla doğrudan çağır.
6. Rol/yetki alanlarını (çerez, JWT, gizli form alanı) değiştirmeyi dene.

## Korunma Yöntemleri

| Önlem | Açıklama |
|---|---|
| Sunucu tarafı yetki kontrolü | Her istekte "bu kaynak bu kullanıcıya mı ait?" kontrolü yap |
| Deny-by-default | Varsayılan yasak; sadece açıkça izin verileni serbest bırak |
| Dolaylı referans | Sıralı ID yerine kullanıcıya özel/anlamsız tanımlayıcı (UUID) |
| Merkezi yetki katmanı | Kontrolü her uç noktaya dağıtmak yerine tek bir katmanda topla |
| Sunucuda rol doğrulama | Rolü asla istemciden alma; oturumdan/DB'den doğrula |

Önemli nokta: **UUID kullanmak tek başına IDOR'u çözmez** — sadece tahmin
etmeyi zorlaştırır. Asıl çözüm her erişimde sahiplik/yetki doğrulamasıdır.

## Sonuç

Broken Access Control'ün 1 numara olmasının sebebi, tek bir "imza"sının
olmaması: her uç nokta kendi yetki mantığını taşır ve biri unutulduğunda
zafiyet doğar. Savunmanın özü **deny-by-default** ve her istekte sunucu
tarafında sahiplik/rol doğrulamasıdır.
