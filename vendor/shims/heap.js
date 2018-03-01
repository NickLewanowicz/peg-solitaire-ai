(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['heap'],
      __esModule: true,
    };
  }

  define('heap', [], vendorModule);
})();
