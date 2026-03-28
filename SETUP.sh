#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}E-Commerce Microservices - Quick Setup${NC}"
echo -e "${YELLOW}============================================${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}\n"

# Install dependencies for all services
services=("api-gateway" "user-service" "product-service" "cart-service" "order-service" "payment-service" "review-service")

for service in "${services[@]}"; do
    echo -e "${YELLOW}Installing dependencies for $service...${NC}"
    cd "$service" || exit
    npm install --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install dependencies for $service${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ $service dependencies installed${NC}\n"
    cd ..
done

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}All dependencies installed successfully!${NC}"
echo -e "${GREEN}============================================${NC}\n"

echo -e "${YELLOW}To start all services, open separate terminals and run:${NC}\n"

echo -e "${GREEN}Terminal 1 (API Gateway - Port 5000):${NC}"
echo "  cd api-gateway && npm run dev\n"

echo -e "${GREEN}Terminal 2 (User Service - Port 5001):${NC}"
echo "  cd user-service && npm run dev\n"

echo -e "${GREEN}Terminal 3 (Product Service - Port 5002):${NC}"
echo "  cd product-service && npm run dev\n"

echo -e "${GREEN}Terminal 4 (Cart Service - Port 5003):${NC}"
echo "  cd cart-service && npm run dev\n"

echo -e "${GREEN}Terminal 5 (Order Service - Port 5004):${NC}"
echo "  cd order-service && npm run dev\n"

echo -e "${GREEN}Terminal 6 (Payment Service - Port 5005):${NC}"
echo "  cd payment-service && npm run dev\n"

echo -e "${GREEN}Terminal 7 (Review Service - Port 5006):${NC}"
echo "  cd review-service && npm run dev\n"

echo -e "${YELLOW}After all services are running, test the API Gateway at:${NC}"
echo -e "${GREEN}http://localhost:5000/health${NC}\n"

echo -e "${YELLOW}See README.md for detailed API documentation and testing guide.${NC}"
