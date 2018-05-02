const hostapdNoPassphraseConnect = `#!/bin/sh

SSID=$1
PASSPHRASE=$2

cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.orig

network="\\nnetwork={\\n  ssid=\\"\${SSID}\\"\\n  key_mgmt=NONE\\n}"
echo $network >> /etc/wpa_supplicant/wpa_supplicant.conf

systemctl stop hostapd
sudo sed -i -e "s@^interface wlan0\\b@#interface wlan0@g" /etc/dhcpcd.conf
sudo sed -i -e "s@^static ip_address=$ip\\b@#static ip_address=$ip@g" /etc/dhcpcd.conf

wpa_cli -i wlan0 reconfigure
sudo /etc/init.d/networking restart`;

const hostapdPassphraseConnect = `#!/bin/sh

SSID=$1
PASSPHRASE=$2

cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.orig

echo "\${PASSPHRASE}" >> passphrase_file
config=$(wpa_passphrase "\${SSID}" < passphrase_file)
psk=$(echo $config | sed -n "s/.*\\bpsk=\\(.*\\)\\b.*/\\1/p")
network="\\nnetwork={\\n  ssid=\\"\${SSID}\\"\\n  psk=$psk\\n}"
rm passphrase_file
echo $network >> /etc/wpa_supplicant/wpa_supplicant.conf

systemctl stop hostapd
sudo sed -i -e "s@^interface wlan0\\b@#interface wlan0@g" /etc/dhcpcd.conf
sudo sed -i -e "s@^static ip_address=$ip\\b@#static ip_address=$ip@g" /etc/dhcpcd.conf

wpa_cli -i wlan0 reconfigure
sudo /etc/init.d/networking restart`;

const nmcliNoPassphraseConnect = `#!/bin/sh

SSID=$1
PASSPHRASE=$2

sudo su -c "echo 0 > /sys/module/bcmdhd/parameters/op_mode"
nmcli device disconnect wlan0
sleep 5
nmcli device wifi connect $SSID ifname wlan0`;

const nmcliPassphraseConnect = `#!/bin/sh

SSID=$1
PASSPHRASE=$2

sudo su -c "echo 0 > /sys/module/bcmdhd/parameters/op_mode"
nmcli device disconnect wlan0
sleep 5
nmcli device wifi connect $SSID ifname wlan0 password $PASSPHRASE`;

export function getConnectScript(isHostapd, passphrase) {
  if (isHostapd) {
    if (passphrase) {
      return hostapdPassphraseConnect;
    }

    return hostapdNoPassphraseConnect;
  }

  if (passphrase) {
    return nmcliPassphraseConnect;
  }

  return nmcliNoPassphraseConnect;
}
