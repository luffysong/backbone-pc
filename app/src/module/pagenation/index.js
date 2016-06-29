/**
基于分页控件，封装通用部分
*/

var $ = require('jquery');

var pagenation = {
  /*
  ops = {
    total: 总页数,
    perpage: 每页条数,
    onSelect: function(page){}
  }
  */
  create: function (el, ops) {
    var setting = $.extend({
      total: 1,
      perpage: 10,
      onSelect: null,
      change: null
    }, ops);
    return $(el).change(function () {
      if (setting.change) {
        setting.change();
      }
    }).paging(setting.total, {
      format: '[ < .(qq -) nncnn (- pp)> ] ',
      page: 1,
      perpage: setting.perpage,
      onFormat: function (type) {
        switch (type) {
          case 'block':
            if (!this.active) {
              return '<span>' + this.value + '</span>';
            } else if (this.value !== this.page) {
              return '<a href="#' + this.value + '">' + this.value + '</a>';
            }
            return '<span class="current ">' + this.value + '</span>';
          case 'next':
            if (this.active) {
              return '<a href="#' + this.value + '" class="next icons paging-right"></a>';
            }
            return '<span style="cursor:no-drop" class="icons paging-right" ></span>';
          case 'prev':
            if (this.active) {
              return '<a href="#' + this.value + '" class="prev icons paging-left"></a>';
            }
            return '<span style="cursor:no-drop" class="icons paging-left"></span>';
          case 'fill':
            if (this.active) {
              return '<span>...</span>';
            }
            return '';
          default:
            return '';
        }
      },
      onSelect: function (page) {
        if (setting.onSelect && this.isFinished) {
          setting.onSelect(page);
        }
      }
    });
  }
};

module.exports = {
  create: pagenation.create
};
