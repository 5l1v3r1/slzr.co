---
title: "Aircrack on the Raspberry Pi"
date: "2014-10-11"
slug: "rpi-aircrack"
template: post.hbs
---

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

## Setting an interface to monitor mode

Note: Don't do this with the network interface currently running SSH on if unsure.
It might lock you out if there is no other way of connecting.

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

`wlan0` is a realtek chip (rtl8192cu) that does not support monitor mode and has a low range,
and `wlan1` is a TP-Link antenna with Atheros chip (ath9k) that works really well.

`sudo tcpdump -i mon0`:

```
15:27:14.659817 1151763740383us tsft 1.0 Mb/s 2412 MHz 11g -80dB signal antenna 0 Acknowledgment RA:10:fe:ed:24:e2:ba (oui Unknown)
15:27:11.992521 [bit 15] CF +QoS Data IV:1346 Pad 20 KeyID 0
15:27:14.661369 1151763740708us tsft 1.0 Mb/s 2412 MHz 11g -37dB signal antenna 0 Beacon ([////]) [1.0* 2.0* 5.5* 11.0* 6.0 9.0 12.0 18.0 Mbit] ESS CH: 1, PRIVACY
```

This is a wifi ACK frame (1), a data frame (2), and a beacon frame (3), which proves that the interface is in
monitor mode and works correctly.

## Finding targets with Airodump

```
BSSID              STATION            PWR   Rate    Lost    Frames  Probe

C0:25:06:C7:D2:57  10:FE:ED:24:E2:BA    0    0e- 0e     0    12991
C0:25:06:C7:D2:57  14:30:C6:2C:10:D3  -25    1e- 1      0      383
C0:25:06:C7:D2:57  80:1F:02:CD:52:1D  -27    0 - 6      1       85
(not associated)   A4:EE:57:3F:0B:FE  -81    0 - 1      0       10
90:84:0D:DB:49:FF  14:10:9F:D8:85:D1  -40    0 - 0e     0       12
```

```
BSSID              STATION            PWR   Rate    Lost    Frames  Probe

(not associated)   04:F7:E4:30:AC:5C  -45    0 - 1      0        3
(not associated)   A4:EE:57:3F:0B:FE  -78    0 - 1      0       18
(not associated)   18:1E:B0:CA:DA:24  -82    0 - 1      0        5
(not associated)   98:0C:82:34:3D:E6  -87    0 - 1      0        1
C0:25:06:C7:D2:57  10:FE:ED:24:E2:BA    0    0e- 0e     0    51742
C0:25:06:C7:D2:57  14:30:C6:2C:10:D3  -39    0e- 1      0     6553
C0:25:06:C7:D2:57  80:1F:02:CD:52:1D  -32    1e- 1e     0      561
A4:52:6F:45:97:FE  D0:AE:EC:84:B1:18  -76    0 - 1e     0      227  Kobergers Netzwerk
```

`10:FE:ED:24:E2:BA` is the Raspberry Pi,
`14:30:C6:2C:10:D3` an android phone
`14:10:9F:D8:85:D1` an iPhone

## Deauth Attack

```
$ sudo aireplay-ng -0 20 -a "C0:25:06:C7:D2:57" -c "10:FE:ED:24:E2:BA" --ignore-negative-one mon0
13:09:04  Waiting for beacon frame (BSSID: C0:25:06:C7:D2:57) on channel -1
....
..
```

and that's it. The Raspberry Pi just deauthenticated itself.
