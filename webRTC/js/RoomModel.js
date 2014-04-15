var RoomModel = function(baseRef, roomname, userId) {
  this.roomRef = baseRef.child(roomname);
  this.userListRef = this.roomRef.child('userList');
  this.pcsRef = this.roomRef.child('pcs');
  this.messageRef = this.roomRef.child('message');
  this.configRef = this.roomRef.child('config');

  this.onlineRef = this.roomRef.child('online');
  this.selfOnlineRef = this.onlineRef.child(userId);
  this.selfOnlineRef.onDisconnect().set(false);


  this.config = {'maxRoomSize': 10};
  this.roomname = roomname;
  this.userId = userId;
  this.userList = [];
  this.alreadyInRoom = false;
  this.init_();
};


RoomModel.prototype.init_ = function() {
  var self = this;
  this.configRef.on('value', function(snapshot) {
    var config = snapshot.val();
    if(config) {
      self.config = config;
    }
  });

  this.onlineRef.on('value', function(snapshot) {
    var onlinelist = snapshot.val();
    if (onlinelist) {
      for (var name in onlinelist) {
        if(onlinelist.hasOwnProperty(name)) {
          if (onlinelist[name] == false) {
            self.sendMessage({
              'type': 'leave',
              'from': name,
              'to': self.userId
            });
          }
        }
      }
    }
  });
};


RoomModel.prototype.requestJoinRoom = function(successCallback, faildCallback, handler) {
  var self = this;
  this.userListRef.transaction(function(userList) {
    if (userList === null) {
      userList = [];
    }
    self.userList = userList;
    for (var i = 0; i < userList.length; i++) {
      if (userList[i] === self.userId) {
        self.alreadyInRoom = true;
        self.myNumber = i;
        return;
      }
    }

    if (i < self.config['maxRoomSize']) {
      userList[i] = self.userId;
      self.myNumber = i;
      self.userList = userList;
      return userList;
    }

    self.myNumber = null;
  }, function (error, committed) {
    console.log(error, committed);
    if (committed) {
      successCallback.call(handler);
    } else {
      faildCallback.call(handler);
    }
  });
};


RoomModel.prototype.listenUserList = function(callback, handler) {
  var self = this;
  this.userListRef.on('value', function(snapshot) {
    var x = snapshot.val();
    if(x) {
      self.userList = x;
      callback.call(handler, self.userList);
    }
  });
};


RoomModel.prototype.listenPC = function(pcId, user, key, callback, handler) {
  var child = pcId + '/' + user + '/' + key;
  this.pcsRef.child(child).on('value', function(snapshot) {
    var value = snapshot.val();
    if(value) {
      console.log(child, value);
      callback.call(handler, value);
    }
  });
};

RoomModel.prototype.unListenPC = function(pcId, user, key) {
  var child = pcId + '/' + user + '/' + key;
  this.pcsRef.child(child).off('value');
};


RoomModel.prototype.setPC = function(pcId, key, value) {
  var child = pcId + '/' + this.userId + '/' + key;
  this.pcsRef.child(child).set(value);
};


RoomModel.prototype.sendMessage = function(data) {
  this.messageRef.push(data);
};


RoomModel.prototype.listenMessage = function(callback, handler) {
  this.messageRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    console.log('message: ', message);
    if(message) {
      callback.call(handler, message);
    }
  });
};

RoomModel.prototype.unlistenMessage = function() {
  this.messageRef.off('child_added');
};


RoomModel.prototype.leave = function() {
  var my = this.userId;
  console.log(this.userList);
  this.userList = $.grep(this.userList, function(u) {
    return u != my;
  });
  console.log(this.userList);
  this.userListRef.set(this.userList);

  this.messageRef.transaction(function(current) {
    delete current;
    return [];
  }, function(error, commited, snapshot) {
    console.log('commited: snapshot', commited, snapshot);
  });
};


RoomModel.prototype.resetPC = function(pcId) {
  this.pcsRef.set({pcId: null});
};

RoomModel.prototype.setOnline = function() {
  this.selfOnlineRef.set(true);
}

RoomModel.prototype.setOffline = function() {
  this.selfOnlineRef.set(false);
}

