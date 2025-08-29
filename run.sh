#!/bin/bash
set -e

# Install dependencies
pnpm install --recursive

# Generate protobuf files
echo "Running buf codegen..."
(cd price && npx buf generate)

(cd backend && pnpm run dev) &
(cd frontend && pnpm run dev) &
wait
