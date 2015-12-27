# nock playback
Small helper for nock library to record definitions and play it back automatically

## Install

`npm install nock-playback`

## Usage

`playback(fixtureName)` only call this method inside a test suite with a name and you're done. The library will record the nock definitions first time and save it in `test/fixtures` directory. Next time, it'll load the definitions if found.

```js

var request = require('request');
var playback = require('nock-playback');

describe('Module', function(){
	describe('#method', function(){

		
		//saves all definitions for this suite in /test/fixtures/module/method.json		
		//only add this line and you're done.
		playback('module/method'); 


		it('fetches json', function(done){
			request('https://api.github.com/repos/pgte/nock', {headers: {'User-Agent': 'request.js'}}, function(err, response, body){
				assert(response.statusCode === 200);
				return done(err);
			});
		});

	});
});

```

## Options

`playback.defaults.baseDir`: base directory to save definitions. default: `/test/fixtures`

`playback.defaults.beforeCallback`: suite setup callback. default `before`

`playback.defaults.afterCallback`: suite cleanup callback. default `after`


