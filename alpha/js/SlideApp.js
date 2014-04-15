var SlideApp = function(element, model, width, height) {
  this.container = element;
  this.model = model;
  this.width = width;
  this.height = height;
  this.pdfDoc = null;
  this.scale = 1;

  this.canvas = this.getElem('the-canvas');
  this.ctx = this.canvas.getContext('2d');

  this.canvas_alter = this.getElem('the-canvas-alter');
  this.ctx_alter = this.canvas_alter.getContext('2d');

  this.canvas_flag = true;
  this.isSync = true;
  this.init();
}


SlideApp.prototype.init = function() {
  var that = this;

  that.initLoadingSlide();

  // read default pdf url once.
  this.model.baseRef.once('value', function(snapshot) {
    var pdfMessage = snapshot.val();
    if (pdfMessage) {
      that.url = pdfMessage.url;
      that.slideChangeUrl = that.url;

      that.pageNum = pdfMessage.pageNum;
      that.localPageNum = that.pageNum;
      that.currentPageNum = that.pageNum;
      // init pdf.
      PDFJS.getDocument(that.url).then(function(_pdfDoc){
        that.pdfDoc = _pdfDoc;
        // get slide origin size height/width.
        that.getOriginSlideSize(function() {
          that.doRenderPage(that.pageNum);
          that.model.addListener(that.update, that);
        });
      });
    }
  });
};

// show loading message.
SlideApp.prototype.initLoadingSlide = function() {
  this.ctx.font="30px Arial";
  this.ctx.fillText("Slide Loading ...",10,50);
}

SlideApp.prototype.initHtmlElement = function() {
  // TODO (zhaoyou) render html element.
}

SlideApp.prototype.getElem = function(id) {
  return document.getElementById(id);
}

SlideApp.prototype.setValue = function(id, value) {
  this.getElem(id).innerHTML = value;
}

//renderPage before handler.
SlideApp.prototype.doRenderPage = function(pageNum) {
  this.currentPageNum = pageNum;
  this.renderPage();
}

// for master slide page change.
SlideApp.prototype.update = function(pdfMessage) {
  var that = this;
  // the same pdf url.
  if (this.url == pdfMessage.url) {
    this.pageNum = pdfMessage.pageNum;

    if (this.isSync) {
      this.localPageNum = this.pageNum;
      this.doRenderPage(this.pageNum);
    } else {
      // show master status.
      this.displayMasterStatus(true);
    }
  } else {
    this.slideChangeUrl = pdfMessage.url;
    this.pageNum = pdfMessage.pageNum;

    if (this.isSync) {
      this.localPageNum = pdfMessage.pageNum;
      this.url = pdfMessage.url;

      PDFJS.getDocument(this.url).then(function(_pdfDoc){
        that.pdfDoc = _pdfDoc;
        that.getOriginSlideSize(function() {
          that.doRenderPage(that.pageNum);
        });
      });
    } else {
      // notice user master change slide already.
      //this.getElem('masterStatus').style.display = 'inline';
      this.getElem('sync-container').style.display = 'block';
      //this.setValue('masterStatus', 'Master slide changed');
    }
  }
};

// render canvas.
SlideApp.prototype.renderPage = function() {

  var that = this;
  var pageNum = this.currentPageNum;

  // counter for debug.
  that.setValue('local_page_num', pageNum);
  that.setValue('local_page_count', that.pdfDoc.numPages);

  if (this.isRending_) {
    return;
  }

  this.isRending_ = true;
  this.currentRenderedPageNum_ = pageNum;
  that.pdfDoc.getPage(pageNum).then(function(page) {
    var viewport = page.getViewport(that.scale);

    var renderContext = that.getRenderContext(viewport);

    page.render(renderContext).then(function() {
      that.isRending_ = false;
      if (that.currentRenderedPageNum_ != that.currentPageNum) {
        setTimeout(function() {
          that.renderPage();
        }, 0);
      }

      // alter canvas object.
      that.alterCanvas(that.canvas_flag);
    });
  });
};

// get slide origin size (scale is 1).
SlideApp.prototype.getOriginSlideSize = function(callback) {
  var that = this;
  this.pdfDoc.getPage(1).then(function(page){
    var viewport = page.getViewport(1);
    that.slide_width = viewport.width;
    that.slide_height = viewport.height;
    that.scale = that.optimizeScale(that.slide_height, that.slide_width);
    callback();
  });
}

