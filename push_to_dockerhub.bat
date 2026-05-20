@echo off
title Docker Hub 1-Click Push Script
color 0b
echo =====================================================================
echo    OCTANE E-COMMERCE PLATFORM - AUTOMATED DOCKER HUB UPLOADER
echo    Student: Faizan Ehsan (Roll: FA23-BCS-183)
echo =====================================================================
echo.
echo This script will use your active Docker Desktop to:
echo 1. Build production-optimized images for all 5 microservices
echo 2. Automatically push them to your Docker Hub repository!
echo.
echo Please ensure you are logged in to your Docker Desktop GUI
echo (Click 'Sign In' in top-right of Docker Desktop to log in automatically).
echo =====================================================================
echo.
pause
echo.

echo.
echo =====================================================================
echo STEP 2: BUILDING PRODUCTION IMAGES (This might take a minute...)
echo =====================================================================
echo.
echo [+] Building User Service...
docker build -t faizan212/user-service:latest ./src/user-service
echo [+] Building Product Service...
docker build -t faizan212/product-service:latest ./src/product-service
echo [+] Building Order Service...
docker build -t faizan212/order-service:latest ./src/order-service
echo [+] Building Notification Service...
docker build -t faizan212/notification-service:latest ./src/notification-service
echo [+] Building Frontend Static UI...
docker build -t faizan212/frontend:latest ./src/frontend

echo.
echo =====================================================================
echo STEP 3: PUSHING IMAGES TO YOUR DOCKER HUB (faizan212)
echo =====================================================================
echo.
echo [^>] Pushing User Service...
docker push faizan212/user-service:latest
echo [^>] Pushing Product Service...
docker push faizan212/product-service:latest
echo [^>] Pushing Order Service...
docker push faizan212/order-service:latest
echo [^>] Pushing Notification Service...
docker push faizan212/notification-service:latest
echo [^>] Pushing Frontend...
docker push faizan212/frontend:latest

echo.
echo =====================================================================
echo 🏆 SUCCESS! All 5 images are successfully uploaded to your Docker Hub!
echo =====================================================================
echo Refresh your browser at: https://hub.docker.com/u/faizan212
echo.
pause
