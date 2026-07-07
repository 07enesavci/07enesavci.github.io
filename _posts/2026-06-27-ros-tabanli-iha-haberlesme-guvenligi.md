---
title: "ROS Tabanlı İHA Haberleşmesinde Güvenlik"
date: 2026-06-27 10:00:00 +0300
tags: [ros, ros2, iha, siha, uav-security, siber-guvenlik]
author: CyEn07
---

**ROS (Robot Operating System)**, İHA/SİHA dahil birçok robotik platformda
sensör verisi, kontrol komutları ve durum bilgisini düğümler (node) arasında
taşımak için kullanılan de facto standart bir orta katman (middleware). Bu
yazıda ROS 1 ve ROS 2'nin haberleşme mimarisini ve bu mimarinin güvenlik
açısından getirdiği riskleri inceliyoruz.

> Bu yazı, ROS tabanlı sistemleri değerlendiren güvenlik ekipleri ve
> geliştiriciler için farkındalık amaçlıdır. Üretimde çalışan gerçek bir
> İHA'ya yetkisiz erişim/müdahale bu yazının konusu değildir ve yasal
> değildir.

## ROS'un Temel Haberleşme Modeli

ROS, **publish/subscribe (yayıncı/abone)** modeline dayanır:

- Bir düğüm (node), bir **topic**'e veri **publish** eder (örn.
  `/drone1/imu/data`).
- Başka düğümler bu topic'e **subscribe** olarak veriyi alır.
- Ayrıca **service** (istek/yanıt) ve **action** (uzun süreli görevler) gibi
  ek haberleşme türleri de bulunur.

Bir İHA'da tipik topic'ler: `/mavros/imu/data`, `/mavros/setpoint_velocity`,
`/camera/image_raw`, `/battery_state` gibi verileri taşır.

## ROS 1'in Güvenlik Sorunu: Yerleşik Kimlik Doğrulama Yok

ROS 1'in haberleşme altyapısı (`roscore` + XML-RPC + TCPROS/UDPROS) **hiçbir
yerleşik kimlik doğrulama veya şifreleme mekanizması içermez**. Bu, tasarım
felsefesinden kaynaklanır: ROS 1 başlangıçta araştırma/laboratuvar ortamları
için tasarlanmıştır, güvenlik bir öncelik değildi.

Pratik sonuçları:

- Ağa erişimi olan herhangi bir cihaz, `roscore`'u keşfedip herhangi bir
  topic'e **subscribe olabilir** (pasif dinleme — sensör verisi, konum,
  görüntü sızıntısı).
- Aynı şekilde, yetkisiz bir düğüm bir topic'e **publish edebilir** —
  örneğin `/cmd_vel` veya setpoint topic'ine sahte veri göndererek aracın
  davranışını manipüle edebilir (mesaj enjeksiyonu / node impersonation).
- `rostopic echo`, `rosnode list` gibi standart araçlarla, ağa erişimi olan
  herkes sistemin topolojisini kolayca çıkarabilir.

Bu, İHA bağlamında özellikle kritik: yer istasyonu ile araç arasındaki ROS
ağı düzgün izole edilmemişse (örn. aynı Wi-Fi/telemetri ağı üzerinden
paylaşılıyorsa), saldırı yüzeyi doğrudan uçuş kontrolüne kadar uzanabilir.

## ROS 2: DDS Tabanlı Mimari ve SROS2

ROS 2, haberleşme katmanı olarak **DDS (Data Distribution Service)**
kullanır ve bu, güvenlik açısından önemli bir iyileştirme fırsatı sunar.
ROS 2 ekosistemindeki **SROS2** projesi, DDS-Security standardını kullanarak
şu özellikleri sağlar:

- **Kimlik doğrulama (authentication):** Düğümler arasında X.509 sertifika
  tabanlı kimlik doğrulama.
- **Erişim kontrolü (access control):** Hangi düğümün hangi topic'e
  publish/subscribe olabileceğini tanımlayan izin (permission) dosyaları.
- **Şifreleme (encryption):** Topic bazlı mesaj şifreleme, trafik analizi ve
  pasif dinlemeye karşı koruma.

Önemli nokta: SROS2 **varsayılan olarak etkin değildir**. Bir ROS 2 sistemi,
geliştirici bilinçli olarak yapılandırmadığı sürece ROS 1 ile benzer şekilde
açık ve kimlik doğrulamasız çalışmaya devam eder.

## Tipik Saldırı Senaryoları

1. **Pasif dinleme (sniffing):** Ağdaki bir saldırgan, şifrelenmemiş
   topic'leri dinleyerek konum, kamera görüntüsü, batarya durumu gibi
   hassas verileri toplar.
2. **Sahte node / mesaj enjeksiyonu:** Saldırgan, geçerli bir topic adı ve
   mesaj tipiyle sahte bir publisher oluşturarak kontrol komutlarını
   (`cmd_vel`, `setpoint_position` vb.) manipüle eder.
3. **Servis kötüye kullanımı:** Kritik bir ROS servisinin (örn. arm/disarm,
   parametre değiştirme) kimlik doğrulaması olmadan çağrılabilmesi.
4. **DoS:** Ağı gereksiz mesajlarla doldurarak (topic flooding) gerçek
   zamanlı kontrol döngüsünün gecikmesine neden olma.

## Savunma Önerileri

| Katman | Önlem |
|---|---|
| Ağ | ROS/DDS trafiğini ayrı, izole bir VLAN/ağ segmentinde tutmak; telemetri ağıyla karıştırmamak |
| Kimlik doğrulama | ROS 2 + SROS2 kullanıp DDS-Security'i (authentication, access control, encryption) etkinleştirmek |
| Yetkilendirme | Her düğüm için en az yetki prensibiyle izin (permission) dosyaları tanımlamak |
| İzleme | Beklenmeyen node/topic keşiflerini (yeni publisher/subscriber) tespit eden bir anomali izleme mekanizması kurmak |
| Genel | ROS 1 kullanan eski sistemlerde, mümkünse ROS 2 + SROS2'ye geçiş planlamak |

## Sonuç

ROS'un pub/sub esnekliği, robotik ve İHA geliştirmeyi büyük ölçüde
hızlandırdı — ama bu esneklik, güvenlik varsayılan olarak devrede
olmadığında ciddi bir saldırı yüzeyine dönüşüyor. ROS 2 + SROS2 doğru
yapılandırıldığında büyük bir fark yaratıyor; asıl risk, bu özelliklerin
"var olması" değil, çoğu kurulumda **etkinleştirilmemiş olması**.
