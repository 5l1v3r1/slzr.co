---
title: "Recording audio on Android Wear"
date: "2014-12-10"
slug: "audiorecord-android-wear"
template: post.hbs
---

Android Wear is still quite new, which means that there are probably not
obvious solutions to all problems that can be Googled.

I really wanted to make a Wear App, so I chose to do something with audio recording.
Turned out this was not as obvious as I may have expected it to be, so I'm writing this
in the hope that it will help someone else.

This question shows why my initial approach of following the [Android docs](http://developer.android.com/guide/topics/media/audio-capture.html) and using `MediaRecorder` failed:

[Stackoverflow: Media recorder throws exception on Wear](http://stackoverflow.com/questions/25969617/mediarecorder-throw-java-lang-runtimeexception-start-failed-2147483648-when)

Confusing? Probably. Google said the Wear API [includes all but 5](https://developer.android.com/training/wearables/apps/index.html) APIs, `MediaRecorder` being none of them.

Also, the typical example of using the external storage will (probably, can't completely verify) fail on Android Wear since it does not support external storage too.
However, internal storage, especially cache storage, works great, and I'm unsure why the official examples don't use it too.

## Example App

### UI

```java

```


http://stackoverflow.com/questions/8499042/android-audiorecord-example
