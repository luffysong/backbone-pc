/**
 * Created by AaronYuan on 4/26/16.
 */
$(function(){
  'use strict';
  var TopbarView = require('./view/topbar/topbar.view');
  new TopbarView();

  var MainView = require('./view/playback/list.view');
  new MainView();

  require('../style/less/playbacklist.less');
});