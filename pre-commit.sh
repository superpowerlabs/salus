#!/usr/bin/env bash

echo -e "\033[0;35mPre-commit tasks...\033[0m"

npx pretty-quick --staged
pnpm test

