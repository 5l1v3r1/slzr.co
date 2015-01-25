---
title: "making a static site more convenient with shell scripts"
slug: "static-site-automation"
date: "2015-01-22"
template: post.hbs
---

This [site generator](https:/github.com/alexanderselzer/slzr.co) is quite convenient and relatively easy to use, but it has one disadvantage
compared to a dynamic CMS like WordPress: it takes a few times longer to initialize a post and publish it.
So I made a small shell script to automate common patterns. It doesn't add complexity since everything it does is transparent and could easily
be done manually.

### The old process

```
$ cd ~/git/slzr.co/content/sites
$ cp $SOMEOTHERSITE title.md
$ vim title.md
# Change title, add nice URL, find out the current date and format it correctly.
```

### The new process

```
$ cd ~/git/slzr.co
$ ./ctl add "Some title" nice-url-slug
```

### The script

```bash
#!/bin/bash

case $1 in
  "add")
      name=$2
      date=$(date +"%Y-%m-%d")

      if [[ -z $name ]]; then
        echo 'usage: ctl add {title} [slug]'
        exit 1
      fi

      slug=$3
      if [[ -z $slug ]]; then
        slug=$(echo -n $name | sed -e 's/\s/-/g' | tr '[:upper:]' '[:lower:]')
      fi

      echo $slug

      cat template.md | \
        sed -e "s/{{title}}/${name}/" | \
        sed -e "s/{{slug}}/${slug}/" | \
        sed -e "s/{{date}}/${date}/" \
        > "content/posts/${slug}.md"

      $0 edit $slug
    ;;

  "ls")
    search="${2:-title}:"

    for file in "content/posts/*.md"; do
      cat $file | grep $search | cut -d ':' -f2 > /dev/stdout
    done
    ;;

  "edit")
    if [[ -z $2 ]]; then
      echo 'usage: ctl edit {name}'
      exit 1
    fi

    if [[ -z $EDITOR ]]; then
      echo '$EDITOR not set'
    fi

    ${EDITOR} "content/posts/${2}.md"
    ;;

  "build")
    npm install
    node build.js
    ;;

  "resize-images")
    for file in content/images/posts/**/*.src.jpg;
    do
      convert $file -resize 46% -quality 80 ${file%.src.*}-sm.jpg
    done
    ;;

  "export")
      if [[ -z $2 ]]; then
        echo 'usage: ctl export {images}'
        exit 1
      fi

      if [[ $2 -eq "images" ]]; then
        tar czf images.tar.gz content/images/posts
      fi
    ;;

  *)
    echo 'usage: ctl add {title} [slug]'
    echo '       ctl edit {name}'
    echo '       ctl ls [title|slug|...]'
    ;;
esac
```
