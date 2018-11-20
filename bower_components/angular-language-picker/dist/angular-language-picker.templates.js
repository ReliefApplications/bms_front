angular.module('templates-k8LanguagePicker', ['lang-picker-button.html', 'lang-picker.html']);

angular.module("lang-picker-button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lang-picker-button.html",
    "<button ng-click=\"open()\" class=\"btn btn-default\">\n" +
    "  <span ng-transclude></span>\n" +
    "</button>\n" +
    "");
}]);

angular.module("lang-picker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("lang-picker.html",
    "<div class=\"modal-body modal-lang-picker\">\n" +
    "  <h3>Choose a language</h3>\n" +
    "  <div class=\"form-group\">\n" +
    "    <input class=\"form-control\" type=\"search\" ng-model=\"langSearch\" placeholder=\"Search languages...\">\n" +
    "  </div>\n" +
    "  <h4>Webmaker is offered in {{langInfo.length}} languages</h4>\n" +
    "  <div class=\"row\">\n" +
    "    <div class=\"col-xs-6 col-sm-4 col-lg-3\" ng-repeat=\"lang in langInfo | filter:langSearch | limitTo: limit\">\n" +
    "      <a href=\"#\" ng-click=\"onLanguageChange({lang: lang.lang})\" class=\"ellipsis lang-picker-lang\">\n" +
    "        {{lang.nativeName}}\n" +
    "      </a>\n" +
    "    </div>\n" +
    "    <div ng-if=\"langInfo.length - limit > 0\" class=\"col-xs-6 col-sm-3 col-lg-2\">\n" +
    "      + {{langInfo.length - limit}} more\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"modal-footer modal-lang-picker\">\n" +
    "  Don't see your language? <a target=\"_blank\" href=\"https://webmaker.org/translate\">Help us translate!</a>\n" +
    "</div>\n" +
    "\n" +
    "<button class=\"btn btn-link btn-close\" ng-click=\"close()\">\n" +
    "  <span class=\"fa fa-times\"></span>\n" +
    "  <span class=\"sr-only\">Close</span>\n" +
    "</button>\n" +
    "");
}]);
