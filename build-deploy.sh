#!/bin/bash

# first parameter: environment to deploy to (front | testing)

#immediately exits if a command exits with an non-zero status
set -e

# build the project (contents will be in directory dist/bms-front)
echo "Build starting"
if [[ $1 == "front" ]]; then
    npm run build -- --prod --progress
elif [[ $1 == "testing" ]]; then
    npm run build -- --prod -c testing --progress
elif [[ $1 == "demo" ]]; then
    npm run build -- --prod -c demo --progress
else
    echo "Unknown environment"
    exit
fi
echo "Build complete"

# gzip up all files so that they are smaller
echo "Compression starting"
rm -Rf dist/bms-front_gzip/
cp -R dist/bms-front/ dist/bms-front_gzip/
gzip -9fr dist/bms-front_gzip/
FILES=`find dist/bms-front_gzip`
for FILE in $FILES; do
    NEW_FILE=${FILE/.gz/}
    echo $NEW_FILE
    if [ "${FILE}" != "${NEW_FILE}" ]; then
        mv ${FILE} ${NEW_FILE}
    fi;
done;
echo "Compression complete"

# deploy on aws
echo "Upload starting"
aws configure set aws_access_key_id ${aws_access_key_id}
aws configure set aws_secret_access_key ${aws_secret_access_key}
aws configure set default.region eu-central-1

if [[ $1 == "front" ]]; then
    aws s3 rm s3://front.bmstaging.info --recursive
    aws s3 cp ./dist/bms-front_gzip s3://front.bmstaging.info --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E2CS9FD9XA4VY8 --paths '/*'
elif [[ $1 == "testing" ]]; then
    aws s3 rm s3://testing.bmstaging.info --recursive
    aws s3 cp ./dist/bms-front_gzip s3://testing.bmstaging.info --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E1FDBGHL3DD0Y8 --paths '/*'
elif [[ $1 == "demo" ]]; then
    aws s3 rm s3://demo.humansis.org --recursive
    aws s3 cp ./dist/bms-front_gzip s3://demo.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id EETRVGJ9FHCMD --paths '/*'
fi
echo "Upload complete"
