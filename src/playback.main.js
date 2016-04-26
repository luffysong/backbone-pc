/**
 * Created by AaronYuan on 3/30/16.
 */

$(function(){
    'use strict';
    var TopbarView = require('./view/topbar/topbar.view');
    new TopbarView();

    var MainView = require('./view/playback/main.view');
    new MainView();

    require('../style/less/live-room.less');
});
