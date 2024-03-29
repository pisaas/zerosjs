/* tslint:disable:no-console */
const basicTests = require('./basic');
const methodTests = require('./methods');
const syntaxTests = require('./syntax');

module.exports = testNames => {
  return (app, errors, serviceName, idProp = 'id') => {
    if (!serviceName) {
      throw new Error('You must pass a service name');
    }

    const skippedTests = [];
    const allTests = [];

    const test = (name, runner) => {
      const skip = !testNames.includes(name);
      const its = skip ? it.skip : it;

      if (skip) {
        skippedTests.push(name);
      }

      allTests.push(name);

      its(name, runner);
    };

    describe(`Adapter tests for '${serviceName}' service with '${idProp}' id property`, () => {
      afterAll(() => {
        console.log('\n');
        testNames.forEach(name => {
          if (!allTests.includes(name)) {
            console.error(`WARNING: '${name}' test is not part of the test suite`);
          }
        });
        if (skippedTests.length) {
          console.log(`\nSkipped the following ${skippedTests.length} Zeros adapter test(s) out of ${allTests.length} total:`);
          console.log(JSON.stringify(skippedTests, null, '  '));
        }
      });

      basicTests(test, app, errors, serviceName, idProp);
      methodTests(test, app, errors, serviceName, idProp);
      syntaxTests(test, app, errors, serviceName, idProp);
    });
  };
};
