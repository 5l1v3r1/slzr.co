#lazyness

build:
	node build.js

images:
	./resize-images.sh

all: images build

default: build
