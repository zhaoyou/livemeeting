var QuestionFiter = function(container, model) {
  this.container_ = container;
  this.model_ = model;

  this.init_();
};

QuestionFiter.prototype.init_ = function() {
  var self = this;

  this.model_.addMessageListener(function(messages) {
    self.renderMessages_(messages);
  });

  this.model_.init();
};

QuestionFiter.prototype.renderMessages_ = function(messages) {
  var list = $(this.container_).find('.message-container');
  var h = list[0].scrollTop;
  list.empty();
  var self = this;
  messages.forEach(function(message) {
    var time = new Date(message['time']);
    var formatDate = time.toTimeString().split(' ')[0];

    var mid = message['_id'];
    var checkbox = $('<input type="checkbox"/>').attr('checked', message['visible']);
    checkbox.change(function() {
      self.model_.setMessageVisible(mid, checkbox.is(':checked'));
    });
    var c = $('<div class="question"/>');
    c.append($('<label/>').text('前台显示').prepend(checkbox));
    c.append($('<span class="message-time"/>').text('[' + formatDate + ']'));
    c.append($('<span class="message-username"/>').text('[' + message['name'] + ']'));
    c.append($('<pre class="text"/>').text(message['text']));
    c.appendTo(list);
  }, this);
  list[0].scrollTop = h;
};
