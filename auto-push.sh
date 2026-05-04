#!/bin/bash

cd /c/Users/MINE/delivery || exit 1

git add .

if ! git diff --cached --quiet; then
  git commit -m "Auto update"
  git push
fi
