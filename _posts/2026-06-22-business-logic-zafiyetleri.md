---
title: "Business Logic Zafiyetleri: Otomatik Tarayıcıların Kaçırdığı Açıklar"
date: 2026-06-22 10:00:00 +0300
tags: [business-logic, web-security, pentest, siber-guvenlik]
author: CyEn07
---

SQLi ve XSS gibi klasik zafiyetler genellikle otomatik tarayıcılar
(scanner'lar) tarafından yakalanabilir çünkü belirli imzalara/kalıplara
sahiptirler. **Business logic (iş mantığı) zafiyetleri** ise tam tersi:
uygulama teknik olarak "doğru" çalışıyor gibi görünür, ama iş akışındaki bir
varsayım yanlış olduğu için istismar edilebilir. Bu yüzden otomatik
araçların neredeyse hiç yakalayamadığı, tamamen manuel analiz ve akıl
yürütme gerektiren bir zafiyet sınıfıdır.

> Aşağıdaki örnekler kavramsal düzeydedir ve yalnızca kendi test
> ortamınızda / yazılı izniniz olan sistemlerde uygulanabilir senaryoları
> anlatmak içindir.

## Business Logic Zafiyeti Nedir?

Bir business logic zafiyeti, uygulamanın **iş kurallarının** (fiyatlandırma,
sipariş akışı, yetkilendirme sırası, oran/limit kontrolleri vb.) beklenmedik
bir sırayla veya beklenmedik parametrelerle çağrılması sonucu ortaya çıkar.
Kod "syntax" olarak güvenlidir (SQL injection yoktur, XSS yoktur) ama
**mantık** kırılabilir.

## Yaygın Business Logic Zafiyeti Kategorileri

### 1. Fiyat / Miktar Manipülasyonu

E-ticaret sepetinde miktar alanına negatif değer girilmesi:

```
POST /cart/update
{"product_id": 42, "quantity": -5}
```

Eğer sunucu `toplam = fiyat * miktar` hesaplarken negatif miktarı
reddetmiyorsa, toplam tutar negatife düşebilir ve bu, hesaba iade/kredi
olarak yansıyabilir.

### 2. Adım Atlama (Workflow Bypass)

Çok adımlı bir işlemde (örn. ödeme: sepet → adres → ödeme → onay), her adımın
bağımsız bir endpoint olarak sunulması ve sunucunun önceki adımın
tamamlandığını doğrulamaması:

```
1. /checkout/cart
2. /checkout/address
3. /checkout/payment
4. /checkout/confirm   <-- doğrudan buraya istek atılırsa?
```

Eğer `/checkout/confirm`, ödemenin gerçekten yapıldığını sunucu tarafında
tekrar doğrulamıyorsa, ödeme adımı tamamen atlanabilir.

### 3. Race Condition (Yarış Durumu)

Aynı isteğin çok kısa süre içinde eşzamanlı olarak birden çok kez
gönderilmesi, sunucunun durum kontrolünü (örn. "bakiye yeterli mi?")
her istek için ayrı ayrı ama eşzamanlı çalıştırması nedeniyle bakiye
kontrolünün atlanmasına yol açabilir:

```
Aynı anda 10 paralel istek:
POST /wallet/withdraw {"amount": 100}
```

Bakiye 100 birim olsa bile, kontrol ve düşme işlemleri arasındaki küçük
zaman farkından (TOCTOU — time-of-check to time-of-use) faydalanılarak
birden fazla çekim işlemi onaylanabilir.

### 4. Kupon / Promosyon Kodu Kötüye Kullanımı

- Tek kullanımlık bir kuponun, istekler arasında ufak farklılıklarla
  (büyük/küçük harf, boşluk, farklı case) tekrar tekrar kullanılabilmesi.
- "İlk siparişe özel" bir kuponun, hesap silinip yeniden oluşturularak
  sınırsız kullanılabilmesi.

### 5. Yetkilendirme Sırası Hataları (IDOR ile kesişim)

Bir kaynağa erişim kontrolünün yalnızca "giriş yapılmış mı?" seviyesinde
yapılıp, "bu kaynak gerçekten bu kullanıcıya mı ait?" kontrolünün
atlanması — klasik IDOR (Insecure Direct Object Reference), aslında bir
business logic hatasının özel bir türüdür:

```
GET /api/orders/1005   <-- kullanıcı A'nın siparişi
GET /api/orders/1006   <-- kullanıcı B'ye ait, ama A bu ID'yi deneyip görebiliyor mu?
```

### 6. Rol Yükseltme İş Akışı Hataları

Kayıt formunda `role` parametresinin istemci tarafından gönderilmesi ve
sunucunun bunu doğrudan kabul etmesi (mass assignment):

```
POST /register
{"username": "test", "password": "...", "role": "admin"}
```

## Neden Otomatik Araçlar Bunları Yakalayamıyor?

Bir scanner, "bu istek bir zafiyeti tetikliyor mu?" sorusunu genellikle
**imza tabanlı** (belirli hata mesajları, response farkları) olarak
yanıtlar. Business logic zafiyetlerinde ise:

- İstek sözdizimsel olarak tamamen geçerlidir.
- Zafiyetin var olup olmadığını anlamak için **iş kuralını bilmek**
  gerekir (örn. "negatif miktar mantıksal olarak imkânsız olmalı").
- Genelde birden fazla isteğin **sırasına** veya **zamanlamasına** bağlıdır.

Bu yüzden business logic testleri, uygulamanın gerçek iş akışını anlayan bir
insan analisti (veya iş kurallarını modelleyen özel test senaryoları)
gerektirir.

## Test Yaklaşımı

1. Uygulamanın tüm iş akışlarını (sipariş, ödeme, kayıt, şifre sıfırlama
   vb.) uçtan uca haritalandırın.
2. Her adımda "bu adım gerçekten önceki adımı doğruluyor mu?" sorusunu
   sorun.
3. Parametre değerlerini sınır durumlarında test edin (negatif, sıfır, çok
   büyük, ondalıklı miktar).
4. Adımları atlayarak veya sırasını değiştirerek isteği tekrar gönderin.
5. Eşzamanlı (concurrent) istek senaryolarını test edin (race condition).
6. Rol/parametre enjeksiyonu ile mass assignment ihtimalini kontrol edin.

## Sonuç

Business logic zafiyetleri, bir uygulamanın "teknik olarak güvenli" ile
"gerçekten güvenli" olması arasındaki farkı gösteren en net örnektir. Bu tür
açıkları bulmak, araç kullanmaktan çok, uygulamanın iş mantığını bir
saldırgan gibi sorgulamayı gerektirir.
