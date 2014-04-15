var Callee = function (localStream, model, caller, callee, remoteContainer) {

  this.localStream = localStream;
  this.model = model;

  this.caller = caller;
  this.callee = callee;

  this.remoteContainer = remoteContainer;
  this.pcId = 'pc_' + caller + '_' + callee;
  this.servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

  this.sdpConstraints = {'mandatory': {
                        'OfferToReceiveAudio':true,
                        'OfferToReceiveVideo':true }};

  this.init();
}

Callee.prototype.init = function() {

  var that = this;

  // set candidate.
  that.pc = new RTCPeerConnection(that.servers);

  that.pc.addStream(that.localStream);

  that.pc.onicecandidate = function(e) {
    if (e.candidate) {
      that.model.setPC(that.pcId, 'candidate', e.candidate);
      console.log('get callee candidate to caller', e.candidate);
    }
  }

  that.pc.onaddstream = function(e) {
    console.log('receive remote steam');
    that.video = $('<video autoplay></video>')[0];
    that.remoteContainer.appendChild(that.video);
    attachMediaStream(that.video, e.stream);
  }

  that.model.listenPC(that.pcId, that.caller, 'candidate', function(message) {
    var m= {
      candidate: message.candidate,
      sdpMLineIndex: message.sdpMLineIndex,
      sdpMid: message.sdpMid
    }
    this.pc.addIceCandidate(new RTCIceCandidate(m));
    console.log('Receive caller candidate', message);
  }, that);


  that.model.listenPC(that.pcId, that.caller, 'desc', function(message) {
    console.log("Receive Caller description", message);
    that.pc.setRemoteDescription(new RTCSessionDescription(message));
    that.pc.createAnswer(function(desc) {
        that.pc.setLocalDescription(desc);
        that.model.setPC(that.pcId, 'desc', desc);
      }, null, that.sdpConstraints);

  }, that);
}


Callee.prototype.close = function() {
  this.pc.close();
  this.model.unListenPC(this.pcId, this.caller, 'candidate');
  this.model.unListenPC(this.pcId, this.caller, 'desc');
  this.pc = null;
  $(this.video).remove();
}
