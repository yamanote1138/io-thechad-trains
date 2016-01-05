(function(){
  'use strict';

  module.exports={
  	strPad: function(input, padLength, padString) {
  		var output = input.toString();
      padString = (typeof padString !== 'undefined') ? padString : '0';
  		while(output.length < padLength) output = padString + output;
  		return output;
  	}
  };
})();
