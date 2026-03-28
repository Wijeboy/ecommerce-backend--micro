#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}E-Commerce Microservices - Health Check${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test function
test_service() {
  local name=$1
  local port=$2
  local endpoint=$3

  echo -n "Testing $name (port $port)... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port$endpoint" 2>/dev/null)
  
  if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
    return 0
  else
    echo -e "${RED}✗ FAILED (HTTP $response)${NC}"
    return 1
  fi
}

# Test all services
echo -e "${YELLOW}Testing Health Endpoints...${NC}\n"

services=(
  "API Gateway|3000|/health"
  "User Service|5001|/health"
  "Product Service|5002|/health"
  "Cart Service|5003|/health"
  "Order Service|5004|/health"
  "Payment Service|5005|/health"
  "Review Service|5006|/health"
)

passed=0
failed=0

for service in "${services[@]}"; do
  IFS='|' read -r name port endpoint <<< "$service"
  if test_service "$name" "$port" "$endpoint"; then
    ((passed++))
  else
    ((failed++))
  fi
done

echo -e "\n${BLUE}========================================${NC}"
echo -e "Results: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
echo -e "${BLUE}========================================${NC}\n"

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✓ All services are running!${NC}\n"
  echo -e "${YELLOW}Next Steps:${NC}"
  echo "1. Open Swagger UI: ${BLUE}http://localhost:3000/api-docs${NC}"
  echo "2. Test API endpoints from the Swagger interface"
  echo "3. Start with: Register User → Create Product → Add to Cart → Create Order"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some services are not responding!${NC}\n"
  echo -e "${YELLOW}Troubleshooting:${NC}"
  echo "1. Make sure all services are started in separate terminals"
  echo "2. Check terminal logs for errors"
  echo "3. Verify MongoDB connection is working"
  echo "4. Run: npm install in each service directory"
  echo ""
  exit 1
fi
