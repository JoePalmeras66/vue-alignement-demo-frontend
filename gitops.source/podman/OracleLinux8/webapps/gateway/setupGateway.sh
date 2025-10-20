#!/bin/bash

cd $(dirname $0)

. common

podname="gateway"

checkremoval $1

doupdate $1
