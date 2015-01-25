---
title: "Building a Raspberry Pi Spy Copter with the DJI Phantom"
slug: "raspberry-spycopter"
date: "2014-08-21"
template: post.hbs
---

![](../images/posts/raspberry-spy-copter/copter-1-sm.jpg)

The DJI Phantom weighs about 1kg, and will fly well with up to 1.3kg. 300g is a lot of equipment
that can be loaded onto the quadcopter.

In comparison, a Raspberry Pi weighs just 45g.


![](../images/posts/raspberry-spy-copter/copter-2-sm.jpg)

All together this weighs around 200g.

### Some Ideas

* The Gimbal of the Quadcopter doesn't have to be detached. The Raspberry Pi could
communicate with the GoPro while in the air.

* Attaching GPS will make WiFi sniffing even more fun. How about following people on the ground from the
air, using their MAC addresses?

* The Raspberry Pi could draw power from the Quadcopter, like the GoPro, and leave more weight to be used by other stuff.

* Using a USB 3G module, live data from the flight could be collected by a server, and displayed in realtime.

## A Raspberry Spycopter flying with GPS and sniffing WiFi networks

![](../images/posts/raspberry-spy-copter/flying-1-sm.jpg)

![](../images/posts/raspberry-spy-copter/flying-2-sm.jpg)

![](../images/posts/raspberry-spy-copter/flying-3-sm.jpg)

After flying around for 4 minutes or so in a radius of about 300m, the Raspberry Pi had found
20 WLAN networks, of which one was even WEP-based (could crack it out of the air, with aircrack :).

## Equipment Used

* 80g 2600mAh battery pack

* Raspberry Pi

* TP-Link TL-WN722N

* Tape & Wire

### Optional

* USB hub

* USB GPS

## Choosing a Battery

Search Amazon for "battery pack". There are countless products
(many of which just appear to be the same rebranded thing).
I would recommend buying them from Amazon, if you can wait for a while, as
the prices in shops often tend to be 150% up to 400% higher.

If a long battery life is important, it can be sacrificed for weight.
There are products with 240g, and up to 10Ah, but some of the smaller ones
at about 70-80g, with up to 3Ah are in most cases more useful.

In my case, I chose one of [these](http://www.amazon.de/PowerIQ-Externer-Ladeger%C3%A4t-Technologie-Smartphones-Black/dp/B005QI1A8C/ref=sr_1_3/279-3388783-9926765?ie=UTF8&qid=1408628619&sr=8-3&keywords=battery+pack).
This is again just one rebranded variation of the same thing. The capacity may be anything from
from 2500mAh to 3000mAh, and at 80g the weight should pose no problem.

## About WiFi

I recommend the TP-Link [WN722N](http://www.tp-link.us/products/details/?categoryid=243&model=TL-WN722N),
or other devices on this [list](http://wireless.kernel.org/en/users/Devices/USB) with the driver `ath9k_htc`.
Many others work well too, but I found the Atheros chips to be the most reliable.
Be careful with realtek-based devices, except there are
sources proving that they do work (while they generally work well for normal, they often have problems with promiscous mode and sniffing).