// get optimizeScala by Origin Slide size and pdf-box size.
SlideApp.prototype.optimizeScale = function(height_, width_) {
  if (height_ > this.height || width_ > this.width) {
    var height_zoomOut = (height_ - this.height) / height_;
    var width_zoomOut = (width_ - this.width) /  width_;
    if (height_zoomOut > width_zoomOut) {
      this.getCanvasContainer().style['padding-top'] = 0;
      return 1 - height_zoomOut;
    } else {
      var marginTop = (this.height - height_ * (1 -width_zoomOut)) / 2;
      this.getCanvasContainer().style['padding-top'] = marginTop + 'px';
      return 1 - width_zoomOut;
    }
  } else {
    var height_zoomIn = (this.height -  height_) / height_;
    var width_zoomIn = (this.width - width_) / width_;

    if (height_zoomIn > width_zoomIn) {
      var marginTop = (this.height - (height_ * (1 + width_zoomIn))) / 2;
      this.getCanvasContainer().style['padding-top'] = marginTop + 'px';
      return 1 + width_zoomIn;
    } else {
      this.getCanvasContainer().style['padding-top'] = 0;
      return 1 + height_zoomIn;
    }
  }
}

// get pdf-box container.
SlideApp.prototype.getCanvasContainer = function() {
  return document.getElementsByClassName('pdf-box')[0];
}


// get canvas RenderContext.
SlideApp.prototype.getRenderContext = function(viewport) {
  this.canvas.height = viewport.height;
  this.canvas.width = viewport.width;
  this.canvas_alter.height = viewport.height;
  this.canvas_alter.width = viewport.width;

  // reader pdf page into canvas context.
  return {
    'canvasContext': this.canvas_flag ? this.ctx : this.ctx_alter,
    'viewport': viewport
  };

}

// drawed canvas  page instead of prev page.
SlideApp.prototype.alterCanvas = function(canvas_flag) {
  this.canvas.style.display = canvas_flag ? 'inline' : 'none';
  this.canvas_alter.style.display = canvas_flag ? 'none' : 'inline';
  this.canvas_flag = !canvas_flag;
}


// for local.


SlideApp.prototype.displayMasterStatus = function(isShow) {
  if (isShow) {
    //this.getElem('masterStatus').style.display = 'inline';
    this.getElem('sync-container').style.display = 'block';
    //if (this.url == this.slideChangeUrl) {
    //  this.setValue('masterStatus', 'Master Page:  ' + this.pageNum + '/ ' + this.pdfDoc.numPages);
    //} else {
    //  this.setValue('masterStatus', 'Master slide changed');
    //}
  } else {
    //this.getElem('masterStatus').style.display = 'none';
    this.getElem('sync-container').style.display = 'none';
    //this.setValue('masterStatus', '');
  }
};

SlideApp.prototype.goPrev = function() {
  if (this.localPageNum <=1 ) {
    return;
  }
  this.isSync = false;
  this.localPageNum--;

  this.doRenderPage(this.localPageNum);
  this.displayMasterStatus(true);
};

SlideApp.prototype.goNext = function() {
  if (this.localPageNum >= this.pdfDoc.numPages ) {
    return;
  }
  this.isSync = false;
  this.localPageNum++
  this.doRenderPage(this.localPageNum);
  this.displayMasterStatus(true);
};

SlideApp.prototype.syncMaster = function() {
  this.isSync = true;
  this.update({
    'pageNum': this.pageNum,
    'url': this.slideChangeUrl
  });
  this.displayMasterStatus(false);
};


SlideApp.prototype.launchFullScreen = function() {
  if(this.container.requestFullScreen) {
    this.container.requestFullScreen();
  } else if(this.container.mozRequestFullScreen) {
    this.container.mozRequestFullScreen();
  } else if(this.container.webkitRequestFullScreen) {
    this.container.webkitRequestFullScreen();
  }
}

SlideApp.prototype.cancelFullscreen = function() {
  if(document.cancelFullScreen) {
    document.cancelFullScreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
}

SlideApp.prototype.isFullscreen = function() {
  return !(
    !document.fullscreenElement &&
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement
  );
}

SlideApp.prototype.fullscreenChange = function(e) {
  var that = e.data.slide;
  that.getElem('enter-fullscreen').style.display = that.isFullscreen() ? 'none' : 'inline-block';
  that.getElem('exit-fullscreen').style.display = that.isFullscreen() ? 'inline-block' : 'none';

  if (e.target == e.data.slide.container) {
    // TODO (zhaoyou) fullscreen change CanvasContainer can't get right offset right now.
    console.log("fullscreen: ",  that.isFullscreen());
    window.setTimeout(function() {
      that.height = that.getCanvasContainer().offsetHeight;
      that.width = that.getCanvasContainer().offsetWidth;
      that.scale = that.optimizeScale(that.slide_height, that.slide_width);
      that.doRenderPage(that.currentPageNum);
    }, 100);
  }
}

