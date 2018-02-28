$.fn.toggleClick=function(){
  var functions = arguments,
      iteration = 0;

  return this.click(function(){
    functions[iteration].apply(this,arguments);
    iteration = (iteration+1) % functions.length;
  });
};

$(document).ready(function() {
  var camdiv = $('.webcam #camimg'),
      camera = parseInt(camdiv.attr('data-camera'), 10),
      maxcam = parseInt(camdiv.attr('data-camcount'), 10)-1,
      currSlide = parseInt(camdiv.attr('data-start'), 10),
      prevCam = (camera === 0) ? maxcam : (camera-1),
      nextCam = (camera === maxcam) ? 0 : (camera+1);

  function onAfter(curr,next,opts) {
    currSlide = opts.currSlide;
  }

  camdiv.cycle({
    fx: 'fade',
    speed: 'fast',
    timeout: 1000,
    prev: '.webcam .controls a.next',
    next: '.webcam .controls a.prev',
    startingSlide: currSlide,
    after: onAfter
  });
  camdiv.cycle('pause');

  $('.webcam .controls a.play').toggleClick(
    function() {
      $('.webcam #camimg').cycle('resume');
      $(this).text('STOP');
    },
    function() {
      $('.webcam #camimg').cycle('pause');
      $(this).text('PLAY');
    }
  );

  $(document).keydown(function(e) {
    switch(e.keyCode) {
      // User pressed left" arrow
      case 37: {
        camdiv.cycle('next');
        break;
      }
      // User pressed right arrow
      case 39: {
        camdiv.cycle('prev');
        break;
      }
      case 38: {
        window.location='/webcam/'+prevCam+'/'+currSlide;
        break;
      }
      case 40: {
        window.location='/webcam/'+nextCam+'/'+currSlide;
        break;
      }
    }
  });

});