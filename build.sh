#!/bin/bash

# check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

# build the docker image and tag it
docker build -t stats-frontend .

# run the docker container with the volume dist/ mounted to /app/dist/
docker run -v $(pwd)/dist/:/app/dist/ stats-frontend

echo "Done! Built files are in dist/"
