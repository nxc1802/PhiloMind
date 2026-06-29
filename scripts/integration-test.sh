#!/bin/bash
set -e

# PhiloMind Containerized End-to-End Integration Health Check

echo "============================================="
echo "  PhiloMind Integration Health Diagnostics   "
echo "============================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to check curl responses
check_endpoint() {
  local name=$1
  local url=$2
  local expected_status=$3
  
  echo -n "Checking $name ($url)... "
  
  # Fetch http code
  set +e
  status_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url")
  set -e
  
  if [ "$status_code" -eq "$expected_status" ] || { [ "$expected_status" -eq 200 ] && [ "$status_code" -eq 304 ]; }; then
    echo -e "${GREEN}ACTIVE (HTTP $status_code)${NC}"
    return 0
  else
    echo -e "${RED}FAILED (HTTP $status_code, expected $expected_status)${NC}"
    return 1
  fi
}

# 1. Check Python TTS Worker
check_endpoint "TTS Worker Health Endpoint" "http://localhost:8000/health" 200 || tts_fail=1

# 2. Check Backend API swagger or course info
check_endpoint "Backend Swagger API Docs" "http://localhost:3001/docs" 200 || be_fail=1

# 3. Check Frontend Server
check_endpoint "Frontend Vite React Web App" "http://localhost:3000" 200 || fe_fail=1

# Integration Assessment Summary
echo "============================================="
if [ -n "$tts_fail" ] || [ -n "$be_fail" ] || [ -n "$fe_fail" ]; then
  echo -e "${RED}Diagnostic Failed. Some PhiloMind services are unresponsive.${NC}"
  echo "Make sure containers are compiled and running using: 'docker-compose up --build'"
  exit 1
else
  echo -e "${GREEN}Diagnostic Passed! All PhiloMind sanctuary services are active & interconnected.${NC}"
  exit 0
fi
