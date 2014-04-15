var SlideMasterApp = function(elementId, model, width, height) {
  this.model = model;
  this.width = width;
  this.height = height;
  this.pdfDoc = null;
  this.scale = 0.8;
  this.canvas = document.getElementById(elementId);
  this.ctx = this.canvas.getContext('2d');
  this.init();
}


SlideMasterApp.prototype.init = function() {
  var that = this;
  PDFJS.disableWorker = true;

  this.model.baseRef.once('value', function(snapshot){
    var pdfMessage = snapshot.val();
    if (pdfMessage) {
      that.url = pdfMessage.url;
      that.pageNum = pdfMessage.pageNum;
      // init pdf.
      PDFJS.getDocument(that.url).then(function(_pdfDoc){
        that.pdfDoc = _pdfDoc;
        that.renderPage();
        that.model.addListener(that.update, that);
      });
    }
  });

};


SlideMasterApp.prototype.update = function(pdfMessage) {
  var that = this;
  // the same pdf url.
  if (this.url == pdfMessage.url) {
    this.pageNum = pdfMessage.pageNum;
    this.renderPage();
  } else {
    this.url = pdfMessage.url;
    this.pageNum = pdfMessage.pageNum;

    PDFJS.getDocument(that.url).then(function(_pdfDoc){
      that.pdfDoc = _pdfDoc;
      that.renderPage();
    });
  }
};

SlideMasterApp.prototype.renderPage = function() {
  var that = this;
  this.pdfDoc.getPage(that.pageNum).then(function(page) {
    var viewport = page.getViewport(that.scale);
    that.canvas.height = viewport.height;
    that.canvas.width = viewport.width;

    // reader pdf page into canvas context.
    var renderContext = {
      'canvasContext': that.ctx,
      'viewport': viewport
    };
    page.render(renderContext);
  });
  // update display counter.
  document.getElementById('page_num').innerText  = that.pageNum;
  document.getElementById('page_count').innerText = that.pdfDoc.numPages;
};


SlideMasterApp.prototype.goPrev = function() {
  if (this.pageNum <=1 ) {
    return;
  }
  this.pageNum--;
  this.model.change({
    'pageNum': this.pageNum,
    'url': this.url
  });
}

SlideMasterApp.prototype.goNext = function() {
  if (this.pageNum >= this.pdfDoc.numPages ) {
    return;
  }
  this.pageNum++
  this.model.change({
    'pageNum': this.pageNum,
    'url': this.url
  });
}

SlideMasterApp.prototype.changeSlideUrl = function() {
  var slideUrl = document.getElementById('slideurl');
  if (slideUrl) {
    if (slideUrl.value.trim() != '') {
      this.model.change({
        'pageNum': 1,
        'url': slideUrl.value.trim()
      });

      document.getElementById('changeSlideStatus').innerHTML = 'Changed';
      window.setTimeout(function() {
        document.getElementById('changeSlideStatus').innerHTML = '';
      }, 500);
    }
  }
}

