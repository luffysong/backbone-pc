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
      onSelect: null
    }, ops);
    return $(el).paging(setting.total, {
      format: '[ < .(qq -) nncnn (- pp)> ] ',
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
              return '<a href="#' + this.value + '" class="next ">&gt;</a>';
            }
            return '<span>&gt;</span>';
          case 'prev':
            if (this.active) {
              return '<a href="#' + this.value + '" class="prev ">&lt;</a>';
            }
            return '<span>&lt;</span>';
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
        if (setting.onSelect) {
          setting.onSelect(page);
        }
      }
    });
  }
};

module.exports = {
  create: pagenation.create
};
