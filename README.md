# BmsFront

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

## Development server

Run `ng serve -o` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build --prod` to build the project. The build artifacts will be stored in the `dist/bms-front` directory.

## Deploy on AWS S3
You need to set up a s3 bucket and make sure "Static website hosting" is enabled as well as public access to read data.

A simple tutorial for reference: https://medium.com/codefactory/angular2-s3-love-deploy-to-cloud-in-6-steps-3f312647a659

To push the build code to S3 Bucket: `aws s3 cp ./dist/bms-front s3://front.bmstaging.info --recursive --acl public-read`

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Dependencies

    - @swimlane/ngx-charts
    - crypto-js
    - hammerjs
    - jquery
    - leaflet
    - @ngx-translate/core
    - @mapbox/leaflet-omnivore


## Compatibilities

 - Drag and drop doesn't work in Mozilla


## Docker

This project works with Docker.
Pay attention to the @angular/cli version in your package.json file and make sure it corresponds to the one in the Dockerfile.

To start coding in a safe environment, please launch the docker container with the following command:

```bash
sudo docker-compose up devapp
```

If it's the first time, please run 
```bash
sudo ./docker-build.sh bms/front
```
