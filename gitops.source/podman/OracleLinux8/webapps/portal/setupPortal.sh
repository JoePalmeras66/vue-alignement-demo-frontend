#!/bin/bash

cd $(dirname $0)

. common

podname="portal"

checkremoval $1

doupdate $1
