#!/bin/bash
# Check the translation progress by scanning for all .md and .mdx files
# and seeing if their _zh_TW counterparts exist.

total_files=0
completed_files=0
pending_files=0

# Exclude node_modules, .git, etc.
# Find all .md/.mdx files that are NOT _zh_TW versions
while IFS= read -r file; do
    # Skip PROGRESS.md itself
    if [[ "$file" == "./PROGRESS.md" ]]; then continue; fi
    
    # Check if the file is an original or a translation
    if [[ "$file" == *"_zh_TW.md"* ]]; then continue; fi

    total_files=$((total_files + 1))
    
    # Construct the expected translation filename
    if [[ "$file" == *.mdx ]]; then
        zh_file="${file%.mdx}_zh_TW.mdx"
    else
        zh_file="${file%.md}_zh_TW.md"
    fi

    if [ -f "$zh_file" ]; then
        completed_files=$((completed_files + 1))
    else
        echo "Pending: $file"
        pending_files=$((pending_files + 1))
    fi
done < <(find . -type f \( -name "*.md" -o -name "*.mdx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*")

echo "--------------------------------"
echo "Total files to translate: $total_files"
echo "Completed: $completed_files"
echo "Pending:   $pending_files"
echo "Completion: $((completed_files * 100 / total_files))%"
