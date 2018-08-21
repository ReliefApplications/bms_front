#!/bin/bash

echo "Starting the container"

if [ ! -d node_modules ]; then
    npm install
fi

ng serve --host 0.0.0.0 
# you can precise your environment
# ng serve --host 0.0.0.0 --env=dev --port 4560 
   