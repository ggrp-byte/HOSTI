#!/bin/bash

echo "🚀 Deploying VideoStream Pro to Oracle Cloud..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}Checking requirements...${NC}"
    
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
        echo "Visit: https://www.terraform.io/downloads.html"
        exit 1
    fi
    
    if ! command -v oci &> /dev/null; then
        echo -e "${YELLOW}⚠️  OCI CLI is not installed. Installing...${NC}"
        bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
    fi
    
    echo -e "${GREEN}✅ Requirements check passed${NC}"
}

# Setup OCI CLI configuration
setup_oci_config() {
    echo -e "${BLUE}Setting up OCI CLI configuration...${NC}"
    
    mkdir -p ~/.oci
    
    # Create OCI config file
    cat > ~/.oci/config << EOF
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaa3jzl4bywvd5dqxvm25zdeqnncxtp3ryzukdx3momutny7zhcqenq
fingerprint=84:b1:55:dd:b8:5d:ef:ac:7d:70:c5:c4:2b:c5:54:fa
tenancy=ocid1.tenancy.oc1..aaaaaaaa5rqv22xlz5kjxhv6u7qs6rwckyio4ua255ndsbhdkafmtmmjmpka
region=us-chicago-1
key_file=~/.oci/oci_api_key.pem
EOF

    echo -e "${YELLOW}📝 Please place your private key file at: ~/.oci/oci_api_key.pem${NC}"
    echo -e "${YELLOW}   Make sure the file has proper permissions: chmod 600 ~/.oci/oci_api_key.pem${NC}"
    
    read -p "Press Enter when you've placed the private key file..."
    
    if [ ! -f ~/.oci/oci_api_key.pem ]; then
        echo -e "${RED}❌ Private key file not found at ~/.oci/oci_api_key.pem${NC}"
        exit 1
    fi
    
    chmod 600 ~/.oci/oci_api_key.pem
    echo -e "${GREEN}✅ OCI CLI configured${NC}"
}

# Generate SSH key if not exists
setup_ssh_key() {
    echo -e "${BLUE}Setting up SSH key...${NC}"
    
    if [ ! -f ~/.ssh/id_rsa ]; then
        echo -e "${YELLOW}Generating SSH key...${NC}"
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    fi
    
    echo -e "${GREEN}✅ SSH key ready${NC}"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    echo -e "${BLUE}Deploying infrastructure with Terraform...${NC}"
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    echo -e "${YELLOW}Planning deployment...${NC}"
    terraform plan
    
    # Apply deployment
    echo -e "${YELLOW}Applying deployment...${NC}"
    terraform apply -auto-approve
    
    # Get outputs
    INSTANCE_IP=$(terraform output -raw instance_public_ip)
    BUCKET_NAME=$(terraform output -raw bucket_name)
    BUCKET_NAMESPACE=$(terraform output -raw bucket_namespace)
    
    echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
    echo -e "${GREEN}🌐 Instance IP: ${INSTANCE_IP}${NC}"
    echo -e "${GREEN}🪣 Bucket: ${BUCKET_NAME}${NC}"
    echo -e "${GREEN}📦 Namespace: ${BUCKET_NAMESPACE}${NC}"
    
    cd ..
}

# Build and deploy application
deploy_application() {
    echo -e "${BLUE}Building and deploying application...${NC}"
    
    # Build the application
    npm run build
    
    # Get instance IP from Terraform output
    cd terraform
    INSTANCE_IP=$(terraform output -raw instance_public_ip)
    cd ..
    
    # Wait for instance to be ready
    echo -e "${YELLOW}Waiting for instance to be ready...${NC}"
    sleep 60
    
    # Copy built files to the server
    echo -e "${YELLOW}Copying files to server...${NC}"
    scp -o StrictHostKeyChecking=no -r dist/* opc@${INSTANCE_IP}:/var/www/videostream-pro/
    
    # Copy environment file
    scp -o StrictHostKeyChecking=no .env opc@${INSTANCE_IP}:/var/www/videostream-pro/
    
    # Set proper permissions
    ssh -o StrictHostKeyChecking=no opc@${INSTANCE_IP} "sudo chown -R nginx:nginx /var/www/videostream-pro"
    
    echo -e "${GREEN}✅ Application deployed successfully!${NC}"
}

# Setup SSL certificate
setup_ssl() {
    echo -e "${BLUE}Setting up SSL certificate...${NC}"
    
    cd terraform
    INSTANCE_IP=$(terraform output -raw instance_public_ip)
    cd ..
    
    read -p "Do you have a domain name? (y/n): " has_domain
    
    if [ "$has_domain" = "y" ]; then
        read -p "Enter your domain name: " domain_name
        
        echo -e "${YELLOW}Setting up SSL for ${domain_name}...${NC}"
        ssh -o StrictHostKeyChecking=no opc@${INSTANCE_IP} "sudo certbot --nginx -d ${domain_name} --non-interactive --agree-tos --email admin@${domain_name}"
        
        echo -e "${GREEN}✅ SSL certificate installed for ${domain_name}${NC}"
        echo -e "${GREEN}🌐 Your website is available at: https://${domain_name}${NC}"
    else
        echo -e "${GREEN}🌐 Your website is available at: http://${INSTANCE_IP}${NC}"
        echo -e "${YELLOW}💡 To use HTTPS, you'll need a domain name${NC}"
    fi
}

# Main deployment process
main() {
    echo -e "${GREEN}🎬 VideoStream Pro - Oracle Cloud Deployment${NC}"
    echo -e "${GREEN}=============================================${NC}"
    
    check_requirements
    setup_oci_config
    setup_ssh_key
    deploy_infrastructure
    deploy_application
    setup_ssl
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}Your VideoStream Pro platform is now live!${NC}"
    
    cd terraform
    INSTANCE_IP=$(terraform output -raw instance_public_ip)
    cd ..
    
    echo -e "${GREEN}📊 Deployment Summary:${NC}"
    echo -e "${GREEN}  • Server IP: ${INSTANCE_IP}${NC}"
    echo -e "${GREEN}  • Website: http://${INSTANCE_IP}${NC}"
    echo -e "${GREEN}  • Storage: Oracle Cloud Object Storage${NC}"
    echo -e "${GREEN}  • Database: Supabase${NC}"
    echo -e "${GREEN}  • Max file size: 30GB${NC}"
    echo -e "${GREEN}  • Supported formats: MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV, 3GP, QuickTime${NC}"
}

# Run main function
main "$@"