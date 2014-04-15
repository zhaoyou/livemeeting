var ChatModel = function(baseRef) {
  this.baseRef_ = baseRef;
  this.messagesRef_ = this.baseRef_.child('messages');
  this.listeners_ = [];
};

ChatModel.prototype.init = function() {
  if (this.inited_) {
    return;
  }
  this.inited_ = true;

  // listen on messages value change
  this.messagesRef_.on('value', function(snapshot) {
    var messages = [];
    if (snapshot.val()) {
      snapshot.forEach(function(messageSnapshot) {
        var message = messageSnapshot.val();
        message['_id'] = messageSnapshot.name();
        messages.push(message);
      });
    }
    this.doMessagesUpdated_(messages);
  }, this);
};

ChatModel.prototype.setMessageVisible = function(mid, visible) {
  this.messagesRef_.child(mid).child('visible').set(visible);
};

ChatModel.prototype.sendMessage = function(userId, name, message) {
  var ref = this.messagesRef_.push({
    'userId': userId,
    'name': name,
    'text': message,
    'time': new Date().getTime(),
  });
};

ChatModel.prototype.addMessageListener = function(messageListener) {
  this.listeners_.push(messageListener);
};

ChatModel.prototype.doMessagesUpdated_ = function(messages) {
  this.listeners_.forEach(function(listener) {
    try {
      listener.call(null, messages);
    } catch (e) {
      console.error(e);
    }
  });
};

ChatModel.prototype.markSelfOnline = function(userId) {
  this.setVisited_(userId);

  var onlineRef = this.baseRef_.child('onlineusers');
  var selfRef = onlineRef.child(userId);
  var ref = selfRef.push({
    'time': new Date().getTime()
  });

  ref.onDisconnect().remove();
  ref.on('value', function(snapshot){
    if (snapshot.val() === null) {
      console.log('offline');
      ref.set({
        'time': new Date().getTime()
      });
      ref.onDisconnect().remove();
    } else {
      console.log('online');
    }
  });
};

ChatModel.prototype.setVisited_ = function(userId) {
  var visitedRef = this.baseRef_.child('visited');

  visitedRef.push({
    'user': userId,
    'time': new Date().getTime()
  });
};
