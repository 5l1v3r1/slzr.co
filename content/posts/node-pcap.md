---
title: "Node.js and libpcap"
date: "2014-10-4"
template: post.hbs
---

This is a (not particularly well-structured) log of my experiments with packet capturing in node.js

Parts of it will only work on Linux.

## Capturing packets on a local network

Tcpdump is basically libpcap and a lot of protocol parsers.
Using tcpdump to capture packets (as opposed to node):

#### HTTP GET / on GitHub, followed by DNS queries for the CDNs.

```
16:16:40.415951 IP 188.21.9.119.https > alexandlzersmbp.fritz.box.56203: Flags [P.], seq 2580970604:2580970689, ack 899639943, win 1392, options [nop,nop,TS val 42737208 ecr 333947378], length 85
16:16:40.415994 IP alexandlzersmbp.fritz.box.56203 > 188.21.9.119.https: Flags [.], ack 85, win 8186, options [nop,nop,TS val 333962429 ecr 42737208], length 0
16:16:40.599930 IP alexandlzersmbp.fritz.box.12060 > fritz.box.domain: 13754+ A? github.com. (28)
16:16:40.605987 IP alexandlzersmbp.fritz.box.12622 > fritz.box.domain: 25329+ A? api.github.com. (32)
16:16:40.606229 IP alexandlzersmbp.fritz.box.61820 > fritz.box.domain: 18858+ A? assets-cdn.github.com. (39)
16:16:40.606489 IP alexandlzersmbp.fritz.box.56648 > fritz.box.domain: 30920+ A? avatars1.githubusercontent.com. (48)
16:16:40.606714 IP alexandlzersmbp.fritz.box.52821 > fritz.box.domain: 40540+ A? avatars2.githubusercontent.com. (48)
16:16:40.606976 IP alexandlzersmbp.fritz.box.19979 > fritz.box.domain: 22494+ A? collector-cdn.github.com. (42)
16:16:40.628136 IP fritz.box.domain > alexandlzersmbp.fritz.box.56648: 30920 2/0/0 CNAME github.map.fastly.net., A 185.31.17.133 (99)
16:16:40.628359 IP alexandlzersmbp.fritz.box.22507 > fritz.box.domain: 51131+ A? collector.githubapp.com. (41)
```

## Node.js and libpcap

