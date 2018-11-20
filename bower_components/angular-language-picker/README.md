# Angular language picker

## Demo

https://k88hudson.github.io/angular-language-picker/example

## Dependencies

Dependencies for this module include:

* `angular 1.2.x`
* `angular-bootstrap`
* `makerstrap`.

Install these with bower and make sure they are included in your page.

## Install

```bash
bower install k88hudson/angular-language-picker
```

## Usage

Add `k8LanguagePicker` to your angular module:

```js
var module = angular.module('example', ['k8LanguagePicker']);
```

In your html, use `language-picker` as an element or an attribute:

```html
<language-picker></language-picker>
<div language-picker></div>
```

You **must** add a `supported-languages` attribute, which supplies a list of supported languages by code.

```html
<language-picker supported-languages="['en-US', 'fr-CA']"></language-picker>
```

You will probably also want to add a `on-language-change` attribute, which takes callback function. You must call your function with a single param, `lang`, which is the language code of the selected language.

```html
<language-picker supported-languages="['en-US', 'fr-CA']" on-language-change="onChange(lang)"></language-picker>
```

```js
$scope.onChange = function (lang) {
  $scope.currentLang = lang;
});
```
