var SlideModel = function(baseRef) {
  this.baseRef = baseRef;
  this.init();
  this.listeners = [];
};


SlideModel.prototype.init = function() {
  this.baseRef.on('value', function(snapshot) {
    var message = snapshot.val();
    if(message) {
      this.pdfMessage = message;
      this.doMessageCall_(this.pdfMessage);
    }
  }, this);
};

SlideModel.prototype.change = function(msg) {
  this.baseRef.set(msg);
}

SlideModel.prototype.addListener = function(callback, handler) {
  this.listeners.push({'callback': callback, 'handler': handler});
};


SlideModel.prototype.doMessageCall_ = function(message) {
  this.listeners.forEach(function(listener){
    listener['callback'].call(listener['handler'], message);
  });
};
