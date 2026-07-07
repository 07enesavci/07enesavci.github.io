# CyEn07

Siber güvenlik ve İHA/SİHA (insansız hava aracı) sistemleri üzerine kişisel
blog. Sade, hızlı ve bağımlılığı olmayan bir Jekyll temasıyla yazılmıştır
(harici tema gem'i veya build aracı gerekmez).

## Yerelde çalıştırma

```shell
bundle install
bundle exec jekyll s
```

Site varsayılan olarak <http://127.0.0.1:4000> adresinde açılır.

## Yeni bir yazı ekleme

`_posts/` klasörüne `YYYY-AA-GG-yazi-basligi.md` formatında bir dosya ekle:

```markdown
---
title: "Yazının Başlığı"
date: 2026-07-07 10:00:00 +0300
tags: [etiket1, etiket2]
author: 07enesavci
---

Yazının içeriği buraya...
```

- Dosya adındaki tarih, yazının URL'ini etkilemez; sadece front matter'daki
  `date` alanı ve dosya adının başındaki tarih Jekyll tarafından okunur.
- Yazı otomatik olarak `/posts/:baslik/` adresinde yayınlanır (`:baslik`,
  dosya adından tarih çıkarıldıktan sonraki kısımdır).
- `tags:` alanına eklediğin etiketler otomatik olarak `/tags/` sayfasında
  gruplanır.
- Ana sayfada en yeni 5 yazı listelenir (`_config.yml` içindeki
  `home_posts_limit` ile değiştirilebilir).

## Site ayarları

Tüm genel ayarlar `_config.yml` içinde:

- `title`, `tagline`, `description` — site başlığı ve açıklaması
- `prompt_user` — ana sayfadaki `root@...:~#` terminal başlığında görünen ad
- `social.github` / `social.x` / `social.linkedin` / `social.email` — footer
  ve ana sayfadaki sosyal medya bağlantıları (boş bırakılan alanlar
  gösterilmez)
- `nav` — üst menüdeki sekmeler

## Sayfa yapısı

```
_config.yml       # Site ayarları
_layouts/         # default, home, post, page şablonları
_includes/        # header, footer, head, ikonlar
_posts/           # Blog yazıları
assets/css/       # Tek parça stylesheet (main.css)
assets/js/        # Tema geçişi + mobil menü scripti
index.html        # Ana sayfa (layout: home)
posts.html        # /posts/  — tüm yazılar
tags.html          # /tags/   — etikete göre gruplanmış yazılar
archives.html      # /archives/ — yıla göre gruplanmış yazılar
about.md           # /about/  — hakkında sayfası
```

## Yayınlama

`main` dalına yapılan her push, `.github/workflows/pages-deploy.yml`
içindeki GitHub Actions iş akışını tetikler; site derlenip GitHub Pages'e
otomatik olarak yayınlanır.

## Yasal Uyarı

Bu blogtaki tüm içerikler yalnızca eğitim amaçlıdır. Anlatılan teknikleri
yalnızca izinli olduğunuz sistemlerde uygulayınız.

## Lisans

Bu iş [MIT][mit] lisansı altında yayınlanmıştır.

[mit]: LICENSE
