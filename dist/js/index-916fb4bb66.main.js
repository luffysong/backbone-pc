/**
 * @project yinyuetai_pc_live_video
 * @description 音悦台直播PC版
 * @version v1.0.0
 * @time 2016-3-5   14:27:4
 * @author icepy
 * @copy http://www.yinyuetai.com
 */
webpackJsonp([1],{0:function(e,n,t){$(function(){var e=t(23);new e;t(26)})},23:function(e,n,t){var i=t(2),o=t(10),r=t(24),c=i.extend({el:"#index",rawLoader:function(){var e=t(25);return e},events:{"click #goto":"gotoHandler"},beforeMount:function(){this.query=o.parseSearch(window.location.search)},afterMount:function(){this.indexTemplate=this.$el.find("#indexTemplate").html(),this.indexModel=new r},ready:function(){var e=this;this.indexModel.execu,te(function(n){e.demoRender()},function(e){})},demoRender:function(){var e=this.indexModel.$get(),n=this.compileHTML(this.indexTemplate,e);this.$el.html(n)},gotoHandler:function(e){window.location.href="http://www.163.com"}});e.exports=c},24:function(e,n,t){var i=t(8),o=i.extend({url:"{{url_prefix}}/mock/index.json",beforeEmit:function(e){}});e.exports=o},25:function(e,n){e.exports='<script type="text/html" id="indexTemplate">\r\n	<h1>{{title}}</h1>\r\n	<ul>\r\n		{{each items as item i}}\r\n			<li>索引{{i+1}}：{{item}}</li>\r\n		{{/each}}\r\n	</ul>\r\n	<button id="goto">跳转到指定的页面</button>\r\n</script>'},26:function(e,n){}});