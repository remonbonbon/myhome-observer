#!/usr/bin/python
# coding: utf-8
import commands
import re
import datetime
import os.path

now = datetime.datetime.today()
timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

# recording state
recording_size = os.path.getsize("../chinachu/data/recording.json")
recording_state = "standby"
if 2 < recording_size:
	# when not recording, this file is "[]"
	recording_state = "recording"

# HDD state
hdparm = commands.getoutput("sudo hdparm -C /dev/disk/by-uuid/e297668b-f29c-494a-8836-0d40aedd5c37")
hdd_state = re.search(r"drive state is\:[ ]+(.+)", hdparm).group(1).strip()

# CPU temperature
cpu_temp = ""
sensors = commands.getoutput("sudo sensors")
cpu_temp = re.search(r"CPUTIN\:[ ]+\+([0-9.]+)", sensors).group(1).strip()

# Drive temperature
# hddtemp = commands.getoutput("sudo hddtemp /dev/sdb")
# hdd_temp_groups = re.search(r"\: ([0-9.]+)", hddtemp)
# if hdd_temp_groups:
# 	hdd_temp = hdd_temp_groups.group(1).strip()
# else:
# 	hdd_temp = ""

# USBRH
usb_temp = ""
usb_humi = ""
usbrh = commands.getoutput("sudo usbrh")
match = re.search(r"([0-9\-.]+) ([0-9\-.]+)", usbrh)
if match:
  usb_temp = match.group(1).strip()
  usb_humi = match.group(2).strip()

# Disk free size (1K byte)
total_disk = ""
used_disk = ""
df = commands.getoutput("df --block-size=1K /record")
match = re.search(r"/dev/[a-z0-9]+\s+(\d+)\s+(\d+)\s+(\d+)", df)
if match:
  total_disk = match.group(1)
  used_disk = match.group(2)

# Load average
load_average_1min = ""
load_average_5min = ""
load_average_15min = ""
uptime = commands.getoutput("uptime")
match = re.search(r"load average\:\s+([0-9.]+),\s+([0-9.]+),\s+([0-9.]+)", uptime)
if match:
  load_average_1min = match.group(1)
  load_average_5min = match.group(2)
  load_average_15min = match.group(3)

print ",".join([
    timestamp,
    total_disk,
    used_disk,
    load_average_1min,
    load_average_5min,
    load_average_15min,
    cpu_temp,
    usb_temp,
    usb_humi,
    hdd_state,
    recording_state,
  ])
