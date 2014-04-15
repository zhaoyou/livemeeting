var VideoApp = function(elementId, model, width, height) {
  this.elementId = elementId;
  this.model = model;
  this.width = width;
  this.height = height;
  this.init();
}


VideoApp.prototype.init = function() {
  this.model.addListener(this.update, this);
  if((navigator.userAgent.match(/iPad/i) !== null) || (navigator.userAgent.match(/iPhone/i) !== null)) {
    this.device = 'ios';
    window.scrollTo(0, 48);
  } else {
    this.device = 'web';
  }
  var dom = $('#' + this.elementId)[0];
  $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
    if(e.target != dom) {
      if(!(
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      )) {
        $(dom).css('visibility', 'hidden');
      } else {
        $(dom).css('visibility', 'visible');
      }
    }
  });
};


VideoApp.prototype.changeUrl = function() {
  var videoWeb = document.getElementById('videoWeb');
  var videoIpad = document.getElementById('videoIpad');
  if (videoWeb && videoIpad) {
    this.model.changeUrl(videoWeb.value.trim(), videoIpad.value.trim());
    document.getElementById('changeVideoStatus').innerHTML = 'Changed';
    window.setTimeout(function() {
      document.getElementById('changeVideoStatus').innerHTML = '';
    }, 500);
  }
};


VideoApp.prototype.update = function(e) {
  if(this.device === 'web' && (this.webUrl != e['web'])) {
    this.webUrl = e['web'];
    if(this.webUrl.substr(0, 4) == 'rtmp') {
      this.updateRtmp(this.webUrl);
      this.plugin = 'rtmp';
    } else {
      this.updateHls(this.webUrl);
      this.plugin = 'hls';
    }
  }
  if((this.device === 'ios') && (this.ipadUrl != e['ipad'])) {
    this.ipadUrl = e['ipad'];
    this.updateIpad(this.ipadUrl);
  }
};


VideoApp.prototype.updateIpad = function(url) {
  $('#' + this.elementId).empty();
  this.iosApi = flowplayer(this.elementId, 'flowplayer/flowplayer3.2.16/flowplayer-3.2.16.swf', {
    clip: {
      ipadUrl: url,
      autoPlay: true,
      live: true,
    },
    onError: function(error) {
      console.log(error);
    }
  }).ipad().play();
};


VideoApp.prototype.updateRtmp = function(e) {
  var t = e.split('/');
  var file = t[t.length - 1];
  var stream = e.substr(0, e.length - file.length - 1);
  if(stream === this.stream && this.plugin === 'rtmp') {
    this.rtmpApi.play(
      {
        url: file,
        provider: "hddn",
        autoPlay: true,
        live: true,
        scaling: 'fit'
      }
    );
  } else {
    if(this.rtmpApi) {
      // clean
      $('#' + this.elementId).empty();
    }
    this.stream = stream;
    this.rtmpApi = flowplayer(this.elementId, 'flowplayer/flowplayer3.2.16/flowplayer-3.2.16.swf', {
      plugins: {
        hddn: {
          url: "flowplayer.rtmp-3.2.12.swf",
          netConnectionUrl: this.stream
        }
      },
      clip: {
        url: file,
        ipadUrl: e,
        provider: 'hddn',
        autoPlay: true,
        live: true,
        scaling: 'fit'
      },
      onError: function(error) {
        console.log(error);
      },
      wmode: 'opaque'
    }).play();
  }
};


VideoApp.prototype.updateHls = function(e) {
  if(this.plugin === 'hls') {
    this.hlsApi.play(
      {
        url: e,
        urlResolvers: "httpstreaming",
        provider: "httpstreaming",
        autoPlay: true,
        live: true
      }
    );
  } else {
    if(this.hlsApi) {
      // clean
      $('#' + this.elementId).empty();
    }
    this.hlsApi = flowplayer(this.elementId, 'flowplayer/flowplayer3.2.16/flowplayer-3.2.16.swf', {
      plugins:  {
        httpstreaming: {
          url: 'flowplayer.httpstreaminghls-3.2.10.swf'
        }
      },
      clip: {
        url: e,
        urlResolvers: "httpstreaming",
        provider: "httpstreaming",
        autoPlay: true,
        live: true
      },
      log: {
          level: 'debug',
          filter: 'org.osmf.*, org.electroteque.m3u8.*, org.flowplayer.bitrateselect.*'
      },
      onError: function(error) {
        console.log(error);
      }
    }).play();
  }
};
