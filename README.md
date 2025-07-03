# VideoStream Pro - Oracle Cloud Edition

🎬 **Nowoczesna platforma hostingu wideo w chmurze Oracle Cloud**

Platforma umożliwiająca wgrywanie, strumieniowanie i publiczne udostępnianie filmów do 30GB z prawdziwym hostingiem w chmurze.

## 🚀 Funkcje

- **✅ Hosting w Oracle Cloud** - Prawdziwe publiczne udostępnianie na całym świecie
- **✅ Duże pliki** - Obsługa filmów do 30GB
- **✅ Wszystkie formaty** - MP4, WebM, OGG, AVI, MOV, WMV, FLV, **MKV**, 3GP, QuickTime
- **✅ Publiczne linki** - Działają na wszystkich urządzeniach globalnie
- **✅ Drag & Drop** - Intuicyjne wgrywanie z paskiem postępu
- **✅ Streaming** - Odtwarzanie bez pobierania
- **✅ Responsywny design** - Desktop, tablet, mobile
- **✅ SSL/HTTPS** - Bezpieczne połączenia
- **✅ CDN** - Szybkie ładowanie na całym świecie

## 🛠️ Stos technologiczny

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage + API)
- **Hosting**: Oracle Cloud Infrastructure (OCI)
- **Storage**: Oracle Cloud Object Storage
- **SSL**: Let's Encrypt (automatyczne)
- **CDN**: Oracle Cloud CDN

## 🌐 Wdrożenie na Oracle Cloud

### Automatyczne wdrożenie (Zalecane)

```bash
# Sklonuj repozytorium
git clone <your-repo-url>
cd videostream-pro

# Zainstaluj zależności
npm install

# Uruchom automatyczne wdrożenie
npm run deploy:oracle
```

Skrypt automatycznie:
1. ✅ Sprawdzi wymagania (Terraform, OCI CLI)
2. ✅ Skonfiguruje Oracle Cloud
3. ✅ Utworzy infrastrukturę (VCN, Compute, Storage)
4. ✅ Wdroży aplikację
5. ✅ Skonfiguruje SSL (opcjonalnie)

### Ręczne wdrożenie

#### 1. Przygotowanie środowiska

```bash
# Zainstaluj Terraform
# https://www.terraform.io/downloads.html

# Zainstaluj OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

#### 2. Konfiguracja OCI

```bash
# Utwórz katalog konfiguracji
mkdir -p ~/.oci

# Skopiuj swój klucz prywatny
cp /path/to/your/private_key.pem ~/.oci/oci_api_key.pem
chmod 600 ~/.oci/oci_api_key.pem

# Utwórz plik konfiguracji
cat > ~/.oci/config << EOF
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaa3jzl4bywvd5dqxvm25zdeqnncxtp3ryzukdx3momutny7zhcqenq
fingerprint=84:b1:55:dd:b8:5d:ef:ac:7d:70:c5:c4:2b:c5:54:fa
tenancy=ocid1.tenancy.oc1..aaaaaaaa5rqv22xlz5kjxhv6u7qs6rwckyio4ua255ndsbhdkafmtmmjmpka
region=us-chicago-1
key_file=~/.oci/oci_api_key.pem
EOF
```

#### 3. Wdrożenie infrastruktury

```bash
cd terraform

# Inicjalizacja Terraform
terraform init

# Planowanie wdrożenia
terraform plan

# Wdrożenie
terraform apply
```

#### 4. Wdrożenie aplikacji

```bash
# Zbuduj aplikację
npm run build

