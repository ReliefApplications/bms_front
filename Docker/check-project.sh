#!/bin/bash

# if the package.json file is not exsiting
if [ ! -f package.json ]; then
    echo "An error occured, no package.json found"
    exit 1
fi

# if the node_modules directory is not exsiting
if [ ! -d node_modules ]; then
    npm install
    exit 0
fi