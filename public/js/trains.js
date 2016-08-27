$(document).ready(function(){

  $('.jmri .btn.power').click(function(){
    var el = $(this),
        v = el.hasClass('btn-success') ? el.attr('data-value-off') : el.attr('data-value-on');
    $.get('/trains/power/'+v, function(data){
      el.removeClass('btn-success').find('i').removeClass('icon-white');
      if(data=='2'){ el.addClass('btn-success').find('i').addClass('icon-white'); }
    });
  });

  $('.debugtoggle').click(function(){
    $('.debug').toggle();
  });

  $('.lines .jmri.yamanote img').click(function(){
    $('.lines .jmri').not('.yamanote').toggleClass('hidden');
  });

  $('.jmri .speed .btn').click(function(){
    var el = $(this),
        a = el.closest('.jmri').attr('data-address'),
        v = el.attr('data-value');
    $.get('/trains/throttle/'+a+'/speed/'+v, function(){
      el.siblings().removeClass('btn-success').find('i').removeClass('icon-white');
      el.addClass('btn-success').find('i').addClass('icon-white');
    });
  });

  $('.jmri .function .btn').click(function(){
    var el = $(this),
        a = el.closest('.jmri').attr('data-address'),
        f = el.attr('data-function'),
        v = el.hasClass('btn-success') ? el.attr('data-value-off') : el.attr('data-value-on');
    $.get('/trains/throttle/'+a+'/f/'+f+'/'+v, function(){
      el.removeClass('btn-success').find('i').removeClass('icon-white');
      if(v==el.attr('data-value-on')){ el.addClass('btn-success').find('i').addClass('icon-white'); }
    });
  });

  $('.jmri .direction .btn').click(function(){
    var el = $(this),
        a = el.closest('.jmri').attr('data-address'),
        v = el.attr('data-value');
    $.get('/trains/throttle/'+a+'/direction/'+v, function(){
      el.siblings().removeClass('btn-success').find('i').removeClass('icon-white');
      el.addClass('btn-success').find('i').addClass('icon-white');
    });
  });

  $('.cam').click(function(){
    var el = $(this),
        cmd = el.data('cmd');

    // eslint-disable-next-line no-console
    console.log(cmd);

    switch(cmd){
      case 'stat': {
        $.get('/cam/status', function(data){
          $('#output').text(data);
        });
        break;
      }
      case 'preset': {
        $.get('/cam/preset/'+el.data('preset-name'));
        break;
      }
      case 'ir': {
        var status = (el.hasClass('btn-success')) ? 'off' : 'on';
        $.get('/cam/ir/'+status, function(){
          el.toggleClass('btn-success').find('i').toggleClass('icon-white');
        });
        break;
      }
    }
  });

  $('.indigo').click(function(){
    var el = $(this),
        qsdata = {
          id : el.attr('data-deviceid'),
          key : el.attr('data-key'),
          val : el.hasClass('btn-success') ? el.attr('data-value-off') : el.attr('data-value-on')
        };

    $.get('/devices/', qsdata, function () {
      el.toggleClass('btn-success').find('i').toggleClass('icon-white');
    });
  });

});
