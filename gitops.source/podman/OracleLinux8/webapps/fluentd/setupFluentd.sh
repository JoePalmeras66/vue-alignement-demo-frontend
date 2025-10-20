#!/bin/bash

cd $(dirname $0)

. common

podname="fluentd"

checkremoval $1

doupdate $1
