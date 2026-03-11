#!/bin/bash
# Find all .md and .mdx files, excluding PROGRESS.md and already translated files
FILES=$(./scripts/list_md_files.sh)
TOTAL=$(echo "$FILES" | wc -l)
TRANSLATED=0

while read -r file; do
    if [ -f "${file%.md}_zh_TW.md" ] || [ -f "${file%.mdx}_zh_TW.mdx" ]; then
        ((TRANSLATED++))
    fi
done <<< "$FILES"

echo "Translation Progress: $TRANSLATED / $TOTAL"
