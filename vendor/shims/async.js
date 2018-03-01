(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['async'],
      __esModule: true,
    };
  }

  define('async', [], vendorModule);
})();
