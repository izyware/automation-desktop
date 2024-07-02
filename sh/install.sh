#!/usr/bin/env bash
{ # this ensures the entire script is downloaded #
echo installing ...
mkdir ~/izyware;
cd ~/izyware;
git clone https://github.com/izyware/automation-desktop.git;
cd automation-desktop;
npm install;
npm link;
echo izy.auto installed
} # this ensures the entire script is downloaded #
