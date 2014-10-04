---
title: "Aircrack and WiFi packet capturing"
date: "2014-10-4"
template: post.hbs
---

This is a log of my experiments with aircrack, tcpdump, libpcap, node.js.

Parts of it will only work on Linux.

## Capturing packets on a local network

Using tcpdump to capture packets.

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


## Installing Aircrack

The version of Aircrack-ng available in the Debian repositories might be a bit old, and will possibly
not work as expected. If this is true, compiling is quite easy.

```bash
$ wget http://download.aircrack-ng.org/aircrack-ng-1.2-beta3.tar.gz
$ tar xzf aircrack-ng-1.2-beta3.tar.gz
$ cd aircrack-ng-1.2-beta3
$ make
$ sudo make install
```

Warning: compiling took almost 10 minutes on a Raspberry Pi (Model B).

## Setting an interface to promiscuous mode

Note: Don't do this with the network interface currently running SSH over.

```bash
sudo airmon-ng start wlan1
```

`ip addr list` should look similar to this:

```
3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP qlen 1000
    link/ether 80:1f:02:cd:52:1d brd ff:ff:ff:ff:ff:ff
    inet 192.168.178.28/24 brd 192.168.178.255 scope global wlan0
       valid_lft forever preferred_lft forever
4: wlan1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP qlen 1000
    link/ether 10:fe:ed:24:e2:ba brd ff:ff:ff:ff:ff:ff
    inet 192.168.178.27/24 brd 192.168.178.255 scope global wlan1
       valid_lft forever preferred_lft forever
5: mon0: <BROADCAST,ALLMULTI,PROMISC,NOTRAILERS,UP,LOWER_UP> mtu 1500 qdisc mq state UNKNOWN qlen 1000
    link/ieee802.11/radiotap 10:fe:ed:24:e2:ba brd ff:ff:ff:ff:ff:ff
```

`sudo tcpdump -i mon0`:

```
...
15:27:14.659817 1151763740383us tsft 1.0 Mb/s 2412 MHz 11g -80dB signal antenna 0 Acknowledgment RA:10:fe:ed:24:e2:ba (oui Unknown)
15:27:11.992521 [bit 15] CF +QoS Data IV:1346 Pad 20 KeyID 0
15:27:14.661369 1151763740708us tsft 1.0 Mb/s 2412 MHz 11g -37dB signal antenna 0 Beacon ([////]) [1.0* 2.0* 5.5* 11.0* 6.0 9.0 12.0 18.0 Mbit] ESS CH: 1, PRIVACY
...
```

WiFi Beacons!


## Node.js and pcap

tcpdump is just libpcap, but it's probably a bad idea to parse the output of tcpdump, although parsing the `tcpdump -w <name>` file should be fine.
I woldn't do that, though, in this case, because just using the node library directly is less complex, and shows the packets in real-time.

#### Example program

this prints source, destination MAC addresses, and the underlying protocol if IP, IPv6, ARP.

```javascript
var args = require("minimist")(process.argv.slice(2))
var pcap = require("pcap")

var netInterface = args._[0] || "en0"

var session = pcap.createSession(netInterface)

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

Output:
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

This will only work on MAC-packets (packet.link is the MAC layer).

Packet examples:

IP UDP Packet:
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

ARP Packet:
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
