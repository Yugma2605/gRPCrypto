#!/bin/bash
set -e

# Install dependencies
pnpm install --recursive

# Ensure Chromium is available (Playwright)
echo "Installing Chromium..."
(cd backend && pnpm exec playwright install chromium)

# Generate protobuf files
echo "Running buf codegen..."
(cd price && npx buf generate)

(cd backend && pnpm run dev) &
(cd frontend && pnpm run dev) &
wait
