export default class TestReporter {
  onRunComplete(contexts, results) {

    console.log("\n==============================");
    console.log("TEST SUITE SUMMARY");
    console.log("==============================");

    console.log(`TOTAL TESTS: ${results.numTotalTests}`);
    console.log(`PASSED: ${results.numPassedTests}`);
    console.log(`FAILED: ${results.numFailedTests}`);
    console.log(`PENDING: ${results.numPendingTests}`);

    if (results.numFailedTests > 0) {
      console.log("\nSTATUS: SOME TESTS FAILED");
    } else {
      console.log("\nSTATUS: ALL TESTS PASSED");
    }

    console.log("==============================\n");
  }
}