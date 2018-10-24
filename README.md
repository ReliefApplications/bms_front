Beneficiary Management System (BMS)
========
 A platform that allows humanitarian organisations to manage relief items (Food, Non Food Items, CASH) to people in needs for life-saving humanitarian responses to emergency situations


## About

MagicBox is an open-source platform that uses real-time information to inform
life-saving humanitarian responses to emergency situations. It's composed of
multiple GitHub repositories designed to ingest, aggregate, and serve data.

If you're an experienced dev and you'd like to get involved, contact us [here](https://reliefapps.org/career.php).

## What's here

This repo is the "master" repo for all BMS-related projects. It hosts 
the documentation, the frontend and other misc. Code for other
projects, like the [API](https://github.com/ReliefApplications/bms_api) is hosted in other 
repositories. 

## Contributing

**We are looking for collaboration from the Open Source community!** There's
so much we want to do, including but not limited to: enhancing existing 
applications with new features, optimizing the technical tools and algorithms 
involved to accommodate humanitarian challenges, and bringing our work closer to
the public to leverage their inputs via blog posts and tutorials.

* Please read our [contribution guidelines](https://github.com/ReliefApplications/bms_front/blob/dev/CONTRIBUTING.md) 
for details on what and how you can contribute.
* Check out our Trello [Development Project Board](https://trello.com/b/DqrwMZsv/bms).
* Look for tasks labelled `good first issues` under the Issues tab in each repo.


## Documentation

We are hoping to
establish a more user-friendly version soon, one that is readable by our potential users 
(e.g. developpers and humanitarian actors).


## Resources

To understand BMS better:

* Read the README for each repo (full list is [UNDER DEV](https://reliefapps.org)). 
An architecture diagram of how these components are connected to one another is coming soon.



========================================================
on day we will split that into two repos ;-)

# BmsFront tech doc

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
