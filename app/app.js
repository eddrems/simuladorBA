var app = angular.module('simuladorApp', ['ngRoute']);

app.provider('$numeraljsConfig', function () {
    var formats = {};

    this.setFormat = function (name, format) {
        formats[name] = format;
    };

    this.setDefaultFormat = function (format) {
        numeral.defaultFormat(format);
    };

    this.setLanguage = function (lang, def) {
        numeral.language(lang, def);
    };

    this.setCurrentLanguage = function (lang) {
        numeral.language(lang);
    };

    this.$get = function () {
        return {
            customFormat: function (name) {
                return formats[name] || name;
            }
        };
    };
});

app.filter('numeraljs', function ($numeraljsConfig) {
    return function (input, format) {
        if (!input) {
            return input;
        }

        format = $numeraljsConfig.customFormat(format);

        return numeral(input).format(format);
    };
});

app.config(function ($routeProvider) {
    $routeProvider
        .when('/',
            {
                templateUrl: 'ui/views/simulador.html',
                controller: 'simuladorController'
            })
        .otherwise({ redirectTo: '/' });


});