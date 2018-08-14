#!/bin/bash
SCRIPTPATH=$( cd "$(dirname "$0")" ; pwd -P )
cd "$SCRIPTPATH"
./hycon --nonLocal --api --api_port=2442 --persistent 206.189.115.213 13.124.250.60 13.125.73.58 13.209.189.177 --cpuMiners=0 --peer hplorer.com:8148 hplorer.com:8149 aux.hplorer.com:8149 pool.hplorer.com:8148 $@
