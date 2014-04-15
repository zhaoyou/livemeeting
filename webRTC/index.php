<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      video {
        width: 230px;
        height: 170px;
        border: 2px solid #000;
        -webkit-transform: rotateY(180deg);
      }
    </style>
  </head>
  <body>
    <?php
      echo "<input type='hidden' id='user' name='user' value='{$_SERVER['PHP_AUTH_USER']}'>";
    ?>
    <div style="display:inline-block;vertical-align: top;">
      room user list
      <div id="room-list" style="width: 150px;border: 1px solid #666;vertical-align: top;min-height: 200px;"></div>
    </div>

    <div id="container" style="display: inline-block;vertical-align: top;width: 1020px;">
      <video id="self" autoplay></video>
    </div>
    <button onclick="roomApp.close();" id="hangup">Hang Up</button>
    <button onclick="roomApp.reEntry();" disabled id="reentry">ReEntry</button>

    <script type="text/javascript" src="js/jquery-1.9.0.min.js" ></script>
    <script type="text/javascript" src="https://cdn.firebase.com/v0/firebase.js"></script>
    <script type="text/javascript" src="js/adapter.js" ></script>
    <script type="text/javascript" src="js/RoomModel.js" ></script>
    <script type="text/javascript" src="js/RoomApp.js" ></script>
    <script type="text/javascript" src="js/Caller.js" ></script>
    <script type="text/javascript" src="js/Callee.js" ></script>

    <script type="text/javascript">
      var baseRef = new Firebase('https://livemeeting.firebaseio.com/webRTC');

      var userId = $('#user').val().toLowerCase();
      var roomname = 'demo';
      var roomModel = new RoomModel(baseRef, roomname, userId);
      var roomApp = new RoomApp(userId, roomModel, $('#self')[0], $('#container')[0], $('#room-list')[0]);
    </script>
  </body>
</html>
