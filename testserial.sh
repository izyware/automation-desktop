#!/bin/bash
set -e
izy.auto "session?new" queryObject.workflow test queryObject.exitCode 0 queryObject.sleep 1;
izy.auto "session?new" queryObject.workflow test queryObject.exitCode 1 queryObject.sleep 1;
echo done