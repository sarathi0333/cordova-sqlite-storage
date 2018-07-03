/* 'use strict'; */

var MYTIMEOUT = 12000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

// Detect actual platform:
var isWindows = /MSAppHost/.test(navigator.userAgent);
var isAndroidUA = /Android/.test(navigator.userAgent);
var isAndroid = (isAndroidUA && !isWindows);
var isMac = /Macintosh/.test(navigator.userAgent);
var isAppleMobileOS = /iPhone/.test(navigator.userAgent) ||
      /iPad/.test(navigator.userAgent) || /iPod/.test(navigator.userAgent);

var scenarioList = [ isAndroid ? 'Plugin-implementation-default' : 'Plugin', 'HTML5', 'Plugin-implementation-2' ];

var scenarioCount = (!!window.hasWebKitWebSQL) ? (isAndroid ? 3 : 2) : 1;

var mytests = function() {

  for (var i=0; i<scenarioCount; ++i) {

    describe(scenarioList[i] + ': REGEX test(s)', function() {
      var scenarioName = scenarioList[i];
      var suiteName = scenarioName + ': ';
      var isWebSql = (i === 1);
      var isImpl2 = (i === 2);

      // NOTE: MUST be defined in function scope, NOT outer scope:
      var openDatabase = function(name, ignored1, ignored2, ignored3) {
        if (isImpl2) {
          // explicit database location:
          return window.sqlitePlugin.openDatabase({name: name, location: 'default', androidDatabaseImplementation: 2});
        }
        if (isWebSql) {
          return window.openDatabase(name, "1.0", "Demo", DEFAULT_SIZE);
        } else {
          // explicit database location:
          return window.sqlitePlugin.openDatabase({name: name, location: 'default'});
        }
      }

      it(suiteName + 'Simple REGEXP test',
        function(done) {
          // TBD Test for Android Web SQL ONLY in this version branch:
          if (isWindows) pending('NOT IMPLEMENTED for Windows (plugin)');
          if (!isWebSql && !isWindows && isAndroid) pending('SKIP for Android plugin'); // TBD SKIP for Android plugin (for now)
          if (isWebSql && /Android 4.[1-3]/.test(navigator.userAgent)) pending('SKIP for Android 4.1-4.3 (WebKit) Web SQL');
          if (isWebSql && isAppleMobileOS) pending('SKIP for iOS (WebKit) Web SQL');
          // TBD REMOVE from version branches such as cordova-sqlite-ext:
          if (!isWebSql && (isAppleMobileOS || isMac)) pending('NOT IMPLEMENTED on iOS/macOS plugin');

          var db = openDatabase('simple-regexp-test.db', '1.0', 'test', DEFAULT_SIZE);

          expect(db).toBeDefined();

          db.transaction(function(tx) {

            expect(tx).toBeDefined();
            tx.executeSql('DROP TABLE IF EXISTS tt');
            tx.executeSql('CREATE TABLE tt (tv TEXT)');

            tx.executeSql('INSERT INTO tt VALUES (?)', ['test']);
            tx.executeSql('INSERT INTO tt VALUES (?)', ['tst2']);

            tx.executeSql("SELECT * from tt WHERE tv REGEXP('te?st2+')", [], function(tx, res) {
              expect(res.rows.length).toBe(1);
              expect(res.rows.item(0).tv).toBe('tst2');

              done();
            }, function(e) {
              // went wrong:
              expect(false).toBe(true);
              done();
            });
          });
        }, MYTIMEOUT);

    });
  };
}

if (window.hasBrowser) mytests();
else exports.defineAutoTests = mytests;

/* vim: set expandtab : */
