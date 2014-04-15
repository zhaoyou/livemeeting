var ChatBox = function(container, userId, model) {
  this.container_ = container;
  this.model_ = model;
  this.userId_ = userId;

  this.init_();
};

ChatBox.prototype.init_ = function() {
  var self = this;
  $(this.container_).find('.message-send').click(function(e) {
    var ni = $(self.container_).find('.message-input-name');
    var name = ni.val();
    if (name == '') {
      ni.focus();
      return false;
    }
    var mi = $(self.container_).find('.message-input');
    var text = mi.val().trim();
    if (text == '') {
      mi.focus();
      return false;
    }

    self.model_.sendMessage(self.userId_, name, text);
    mi.val('');
  });

  this.model_.addMessageListener(function(messages) {
    self.renderMessages_(messages);
  });

  this.model_.init();
  this.model_.markSelfOnline(this.userId_);
};

ChatBox.prototype.renderMessages_ = function(messages) {
  var list = $(this.container_).find('.message-container');
  list.empty();
  messages.forEach(function(message) {
    var time = new Date(message['time']);
    var formatDate = time.toTimeString().split(' ')[0];
    if (message['visible'] || (message['userId'] === this.userId_)) {
      $('<pre/>')
          .append($('<span class="message-name"/>').text(message['name']))
          .append($('<div class="message-time"/>').text(formatDate))
          .append($('<div class="message-body"/>').text(message['text']))
          .appendTo(list);
    }
  }, this);
  list[0].scrollTop = list[0].scrollHeight;
};
