---
title: "Fun things to do with tc"
slug: "linux-tc"
date: "2015-01-21"
template: post.hbs
---

Let's assume `wlp3s0` is my WiFi network interface, which it actually is.
`tc` is a weird Linux program that can control how packets flow through the network
interfaces, which can be used for quite a lot of more or less useful things.

### delaying packets

```bash
## delete the original root qdisc.
## if it says "RTNETLINK answers: File exists", do this:
tc qdisc del dev wlp0s20u1 root

## delay everything by 200ms
tc qdisc add dev wlp0s20u1 root netem delay 200ms

## delay everything by 200ms plus minus 40ms (more realistic)
tc qdisc add dev wlp0s20u1 root netem delay 200ms 40ms
```

`netem` stands for `Network Emulator` and was made for emulating WAN networks like the internet,
which can be great for testing web sites.
However the best use case of it is making video games "lag" and people complain about "the internet being slow".

The effects of this:

```
PING google.com (188.21.9.27) 56(84) bytes of data.
64 bytes from 188.21.9.27: icmp_seq=1 ttl=59 time=1019 ms
64 bytes from 188.21.9.27: icmp_seq=2 ttl=59 time=1017 ms
64 bytes from 188.21.9.27: icmp_seq=3 ttl=59 time=1017 ms
64 bytes from 188.21.9.27: icmp_seq=4 ttl=59 time=1017 ms
```

### "loosing" packets

```bash
tc qdisc del dev wlp0s20u1 root

tc qdisc add dev wlp0s20u1 root netem loss 25%
``` 

This one is really fun. At 25% packet loss ping will get stuck, retransmit, and not show much while you are
staring at it. If packet loss is very high (> 50%), chances are DNS resolution will fail.

```bash
## Notice the sequence numbers

PING google.com (188.21.9.120) 56(84) bytes of data.
64 bytes from 188.21.9.120: icmp_seq=2 ttl=58 time=20.2 ms
64 bytes from 188.21.9.120: icmp_seq=3 ttl=58 time=19.3 ms
64 bytes from 188.21.9.120: icmp_seq=5 ttl=58 time=19.1 ms
64 bytes from 188.21.9.120: icmp_seq=7 ttl=58 time=17.6 ms
64 bytes from 188.21.9.120: icmp_seq=10 ttl=58 time=19.2 ms
64 bytes from 188.21.9.120: icmp_seq=11 ttl=58 time=18.7 ms
64 bytes from 188.21.9.120: icmp_seq=12 ttl=58 time=25.8 ms
64 bytes from 188.21.9.120: icmp_seq=13 ttl=58 time=16.9 ms
64 bytes from 188.21.9.120: icmp_seq=15 ttl=58 time=17.0 ms
64 bytes from 188.21.9.120: icmp_seq=16 ttl=58 time=17.1 ms
64 bytes from 188.21.9.120: icmp_seq=18 ttl=58 time=16.1 ms
...
37 packets transmitted, 24 received, 35% packet loss, time 114404ms
rtt min/avg/max/mdev = 16.135/18.981/33.398/3.598 ms
```

Now try opening a web page. Some scripts, images and stylesheets will randomly take long or very long time to load. 
The bigger assets are, the longer they will also take to load, since they need a longer
sequence of TCP packets that have a 50% chance to get lost.

## corrupting packets

```bash
tc qdisc del dev wlp0s20u1 root

tc qdisc add dev wlp0s20u1 root netem corrupt 20%
```

This is basically another way of dropping packets, since TCP will fix errors by retransmission.
So nothing partucularily interesting, though it could have different effects on other protocols.
