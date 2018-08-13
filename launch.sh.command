#!/bin/bash
SCRIPTPATH=$( cd "$(dirname "$0")" ; pwd -P )
cd "$SCRIPTPATH"
./hycon --api --api_port=2442 --cpuMiners=0 --peer hplorer.com:8148 hplorer.com:8149 aux.hplorer.com:8149 $@
