#!/bin/bash

# optional parameters: additional parameters to supply to aws (e.g. profile)

# build the project (contents will be in directory dist/bms-front)
ng build --prod
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
aws s3 cp ./dist/bms-front_gzip s3://front.bmstaging.info --recursive --acl public-read --content-encoding gzip $*
aws cloudfront create-invalidation --distribution-id E2CS9FD9XA4VY8 --paths '/*' $*
echo "==="
echo "Upload complete"
