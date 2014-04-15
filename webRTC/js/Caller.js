var Caller = function(model, localStream, callerName, calleeName, container) {
  this.model = model;
  this.localStream = localStream;
  this.callerName = callerName;
  this.calleeName = calleeName;
  this.pcId = 'pc_' + callerName + '_' + calleeName;
  this.container = container;

  this.servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
  this.init_();
};


Caller.prototype.init_= function() {
  var self = this;
  this.pc = new RTCPeerConnection(this.servers);
  this.pc.addStream(this.localStream);
  this.pc.onicecandidate = function(e) {
    if(e.candidate) {
      console.log('on ice candidate: ', e.candidate);
      self.model.setPC(self.pcId, 'candidate', e.candidate);
    }
  };
  this.pc.onaddstream = function(e) {
    console.log('on add stream: ', e.stream);
    self.remoteStream = e.stream;
    self.video = $('<video autoplay></video>')[0];
    self.container.appendChild(self.video);
    attachMediaStream(self.video, e.stream);
  };

  this.pc.createOffer(function(desc) {
    self.pc.setLocalDescription(desc);
    self.model.setPC(self.pcId, 'desc', desc);
  });

  this.listen();
};


Caller.prototype.listen = function() {
  var self = this;
  this.model.listenPC(this.pcId, this.calleeName, 'candidate', function(candidate) {
    this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }, this);

  this.model.listenPC(this.pcId, this.calleeName, 'desc', function(desc) {
    this.pc.setRemoteDescription(new RTCSessionDescription(desc));
  }, this);
};


Caller.prototype.unListen = function() {
  this.model.unListenPC(this.pcId, this.calleeName, 'candidate');
  this.model.unListenPC(this.pcId, this.calleeName, 'desc');
};


Caller.prototype.close = function() {
  this.pc.close();
  this.unListen();
  this.pc = null;
  $(this.video).remove();
}
