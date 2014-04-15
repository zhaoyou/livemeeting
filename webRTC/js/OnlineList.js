var OnlineList = function(baseRef, user, elementId) {
  this.onlineRef = baseRef.child('onlineusers');
  this.selfRef = this.onlineRef.child(user);
  this.ref = null;
  this.element = $('#' + elementId)[0];
  this.init_();
};


OnlineList.prototype.init_ = function() {
  this.setupOnlineList();
  this.doMarkOnline();
};


OnlineList.prototype.setupOnlineList = function() {
  var element = this.element;
  this.onlineRef.on('value', function(snapshot) {
    var users = [];
    snapshot.forEach(function(v) {
      if (v.numChildren()) {
        var u = v.name()
        users.push(u);
      }
    });
    users = users.sort();
    $(element).empty();
    users.forEach(function(u) {
      $(element).append('<div>' + u + '</div>')
    });
  });
};


OnlineList.prototype.doMarkOnline = function() {
  this.ref = this.selfRef.push({
    'time': new Date().getTime(),
    'ua': navigator.userAgent
  });
  this.ref.onDisconnect().remove();
  this.ref.on('value', this.onChange);
};


OnlineList.prototype.onChange = function(snapshot) {
  if (snapshot.val() === null) {
    console.log("offline");
    this.ref.off('value', onChange);
    this.doMarkOnline();
  } else {
    console.log("online");
  }
};
