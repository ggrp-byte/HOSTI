terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

# Configure Oracle Cloud Provider
provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Variables
variable "tenancy_ocid" {
  description = "OCID of the tenancy"
  type        = string
  default     = "ocid1.tenancy.oc1..aaaaaaaa5rqv22xlz5kjxhv6u7qs6rwckyio4ua255ndsbhdkafmtmmjmpka"
}

variable "user_ocid" {
  description = "OCID of the user"
  type        = string
  default     = "ocid1.user.oc1..aaaaaaaa3jzl4bywvd5dqxvm25zdeqnncxtp3ryzukdx3momutny7zhcqenq"
}

variable "fingerprint" {
  description = "Fingerprint of the public key"
  type        = string
  default     = "84:b1:55:dd:b8:5d:ef:ac:7d:70:c5:c4:2b:c5:54:fa"
}

variable "private_key_path" {
  description = "Path to the private key file"
  type        = string
  default     = "~/.oci/oci_api_key.pem"
}

variable "region" {
  description = "Oracle Cloud region"
  type        = string
  default     = "us-chicago-1"
}

variable "compartment_ocid" {
  description = "OCID of the compartment"
  type        = string
  default     = "ocid1.tenancy.oc1..aaaaaaaa5rqv22xlz5kjxhv6u7qs6rwckyio4ua255ndsbhdkafmtmmjmpka"
}

# Get availability domains
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# Get latest Oracle Linux image
data "oci_core_images" "ol8" {
  compartment_id           = var.tenancy_ocid
  operating_system         = "Oracle Linux"
  operating_system_version = "8"
  shape                    = "VM.Standard.E2.1.Micro"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# Get Object Storage namespace
data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.tenancy_ocid
}

# Create VCN
resource "oci_core_vcn" "videostream_vcn" {
  compartment_id = var.tenancy_ocid
  display_name   = "videostream-pro-vcn"
  cidr_block     = "10.0.0.0/16"
  dns_label      = "videostreamvcn"
}

# Create Internet Gateway
resource "oci_core_internet_gateway" "videostream_igw" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.videostream_vcn.id
  display_name   = "videostream-pro-igw"
}

# Create Route Table
resource "oci_core_route_table" "videostream_rt" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.videostream_vcn.id
  display_name   = "videostream-pro-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.videostream_igw.id
  }
}

# Create Security List
resource "oci_core_security_list" "videostream_sl" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.videostream_vcn.id
  display_name   = "videostream-pro-sl"

  # Allow outbound traffic
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  # Allow SSH
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"

    tcp_options {
      min = 22
      max = 22
    }
  }

  # Allow HTTP
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"

    tcp_options {
      min = 80
      max = 80
    }
  }

  # Allow HTTPS
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"

    tcp_options {
      min = 443
      max = 443
    }
  }
}

# Create Subnet
resource "oci_core_subnet" "videostream_subnet" {
  compartment_id      = var.tenancy_ocid
  vcn_id              = oci_core_vcn.videostream_vcn.id
  display_name        = "videostream-pro-subnet"
  cidr_block          = "10.0.1.0/24"
  route_table_id      = oci_core_route_table.videostream_rt.id
  security_list_ids   = [oci_core_security_list.videostream_sl.id]
  dns_label           = "videostreamsubnet"
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
}

# Create Object Storage Bucket
resource "oci_objectstorage_bucket" "videostream_bucket" {
  compartment_id = var.tenancy_ocid
  name           = "videostream-pro-storage"
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  
  public_access_type = "ObjectRead"
  
  versioning = "Enabled"
  
  object_events_enabled = false
  
  storage_tier = "Standard"
}

# Create Compute Instance
resource "oci_core_instance" "videostream_instance" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.tenancy_ocid
  display_name        = "videostream-pro-server"
  shape               = "VM.Standard.E2.1.Micro"

  create_vnic_details {
    subnet_id        = oci_core_subnet.videostream_subnet.id
    display_name     = "videostream-pro-vnic"
    assign_public_ip = true
    hostname_label   = "videostreamserver"
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ol8.images[0].id
  }

  metadata = {
    ssh_authorized_keys = file("~/.ssh/id_rsa.pub")
    user_data = base64encode(templatefile("${path.module}/cloud-init.yaml", {
      supabase_url = "https://wlxnokpfdxdjvpjjyevr.supabase.co"
      supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndseG5va3BmZHhkanZwamp5ZXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDE2MDcsImV4cCI6MjA2NzA3NzYwN30.q2r4nwRLG0DOajE9SQ25TTmJKoKUHhcO5uWxTg0b97c"
    }))
  }

  shape_config {
    memory_in_gbs = 1
    ocpus         = 1
  }
}

# Outputs
output "instance_public_ip" {
  description = "Public IP of the compute instance"
  value       = oci_core_instance.videostream_instance.public_ip
}

output "bucket_name" {
  description = "Name of the Object Storage bucket"
  value       = oci_objectstorage_bucket.videostream_bucket.name
}

output "bucket_namespace" {
  description = "Namespace of the Object Storage bucket"
  value       = data.oci_objectstorage_namespace.ns.namespace
}

output "website_url" {
  description = "URL to access the website"
  value       = "http://${oci_core_instance.videostream_instance.public_ip}"
}