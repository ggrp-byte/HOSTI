# Oracle Cloud Setup Guide

## 📋 Dane potrzebne do konfiguracji

### 1. Oracle Cloud Infrastructure (OCI) Credentials

Aby skonfigurować hosting na Oracle Cloud, potrzebuję następujących danych:

#### A. Tenancy Information
```
Tenancy OCID: ocid1.tenancy.oc1..aaaaaaaa...
Tenancy Name: your-tenancy-name
Home Region: eu-frankfurt-1 (lub inny)
```

#### B. User Information
```
User OCID: ocid1.user.oc1..aaaaaaaa...
Username: your-username
```

#### C. API Key Pair
```
Private Key: (plik .pem lub zawartość klucza)
Public Key Fingerprint: aa:bb:cc:dd:ee:ff...
```

#### D. Compartment
```
Compartment OCID: ocid1.compartment.oc1..aaaaaaaa...
Compartment Name: your-compartment-name
```

### 2. Preferred Configuration

```
Region: eu-frankfurt-1 (lub preferowany)
Domain Name: your-domain.com (opcjonalne)
SSL Certificate: Let's Encrypt (darmowy) lub własny
```

## 🔧 Jak uzyskać te dane

### 1. Tenancy OCID
1. Zaloguj się do Oracle Cloud Console
2. Kliknij ikonę profilu (prawy górny róg)
3. Wybierz "Tenancy: [nazwa]"
4. Skopiuj OCID

### 2. User OCID
1. W Oracle Cloud Console
2. Identity & Security > Users
3. Kliknij swoją nazwę użytkownika
4. Skopiuj OCID

### 3. API Key
1. W profilu użytkownika
2. Resources > API Keys
3. Kliknij "Add API Key"
4. Wybierz "Generate API Key Pair"
5. Pobierz private key (.pem)
6. Skopiuj public key fingerprint

### 4. Compartment OCID
1. Identity & Security > Compartments
2. Wybierz compartment (lub utwórz nowy)
3. Skopiuj OCID

## 🚀 Automatyczna konfiguracja

Po udostępnieniu danych, automatycznie skonfiguruję:

### Infrastructure as Code (Terraform)
```hcl
# Compute Instance
resource "oci_core_instance" "video_server" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  display_name        = "videostream-pro-server"
  shape               = "VM.Standard.E2.1.Micro"  # Always Free
  
  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    display_name     = "primaryvnic"
    assign_public_ip = true
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ol8.images[0].id
  }
}

# Object Storage Bucket
resource "oci_objectstorage_bucket" "video_storage" {
  compartment_id = var.compartment_ocid
  name           = "videostream-pro-storage"
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  
  public_access_type = "ObjectRead"
}

# Load Balancer (opcjonalnie)
resource "oci_load_balancer_load_balancer" "video_lb" {
  shape          = "flexible"
  compartment_id = var.compartment_ocid
  
  subnet_ids = [
    oci_core_subnet.public_subnet.id,
  ]

  display_name = "videostream-pro-lb"
  
  shape_details {
    minimum_bandwidth_in_mbps = 10
    maximum_bandwidth_in_mbps = 100
  }
}
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    root /var/www/videostream-pro;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📊 Monitoring Setup

### Oracle Cloud Monitoring
```json
{
  "displayName": "VideoStream Pro Monitoring",
  "metrics": [
    {
      "name": "CpuUtilization",
      "namespace": "oci_computeagent"
    },
    {
      "name": "MemoryUtilization", 
      "namespace": "oci_computeagent"
    },
    {
      "name": "NetworksBytesIn",
      "namespace": "oci_computeagent"
    }
  ],
  "alarms": [
    {
      "displayName": "High CPU Usage",
      "severity": "WARNING",
      "threshold": 80
    }
  ]
}
```

## 🔐 Security Configuration

### Firewall Rules
```bash
# Allow HTTP/HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Allow SSH (tylko z określonych IP)
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='YOUR_IP/32' service name='ssh' accept"

# Block all other SSH
sudo firewall-cmd --permanent --remove-service=ssh

sudo firewall-cmd --reload
```

### SSL/TLS Configuration
```bash
# Install Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 💰 Cost Estimation

### Always Free Resources
- **Compute**: 2x VM.Standard.E2.1.Micro (24/7)
- **Storage**: 200GB Block Storage
- **Network**: 10TB outbound transfer/month
- **Load Balancer**: 1x flexible (10 Mbps)

### Paid Resources (jeśli potrzebne)
- **Additional Storage**: $0.0255/GB/month
- **Additional Compute**: od $0.0255/hour
- **Additional Transfer**: $0.0085/GB

## 📞 Następne kroki

1. **Udostępnij dane Oracle Cloud** (bezpiecznie przez prywatną wiadomość)
2. **Wybierz region** (eu-frankfurt-1 zalecany dla Polski)
3. **Podaj domenę** (jeśli masz) lub użyjemy IP
4. **Potwierdź konfigurację** przed wdrożeniem

Po otrzymaniu danych, skonfiguruję kompletne środowisko w ciągu 30-60 minut!

## 🔗 Przydatne linki

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [OCI CLI Installation](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm)
- [Terraform OCI Provider](https://registry.terraform.io/providers/oracle/oci/latest/docs)