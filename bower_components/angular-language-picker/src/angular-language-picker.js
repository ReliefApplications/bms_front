(function (window, angular) {
  angular
    .module('k8LanguagePicker', ['templates-k8LanguagePicker', 'ui.bootstrap'])
    .constant('langMap', window.languageMappingList)
    .directive('langPicker', [
      '$modal',
      'langMap',
      function ($modal, langMap) {
        return {
          restrict: 'AE',
          transclude: true,
          scope: {
            supportedLanguages: '=',
            callback: '&onLanguageChange'
          },
          replace: true,
          templateUrl: 'lang-picker-button.html',
          link: function (scope, el, attrs, ctrl) {
            scope.open = function() {
              $modal.open({
                templateUrl: 'lang-picker.html',
                controller: function($scope, $modalInstance) {
                  $scope.close = $modalInstance.close;
                  $scope.limit = 24;
                  $scope.supportedLanguages = scope.supportedLanguages;
                  $scope.langInfo = $scope.supportedLanguages.map(function (lang) {
                    var obj = langMap[lang] || {
                      nativeName: lang,
                      englishName: lang
                    };
                    obj.lang = lang;
                    return obj;
                  });
                  $scope.onLanguageChange = function(lang) {
                    scope.callback(lang);
                    $modalInstance.close();
                  };
                }
              });
            };
          }
        };
      }
    ]);
}(this, this.angular));