# Skopiuj na serwer (zastąp IP_ADDRESS adresem z Terraform output)
scp -r dist/* opc@IP_ADDRESS:/var/www/videostream-pro/
```

## 🔧 Konfiguracja Supabase

### 1. Utwórz projekt Supabase
1. Przejdź na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Skopiuj Project URL i Anon Key

### 2. Skonfiguruj bazę danych
W Supabase Dashboard > SQL Editor wykonaj:

```sql
-- Utwórz tabelę videos
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  file_path text NOT NULL,
  thumbnail_path text,
  upload_date timestamptz DEFAULT now(),
  user_id uuid,
  public_url text NOT NULL,
  share_token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Włącz RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Polityki RLS
CREATE POLICY "Każdy może wgrać film" ON videos
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Publiczny dostęp do filmów przez share_token" ON videos
  FOR SELECT TO anon, authenticated
  USING (true);

-- Indeksy dla wydajności
CREATE INDEX idx_videos_share_token ON videos (share_token);
CREATE INDEX idx_videos_created_at ON videos (created_at DESC);
```

### 3. Skonfiguruj Storage
1. Przejdź do Storage w Supabase Dashboard
2. Utwórz bucket `videos`
3. Ustaw jako publiczny
4. Dodaj polityki:

```sql
-- Pozwól na upload
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'videos');

-- Pozwól na pobieranie
CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'videos');
```

## 📊 Monitoring i zarządzanie

### Oracle Cloud Console
- **Compute**: Monitorowanie serwera, CPU, RAM
- **Object Storage**: Wykorzystanie przestrzeni
- **Networking**: Transfer danych
- **Billing**: Koszty i limity

### Supabase Dashboard
- **Database**: Zapytania, wydajność
- **Storage**: Pliki, wykorzystanie
- **API**: Statystyki wywołań
- **Auth**: Użytkownicy (jeśli włączone)

## 💰 Koszty

### Oracle Cloud (Always Free Tier)
- **Compute**: 2x VM.Standard.E2.1.Micro (24/7) - **DARMOWE**
- **Storage**: 200GB Block Storage - **DARMOWE**
- **Object Storage**: 20GB - **DARMOWE**
- **Network**: 10TB transfer/miesiąc - **DARMOWE**

### Supabase (Free Tier)
- **Database**: 500MB - **DARMOWE**
- **Storage**: 1GB - **DARMOWE**
- **API calls**: 50,000/miesiąc - **DARMOWE**

### Dodatkowe koszty (opcjonalne)
- **Domena**: ~$10-15/rok
- **Dodatkowy storage**: $0.0255/GB/miesiąc
- **Dodatkowy transfer**: $0.0085/GB

## 🔒 Bezpieczeństwo

### Automatycznie skonfigurowane:
- ✅ **HTTPS/SSL** - Let's Encrypt
- ✅ **Firewall** - Tylko porty 80, 443, 22
- ✅ **Security Headers** - XSS, CSRF protection
- ✅ **RLS** - Row Level Security w Supabase
- ✅ **CORS** - Prawidłowa konfiguracja
- ✅ **Rate Limiting** - Supabase built-in

### Dodatkowe zabezpieczenia:
```bash
# Zmień domyślny port SSH
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Wyłącz logowanie root
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Skonfiguruj fail2ban
sudo dnf install fail2ban
sudo systemctl enable fail2ban
```

## 🚀 Skalowanie

### Dla większego ruchu:
1. **Upgrade Compute**: VM.Standard.E2.2 lub wyższy
2. **Load Balancer**: Oracle Cloud Load Balancer
3. **CDN**: Oracle Cloud CDN
4. **Multiple Regions**: Wdrożenie w kilku regionach
5. **Database**: Upgrade Supabase do Pro

### Automatyczne skalowanie:
```bash
# Skonfiguruj autoscaling w Oracle Cloud
oci compute-management instance-configuration create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "videostream-autoscale"
```

## 🔧 Rozwiązywanie problemów

### Sprawdź status serwera:
```bash
# Połącz się z serwerem
ssh opc@YOUR_SERVER_IP

# Sprawdź status nginx
sudo systemctl status nginx

# Sprawdź logi
sudo tail -f /var/log/nginx/error.log
```

### Sprawdź konfigurację:
```bash
# Test konfiguracji nginx
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Sprawdź SSL:
```bash
# Status certyfikatu
sudo certbot certificates

# Odnów certyfikat
sudo certbot renew
```

## 📞 Wsparcie

### Przydatne linki:
- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/)
- [Supabase Documentation](https://supabase.com/docs)
- [Terraform OCI Provider](https://registry.terraform.io/providers/oracle/oci/latest/docs)

### Kontakt:
- **Issues**: GitHub Issues
- **Email**: support@videostream-pro.com
- **Discord**: VideoStream Pro Community

---

## 🎉 Gratulacje!

Twoja platforma VideoStream Pro jest teraz dostępna publicznie na Oracle Cloud!

**🌐 Adres**: `http://YOUR_SERVER_IP`  
**📱 Działa na**: Desktop, Tablet, Mobile  
**🌍 Dostępne**: Na całym świecie  
**💾 Obsługuje**: Pliki do 30GB  
**🎬 Formaty**: Wszystkie popularne + MKV  

Ciesz się swoją profesjonalną platformą wideo! 🚀