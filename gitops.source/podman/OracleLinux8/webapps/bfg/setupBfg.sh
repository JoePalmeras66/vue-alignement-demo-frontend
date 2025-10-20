#!/bin/bash

cd $(dirname $0)

. common

podname="bfg"

checkremoval $1

doupdate $1
