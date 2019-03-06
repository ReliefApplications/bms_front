#!/bin/bash

# first parameter: environment to deploy to (front | testing)

# build the project (contents will be in directory dist/bms-front)
echo "Build starting"
if [[ $1 == "front" ]]; then
    ng build --prod
elif [[ $1 == "testing" ]]; then
    ng build --prod -c testing
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

aws s3 rm s3://$1.bmstaging.info --recursive
aws s3 cp ./dist/bms-front_gzip s3://$1.bmstaging.info --recursive --acl public-read --content-encoding gzip
if [[ $1 == "front" ]]; then
    aws cloudfront create-invalidation --distribution-id E2CS9FD9XA4VY8 --paths '/*'
elif [[ $1 == "testing" ]]; then
    aws cloudfront create-invalidation --distribution-id E1FDBGHL3DD0Y8 --paths '/*'
fi
echo "Upload complete"
