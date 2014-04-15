var VideoModel = function(baseRef) {
  this.baseRef = baseRef;
  this.init();
  this.listeners = [];
};


VideoModel.prototype.init = function() {
  this.baseRef.on('value', function(snapshot) {
    var message = snapshot.val();
    console.error(message);
    if(message) {
      this.web = message.web;
      this.ipad = message.ipad;
      this.doMessageCall_(message);
    }
  }, this);
};

VideoModel.prototype.changeUrl = function(web, ipad) {
  this.baseRef.set({
    'web': (web || this.web),
    'ipad': (ipad || this.ipad)
  });
}

VideoModel.prototype.addListener = function(callback, handler) {
  this.listeners.push({'callback': callback, 'handler': handler});
};


VideoModel.prototype.doMessageCall_ = function(message) {
  this.listeners.forEach(function(listener){
    listener['callback'].call(listener['handler'], message);
  });
};
