$(document).ready(function(){

	if (screen.width < 767) { $(document).scrollTop(60); }

	sendXml('');

	$('.jmri .btn.power').click(function(e){
		var el = $(this),
			v = el.hasClass('btn-success') ? el.attr('data-value-off') : el.attr('data-value-on');
		$.get('/trains/power/'+v, function(data, status){
			el.removeClass('btn-success').find('i').removeClass('icon-white');
			if(data=='2'){ el.addClass('btn-success').find('i').addClass('icon-white'); }
		});
	});

	$('.jmri .refresh .btn').click(function(e){
		sendXml('');
	});

	$('.jmri .turnout .btn').click(function(e){
		var el = $(this),
			a = el.attr('data-address'),
			v = el.hasClass('btn-success') ? el.attr('data-value-off') : el.attr('data-value-on');
		sendXml("<turnout name='"+a+"' set='"+v+"' />");
	});

	$('.debugtoggle').click(function(){
		$('.debug').toggle();
	});

	$('.lines .jmri.yamanote img').click(function(){
		$('.lines .jmri').not('.yamanote').toggleClass('hidden');
	});

	$('.jmri .speed .btn').click(function(e){
		var el = $(this),
			a = el.closest('.jmri').attr('data-address'),
			v = el.attr('data-value');
		$.get('/trains/throttle/'+a+'/speed/'+v, function(data, status){
			el.siblings().removeClass('btn-success').find('i').removeClass('icon-white');
			el.addClass('btn-success').find('i').addClass('icon-white');
		});
	});

	$('.jmri .function .btn').click(function(e){
		var el = $(this),
			a = el.closest('.jmri').attr('data-address'),
			f = el.attr('data-function'),
			v = el.hasClass('btn-success') ? el.attr('data-value-off') : el.attr('data-value-on');
		$.get('/trains/throttle/'+a+'/f/'+f+'/'+v, function(data, status){
			el.removeClass('btn-success').find('i').removeClass('icon-white');
			if(v==el.attr('data-value-on')){ el.addClass('btn-success').find('i').addClass('icon-white'); }
		});
	});

	$('.jmri .direction .btn').click(function(e){
		var el = $(this),
			a = el.closest('.jmri').attr('data-address'),
			v = el.attr('data-value');
		$.get('/trains/throttle/'+a+'/direction/'+v, function(data, status){
			el.siblings().removeClass('btn-success').find('i').removeClass('icon-white');
			el.addClass('btn-success').find('i').addClass('icon-white');
		});
	});


	$('.cam').click(function(e){
		var el = $(this),
			cmd = el.data('cmd');

		console.log(cmd);

		switch(cmd){
			case 'stat':
				$.get('/cam/status', function(data){
					$('#output').text(data);
				});
				break;
			case 'preset':
				$.get('/cam/preset/'+el.data('preset-name'));
				break;
			case 'ir':
				var status = (el.hasClass('btn-success')) ? 'off' : 'on';
				$.get('/cam/ir/'+status, function(){
					el.toggleClass('btn-success').find('i').toggleClass('icon-white');
				});
				break;
		}
	});

	$('.indigo').click(function(e){
		var el = $(this),
			qsdata = {
				id : el.attr('data-deviceid'),
				key : el.attr('data-key'),
				val : el.hasClass('btn-success') ? el.attr('data-value-off') : el.attr('data-value-on')
			};

		$.get('/devices/', qsdata, function (err, data) {
			el.toggleClass('btn-success').find('i').toggleClass('icon-white');
		});
	});

	function sendXml(xmldata, callback){
		// add status xml to request string
		xmldata += "<throttle><address>11</address></throttle><throttle><address>13</address></throttle><throttle><address>17</address></throttle><item><type>power</type><name>power</name></item><list type='turnout' />";
		// wrap in appropriate tags
		xmldata = '<?xml version="1.0" encoding="UTF-8"?><XMLIO>'+xmldata+'</XMLIO>';
		// send to api and process response
		$.post('http://jmri.rodimus.x.thechad.io/xmlio/', xmldata, updateUI,'xml');
	}

	function updateUI(data){
		var outputStr = (new XMLSerializer()).serializeToString(data);
		$('#output').text(outputStr);
		var xmlDoc = $.parseXML(outputStr);
		var xml = $(xmlDoc);

		var $turnouts = xml.find("turnout");
		if($turnouts.length){
			$.each($turnouts, function(i, turnout){
				var a = $(turnout).attr('name'),
					isOn = ($(turnout).attr('value')!='2');
				$(".jmri .turnout .btn[data-address='"+a+"']").toggleClass('btn-success', isOn).find("i").toggleClass('icon-white', isOn);
			});
		}

		var $throttles = xml.find("throttle");
		if($throttles.length){
			$.each($throttles, function(i, throttle){
				var a = $(throttle).find('address').text(),
					f = $(throttle).find('forward').text(),
					s = $(throttle).find('speed').text(),
					l = $(throttle).find('F0').text();
				if(s==='0.0') s='0';

				$throttleEl = $(".jmri[data-address='"+a+"']");

				$throttleEl.find(".direction .btn").toggleClass('btn-success', false).find("i").toggleClass('icon-white', false);
				$throttleEl.find(".direction .btn[data-value='"+f+"']").toggleClass('btn-success').find("i").toggleClass('icon-white');

				$throttleEl.find(".speed .btn").toggleClass('btn-success', false).find("i").toggleClass('icon-white', false);
				$throttleEl.find(".speed .btn[data-value='"+s+"']").toggleClass('btn-success').find("i").toggleClass('icon-white');

				$lightEl = $throttleEl.find(".function .btn[data-function='0']");
				$lightEl.removeClass('btn-success').find('i').removeClass('icon-white');
				if(l=='true'){
					$lightEl.addClass('btn-success').find('i').addClass('icon-white');
				}
			});

		}

	}

});
