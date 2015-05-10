import ts = require("typescript");
import tsc = require("../lib/tsc");

tsc._ts.executeCommandLine(ts.sys.args);

