#!/bin/bash
for file in content/images/posts/**/*.src.jpg;
do
  convert $file -resize 46% -quality 80 ${file%.src.*}-sm.jpg
done
