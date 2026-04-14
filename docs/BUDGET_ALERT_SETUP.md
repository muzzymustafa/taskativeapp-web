# Firebase Budget Alert — Manuel Kurulum

Son katman savunma: Firebase Blaze'de otomatik fatura patlaması olmasın diye bütçe alarmı kurulur. Otomatik servis durdurma yok (Google'da hard cap özelliği yok) ama belli eşiklere gelince email uyarısı gelir.

## Adımlar

1. **Google Cloud Console → Billing**
   - https://console.cloud.google.com/billing
   - Sol üstten `energy-a2aad` projesinin bağlı olduğu billing account'u seç
   - (Eğer projeye "link billing account" yapılmamışsa önce onu yap)

2. **Budgets & alerts** sekmesine git
   - Sol menüden: Billing → Budgets & alerts
   - **CREATE BUDGET** tıkla

3. **Budget ayarları**
   - **Name:** `Taskative Web Budget`
   - **Projects:** `energy-a2aad` (sadece bu projeyi seç — diğer projelerden bağımsız tutsun)
   - **Services:** `Cloud Firestore` + `Cloud Functions` (isteğe göre)
   - **Budget type:** Specified amount
   - **Amount:** **$20** (ayda 20 dolar — mevcut kullanımımız aylık <$1, bu 20x güvenlik marjı)
   - **Time range:** Monthly (default)

4. **Alert thresholds** (3 seviye)
   - %50 → email
   - %90 → email
   - %100 → email
   - "Include credits in cost" → işaretli kalsın
   - "Email alerts to billing admins and users" → aktif

5. **Notifications**
   - `principlesofmik@gmail.com` ve `quentinaster@gmail.com` billing admin olarak tanımlı değilse, önce **IAM & Admin** sekmesinden ekle (role: Billing Account Administrator).
   - Ya da Pub/Sub topic üzerinden Cloud Function trigger'la (advanced).

6. **Kaydet**

## Alert geldiğinde ne yapmalı?

**%50 eşiği** (yani ~$10/ay):
- Bu normal değil, araştırma gerekir
- Firebase Console → Firestore → **Usage** sekmesinden hangi collection'da yoğun write var bak
- Eğer bir user `users/{uid}` doc'unda `usedTasksToday` veya `rateLimitCount` çok yüksekse → muhtemel spam attack
- Problem varsa: **manuel ban** — o kullanıcının `users/{uid}` doc'una `bannedUntil: <1 yıl sonra>` yaz. Sistem onu blocklar.

**%90 eşiği** (~$18/ay):
- Kritik. Hemen incele.
- Global rate limit daha agresif yapılabilir (`GLOBAL_MAX_PER_MIN` 1000'den 300'e düşür)
- Geçici olarak `/api/tasks` endpoint'i disable edilebilir (Vercel project settings → environment variable ile flag)

**%100 eşiği** (~$20/ay):
- Panik moduna gir
- Vercel'den web servisini geçici olarak durdur: Project Settings → Pause Project
- Firebase Console → IAM → servis hesabının Firestore write iznini revoke et (extreme son çare)

## Notlar

- Bu sadece bir **uyarı sistemi** — Google fatura akışını durdurmaz. Gerçek hard cap için Cloud Functions + Pub/Sub tabanlı otomasyon lazım (karmaşık, şimdilik manuel yeterli).
- Budget yılda bir kez ayarlamak yeterli — değişiklik gerekirse aynı yerden düzenlenir.
- Bu dosya memory için değil, **referans olarak** kalıyor. Setup tamamlandıktan sonra silebilirsin.

## Maksimum Teorik Zarar (Güncel Savunmalarla)

Şu anda şu katmanlar aktif:
- Free: 50 task/ay
- Paid: 2000 task/ay + 200 task/gün
- Per-user: 60 yazma/dakika (create + update birleşik)
- 3 rate-limit ihlali → 24h soft ban
- Global: 1000 yazma/dakika (tüm sistem)

**Tek kullanıcı maksimum**: 200 task/gün × 2 write = **400 write/gün** = **~$0.00072/gün**

**Sybil saldırısı (100 hesap)**: Teorik olarak 100 × $0.00072 = $0.072/gün = **~$2.16/ay**

**Global lockdown ile fren**: Sistem dakikada 1000 write'ı aşarsa tamamen kilitlenir. Saldırgan nasıl çok hesap kursa kursa bu eşiği aşamaz.

**Max gerçek zarar**: Blaze'de ayda $3-5 arası. Bütçe alarmı $20 → erken uyarı.
