var RoomApp = function(userid, model, elem, remoteContainer, userListContainer) {
  this.userid = userid;
  this.model = model;
  this.elem = elem;
  this.remoteContainer = remoteContainer;
  this.userListContainer = userListContainer;
  this.calleeList = {};
  this.callerList = {};

  this.init();
}

RoomApp.prototype.init = function() {
  var self = this;
  this.model.listenUserList(function(userList) {
    $(this.userListContainer).empty();
    userList.forEach(function(u) {
      self.userListContainer.appendChild($('<div>' + u + '</div>')[0])
    });
  }, this);

  self.getLocalStream();
}

// get local stream.
RoomApp.prototype.getLocalStream = function() {
  var self = this;
  getUserMedia({'audio': true, 'video': true},
    function(stream) {
      attachMediaStream(self.elem, stream);
      self.localStream = stream;
      // request join Room.
      self.requestJoinRoom();
    }, function(error) {
      console.error('can not get local media');
    }
  );
}

RoomApp.prototype.requestJoinRoom = function() {
  var self = this;
  self.model.requestJoinRoom(self.successJoinRoom, function() {
    if(self.model.alreadyInRoom) {
      console.log('you already in room!', self.userid);
    } else {
      console.log("room is full, you can't join room", self.userid);
    }
  }, self);
}

// newuser join room success handler.
RoomApp.prototype.successJoinRoom = function() {
  console.log('entry room success !');
  var self = this;
  $(window).bind('beforeunload', function() {
    self.close();
  });
  this.initCallee();
  this.model.listenMessage(this.proceedMessage, this);

  // make self online.
  this.model.setOnline();

}

RoomApp.prototype.initCallee = function() {
  for (var i = 0; i < this.model.userList.length; i++) {
    var callerId = this.model.userList[i];
    if (callerId != this.userid) {
      var callee = new Callee(this.localStream, this.model, callerId, this.userid, this.remoteContainer);
      this.calleeList[callerId] = callee;
      this.model.sendMessage({'type': 'ready', 'callee': this.userid, 'caller': callerId});
    }
  }
};


RoomApp.prototype.proceedMessage = function(message) {
  if(message['type'] == 'ready' && message['callee'] != this.userid && message['caller'] == this.userid) {
    var caller = new Caller(
      this.model, this.localStream, this.userid, message['callee'], this.remoteContainer);
    this.callerList[message['callee']] = caller;
  } else if(message['type'] == 'leave' && message['to'] == this.userid) {
    var u = message['from'];
    if(this.callerList[u]) {
      this.callerList[u].close();
      delete this.callerList[u];
    } else if(this.calleeList[u]) {
      this.calleeList[u].close();
      delete this.calleeList[u];
    }
  }

};

RoomApp.prototype.close = function() {
  console.log('close method');
  for(caller in this.callerList) {
    var callerObj = this.callerList[caller];
    var pcId = callerObj.pcId;
    callerObj.close();

    delete this.callerList[caller];
    this.model.sendMessage({'type': 'leave', 'from': this.userid, 'to': caller});
    this.model.resetPC(pcId);
  }
  for(callee in this.calleeList) {
    var calleeObj = this.calleeList[callee];
    var pcId = calleeObj.pcId;
    calleeObj.close();
    delete this.calleeList[callee];
    this.model.sendMessage({'type': 'leave', 'from': this.userid, 'to': callee});
    this.model.resetPC(pcId);
  }
  this.model.leave();

  this.model.unlistenMessage();

  $(window).unbind('beforeunload');

  $('#hangup')[0].disabled = true;
  $('#reentry')[0].disabled = false;

  this.model.setOffline();
}

RoomApp.prototype.reEntry = function() {
  this.requestJoinRoom();
  $('#hangup')[0].disabled = false;
  $('#reentry')[0].disabled = true;
}


