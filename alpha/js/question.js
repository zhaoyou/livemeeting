var Question = function(container, model) {
  this.container_ = container;
  this.model_ = model;

  this.init_();
};

Question.prototype.init_ = function() {
  var self = this;

  this.model_.addMessageListener(function(messages) {
    self.renderMessages_(messages);
  });

  this.model_.init();
};

Question.prototype.renderMessages_ = function(messages) {
  var list = $(this.container_).find('.message-container');
  list.empty();
  messages.forEach(function(message) {
    var time = new Date(message['time']);
    var formatDate = time.toTimeString().split(' ')[0];
    if (message['visible']) {
      var c = $('<div class="question"/>');
      c.append($('<span class="message-time"/>').text('[' + formatDate + ']'));
      c.append($('<span class="message-username"/>').text('[' + message['name'] + ']'));
      c.append($('<pre class="text"/>').text(message['text']));
      c.appendTo(list);
    }
  }, this);
  list[0].scrollTop = list[0].scrollHeight;
};