[node_pcap](https://github.com/mranney/node_pcap) is a binding to the C library, and
includes a bunch of [protocol parsers written in JavaScript](https://github.com/mranney/node_pcap/blob/master/pcap.js).

#### Example node.js program

this prints the source, destination MAC addresses, and the underlying protocol if it is IP, IPv6 or ARP.

```javascript
var args = require("minimist")(process.argv.slice(2))
var pcap = require("pcap")

var netInterface = args._[0] || "wlan0"
var filter = args.filter

var session = pcap.createSession(netInterface, filter)

session.on("packet", function(rawPacket) {
  var packet = pcap.decode.packet(rawPacket)

  log(packet)
})

function log(packet) {
  if (packet.link) {
    var line = packet.link.shost + "\t->\t" + packet.link.dhost

    if (packet.link.ip) {
      line = "IP\t" + line + "\t" + packet.link.ip.saddr + "\t->\t" + packet.link.ip.daddr
    }
    else if (packet.link.ipv6) {
      line = "IPv6\t" + line + "\t" + packet.link.ipv6.saddr + "\t->\t" + packet.link.ipv6.daddr
    }
    else if (packet.link.arp) {
      line = "ARP\t" + line + packet.link.arp.sender_pa + "\t->\t" + packet.link.arp.target_pa
    }
    else {
      console.log(JSON.stringify(packet, null, 2))
    }

    console.log(line)

  }
}
```

#### Output

all packets:
`node capture.js en0`
```
IP	c0:25:06:c7:d2:51	->	01:00:5e:7f:ff:fa	192.168.178.1	->	239.255.255.250
IPv6	c0:25:06:c7:d2:51	->	33:33:00:00:00:0c	fd00::c225:6ff:fec7:d251	->	ff05::c
IPv6	c0:25:06:c7:d2:51	->	33:33:00:00:00:0c	fe80::c225:6ff:fec7:d251	->	ff02::c
IP	14:10:9f:d8:85:d1	->	ff:ff:ff:ff:ff:ff	192.168.178.168	->	192.168.178.255
IP	14:10:9f:d8:85:d1	->	01:00:5e:00:00:01	192.168.178.168	->	224.0.0.1
IP	c0:25:06:c7:d2:51	->	01:00:5e:7f:ff:fa	192.168.178.1	->	239.255.255.250
IPv6	c0:25:06:c7:d2:51	->	33:33:00:00:00:0c	fd00::c225:6ff:fec7:d251	->	ff05::c
IPv6	c0:25:06:c7:d2:51	->	33:33:00:00:00:0c	fe80::c225:6ff:fec7:d251	->	ff02::c
IP	c0:25:06:c7:d2:51	->	01:00:5e:7f:ff:fa	192.168.178.1	->	239.255.255.250
IPv6	c0:25:06:c7:d2:51	->	33:33:00:00:00:0c	fe80::c225:6ff:fec7:d251	->	ff02::c
ARP	a4:ee:57:3f:0b:fe	->	ff:ff:ff:ff:ff:ff192.168.178.24	->	192.168.178.24
IP	a4:ee:57:3f:0b:fe	->	01:00:5e:7f:ff:fa	192.168.178.24	->	239.255.255.250
```

just arp:
`node capture.js --filter "arp" en0`
```
ARP	c0:25:06:c7:d2:51	->	14:10:9f:d8:85:d1192.168.178.1	->	192.168.178.168
ARP	14:10:9f:d8:85:d1	->	c0:25:06:c7:d2:51192.168.178.168	->	192.168.178.1
ARP	a4:ee:57:3f:0b:fe	->	ff:ff:ff:ff:ff:ff192.168.178.24	->	192.168.178.24
ARP	c0:25:06:c7:d2:51	->	14:10:9f:d8:85:d1192.168.178.1	->	192.168.178.168
ARP	14:10:9f:d8:85:d1	->	c0:25:06:c7:d2:51192.168.178.168	->	192.168.178.1
ARP	a4:ee:57:3f:0b:fe	->	ff:ff:ff:ff:ff:ff192.168.178.24	->	192.168.178.24
ARP	c0:25:06:c7:d2:51	->	14:10:9f:d8:85:d1192.168.178.1	->	192.168.178.168
ARP	14:10:9f:d8:85:d1	->	c0:25:06:c7:d2:51192.168.178.168	->	192.168.178.1
```

#### Filters

Filters are an efficient way of ignoring all useless packets.

See `man pcap-filter` ([http://www.tcpdump.org/manpages/pcap-filter.7.html](http://www.tcpdump.org/manpages/pcap-filter.7.html))

#### Packet examples

The kind of structure node_pcap represents packets in (JSON).

##### IP UDP Packet
```json
{
  "link_type": "LINKTYPE_ETHERNET",
  "link": {
    "dhost": "c0:25:06:c7:d2:51",
    "shost": "14:10:9f:d8:85:d1",
    "ethertype": 2048,
    "ip": {
      "version": 4,
      "header_length": 5,
      "header_bytes": 20,
      "diffserv": 0,
      "total_length": 31,
      "identification": 2459,
      "flags": {
        "reserved": 0,
        "df": 0,
        "mf": 0
      },
      "fragment_offset": 0,
      "ttl": 64,
      "protocol": 17,
      "header_checksum": 9596,
      "saddr": "192.168.178.168",
      "daddr": "217.68.255.33",
      "protocol_name": "UDP",
      "udp": {
        "sport": 38623,
        "dport": 10912,
        "length": 11,
        "checksum": 41570,
        "data_offset": 42,
        "data_end": 45,
        "data_bytes": 3,
        "data": [
          51,
          62,
          29
        ]
      }
    }
  },
  "pcap_header": {
    "tv_sec": 1412438327,
    "tv_usec": 899194,
    "caplen": 45,
    "len": 45,
    "link_type": "LINKTYPE_ETHERNET",
    "time_ms": 1412438327899.194
  }
}
```

##### ARP Packet
```json
{
  "link_type": "LINKTYPE_ETHERNET",
  "link": {
    "dhost": "10:fe:ed:50:c6:ee",
    "shost": "14:10:9f:d8:85:d1",
    "ethertype": 2054,
    "arp": {
      "htype": 1,
      "ptype": 2048,
      "hlen": 6,
      "plen": 4,
      "operation": "reply",
      "sender_ha": "14:10:9f:d8:85:d1",
      "sender_pa": "192.168.178.168",
      "target_ha": "10:fe:ed:50:c6:ee",
      "target_pa": "192.168.178.71"
    }
  },
  "pcap_header": {
    "tv_sec": 1412438590,
    "tv_usec": 859415,
    "caplen": 42,
    "len": 42,
    "link_type": "LINKTYPE_ETHERNET",
    "time_ms": 1412438590859.415
  }
}

```

##### 802.11 frame (monitor mode)

```json
{
  "link_type": "LINKTYPE_IEEE802_11_RADIO",
  "link": {
    "headerRevision": 0,
    "headerPad": 0,
    "headerLength": 26,
    "ieee802_11Frame": {
      "frameControl": 148,
      "type": 1,
      "subType": 9,
      "flags": 0,
      "duration": 30,
      "bssid": "58:93:96:45:3b:28",
      "shost": "88:32:9b:6e:f8:48",
      "dhost": "05:00:c0:53:01:00",
      "fragSeq": 0,
      "strength": -92
    }
  },
  "pcap_header": {
    "tv_sec": 1412658263,
    "tv_usec": 425633,
    "caplen": 58,
    "len": 58,
    "link_type": "LINKTYPE_IEEE802_11_RADIO",
    "time_ms": 1412658263425.633
  }
}
```
