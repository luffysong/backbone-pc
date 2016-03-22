/**
 *
 * Created by AaronYuan on 3/11/16.
 * 公用函数
 */

model.exports = Tools = {

  /**
   * 从URL中解析queryString
   * @param name
   * @returns {null}
   */
  getQueryString: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)return unescape(r[2]);
    return null;
  }


};


