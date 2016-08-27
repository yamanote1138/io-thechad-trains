(function(){
  'use strict';

  module.exports = function(app){
    return {
      sets: function(req, res){
        app.services.flickr.getPhotosets(function(photosets){
          res.render('photos/index', {title: 'Photos', photosets:photosets});
        });
      },
      set: function(req, res){
        app.services.flickr.getPhotoset(req.params.setid, function(err, photoset){
          res.render('photos/view', {title: photoset.title, photoset:photoset});
        });
      }
    };
  };
})();