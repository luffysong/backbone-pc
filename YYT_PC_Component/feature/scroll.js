'use strict';
		/*
		**addWheel 		给元素加滚轮事件
		**obj			给谁加事件
		**fn			执行什么函数
		*/
		function addWheel(obj,fn){
			//判断是滚轮的方向
			function fnWheel(ev){
				var bDown=true;//是否往下滚
				//判断用哪个属性
				bDown=ev.wheelDelta?ev.wheelDelta<0:ev.detail>0;
				
				//调用fn这个函数,把方向给传过去   回调函数
				fn&&fn(bDown);
				ev.preventDefault&&ev.preventDefault();
				return false;
			}
			//判断是否是火狐浏览器。加入滚动事件
			if(window.navigator.userAgent.indexOf('Firefox')!=-1){
				$(obj).on('DOMMouseScroll',function(ev){
					var oEvent = ev||event;
					//判断是往上还是往下滚
					fnWheel(oEvent);
				})
			}else{
				obj.onmousewheel=function(ev){
					var oEvent = ev||event;
					//判断是往上还是往下滚
					fnWheel(oEvent);
				}
			}
		}
		/**
		 * 	滚动条拖拽
		 */
		var box = $('.box')[0],
			$scrollerbar = $('.scrollerbar'),
			$scrollerBox = $('.scrollerBox'),
			$con = $('.con'),
			$conView = $con.parent(),
			fatherHeight = $scrollerbar.parent().height(),
			limitBarH = fatherHeight-$scrollerbar.height(),
			limitConH = $con.height()-$conView.height(),
			scale = 0;
		$scrollerbar.mousedown(function  (event) {
			var $this = $(this);
			var disY = $this.position().top-event.pageY;
			var $document = $(document);
			function  move(event) {
				var t = event.pageY+disY;
				if(t<0){
					t=0;
				}else if(t>limitBarH){
					t=limitBarH;
				}
				scale = t/limitBarH;
				$this.css({top:t});
				$con.css({top:-scale*limitConH});
			}
			function up(event) {
				$document.unbind('mousemove', move);
				$document.unbind('mouseup', up);
				move = null;
				up = null;
				event.releaseCapture&&event.releaseCapture();
			}
			$document.bind('mousemove',move);
			$document.bind('mouseup',up);
			event.setCapture&&event.setCapture();
			return false;
		});
		/**
		 * 滚动条点击事件
		 */
		$scrollerbar.click(function (event) {
			event.stopPropagation()
		});
		$scrollerBox.click(function(event) {
			var $self = $(this),
				barH = $scrollerbar.height(),
				barTop = event.offsetY - $scrollerbar.height()/2;
			if(barTop<0){
				barTop = 0;
			}else if(barTop >= limitBarH){
				barTop = limitBarH;
			}
			$scrollerbar.css({ top : barTop});
			scale = barTop/limitBarH;
			$con.css({top:-scale*limitConH});
		});
		addWheel(box,function  (bDown) {
			var t = $scrollerbar.position().top;
			if(bDown){
				t+=50;
			}else{
				t-=50;
			}
			if(t<0){
					t=0;
				}else if(t>limitBarH){
					t=limitBarH;
				}
			scale = t/limitBarH;
			$scrollerbar.stop().animate({top:t});
			$con.stop().animate({top:-scale*limitConH},'easeout');
		});