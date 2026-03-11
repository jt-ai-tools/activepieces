#!/bin/bash

# Find all .md and .mdx files, excluding PROGRESS.md and any existing _zh_TW files
find . -type f \( -name "*.md" -o -name "*.mdx" \) \
    ! -name "PROGRESS.md" \
    ! -name "*_zh_TW.md" \
    ! -name "*_zh_TW.mdx" \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*"
