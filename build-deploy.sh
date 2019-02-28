#!/bin/bash

# first parameter: environment to deploy to (testing | front)
# optional parameters: additional parameters to supply to aws (e.g. profile)

# build the project (contents will be in directory dist/bms-front)
if [[ $1 == "front" ]]; then
    ng build --prod
elif [[ $1 == "testing" ]]; then
    ng build -c testing
else
    echo "Unknown environment"
    exit
fi
echo "==="
echo "Build complete"

# gzip up all files so that they are smaller
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
echo "==="
echo "Compression complete"

# deploy on aws
aws s3 rm s3://$1.bmstaging.info --recursive "${@:2}"
aws s3 cp ./dist/bms-front_gzip s3://$1.bmstaging.info --recursive --acl public-read --content-encoding gzip "${@:2}"
if [[ $1 == "front" ]]; then
    aws cloudfront create-invalidation --distribution-id E2CS9FD9XA4VY8 --paths '/*' "${@:2}"
fi
echo "==="
echo "Upload complete"
