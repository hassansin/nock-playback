var nock = require('nock');
var path = require('path');
var fs = require('fs-extra');

var defaults = {
  baseDir: path.join(process.cwd(), 'test', 'fixtures'),
  beforeCallback : 'before', // suite setup callback
  afterCallback : 'after', // suite cleanup callback
  ifPendingFail : false // any pending mocks should fail the suite
};

function playback (definitionName){

  definitionName = definitionName.endsWith('.json') ? definitionName : definitionName + '.json';


  //todo: strict typechecking
  var beforeCallback = typeof defaults.beforeCallback === 'string'? global[defaults.beforeCallback]: defaults.beforeCallback;
  var afterCallback = typeof defaults.afterCallback === 'string'? global[defaults.afterCallback]: defaults.afterCallback;

  //definition path
  var definitionsPath = path.join( defaults.baseDir, definitionName);
  var nocks = undefined;

  beforeCallback(function(done){
    //check if definition exists and readable
    fs.access(definitionsPath, fs.R_OK | fs.R_OK, function(err){
      if(err){
        //not found, start recording
        nock.recorder.rec({
          'output_objects':  true,
          'dont_print':      true
        });
      }
      else{
        //definitions found, load them
	
	nocks = nock.load(definitionsPath);
      }
      return done();
    });
  });

  afterCallback(function(done){
    if(nocks !== undefined){
      if (defaults.ifPendingFail) {
        var pendingMocks = nocks.reduce(function (acc, v) {
          if (!v.isDone()) {
            acc.push(JSON.stringify(v.pendingMocks()))
          }

          return acc
        }, [])
      }

      if (pendingMocks.length > 0) {
        return done(new Error('This nock went unused ' + pendingMocks))
      }

      return done();
    }

    //suite finished, save the recorded definitions
    var definitions = nock.recorder.play();
    nock.restore();
    fs.ensureFile(definitionsPath, function(err){
      if(err){
        return done(err);
      }
      fs.writeFile(definitionsPath, JSON.stringify(definitions, null, 2), done);
    });
  });
}

module.exports = playback;
module.exports.defaults = defaults;
