#!/bin/bash

cd $(dirname $0)

. common

podname="postgresbfg"

checkremoval $1

doupdate $1
