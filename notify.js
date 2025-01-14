/**
 *auth: liuyu 4654081@qq.com
 *Date: 2024/5/27
 *Desc: 消息提示插件-支持自定义位置显示
 **/
 "use strict";

 function _typeof(obj) {
     "@babel/helpers - typeof";
     if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
         _typeof = function _typeof(obj) {
             return typeof obj;
         };
     } else {
         _typeof = function _typeof(obj) {
             return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
         };
     }
     return _typeof(obj);
 }
 
 !function (global, factory) {
     (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = global || self, global.notify = factory());
 }(void 0, function () {
     "use strict";
 
 
     function c(args, children) {
         var el = document.createElement("div");
 
         for (var key in args) {
             var element = args[key];
 
             if (key === "className") {
                 key = "class";
                 el.setAttribute(key, element);
             } else if (key[0] === "_") {
                 el.addEventListener(key.slice(1), element);
             }
         }
         if (typeof children == "string") {
             el.innerHTML = children;
         } else if (_typeof(children) === "object" && children.tagName) {
             el.appendChild(children);
         } else if (children) {
             for (var i = 0; i < children.length; i++) {
                 var child = children[i];
                 el.appendChild(child);
             }
         }
 
         return el;
     }
 
     function addAnimationEnd(el, fn) {
         ["a", "webkitA"].forEach(function (prefix) {
             var name = prefix + "nimationEnd";
             el.addEventListener(name, function () {
                 fn();
             });
         });
     }
 
     function css(el, css) {
         for (var key in css) {
             el.style[key] = css[key];
         }
 
         if (el.getAttribute("style") === "") {
             el.removeAttribute("style");
         }
     }
 
     function addClass(el, s) {
         var c = el.className || "";
 
         if (!hasClass(c, s)) {
             var arr = c.split(/\s+/);
             arr.push(s);
             el.className = arr.join(" ");
         }
     }
 
     function hasClass(c, s) {
         return c.indexOf(s) > -1 ? !0 : !1;
     }
 
     function removeClass(el, s) {
         var c = el.className || "";
 
         if (hasClass(c, s)) {
             var arr = c.split(/\s+/);
             var i = arr.indexOf(s);
             arr.splice(i, 1);
             el.className = arr.join(" ");
         }
 
         if (el.className === "") {
             el.removeAttribute("class");
         }
     }
 
     var initArgs = {
         elem:"body",           // 默认显示在body,可以指定class或id
         msg: "",               // 消息内容
         closable: true,        // 是否显示可关闭按钮
         duration: 3000,        // 默认3秒关闭
         position: 'topCenter', // 显示位置 bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, vcenter
         shadow:false           // 是否显示遮罩
     };
     var positionB=['bottomLeft','bottomCenter','bottomRight'];
     var notify = {
         info: function info() {
             return initConfig(arguments, "info");
         },
         success: function success() {
             return initConfig(arguments, "success");
         },
         warning: function warning() {
             return initConfig(arguments, "warning");
         },
         error: function error() {
             return initConfig(arguments, "error");
         },
         loading: function loading() {
             let el=initConfig(arguments, "loading");
             el.value=function(n) {//百分比数
                 //console.log(typeof n)
                 if (typeof n === 'number') { // 确保传入的是字符串
                     el.querySelector(".notify-msg-text").innerHTML = n+"%";
                     if(n===100){
                         el.querySelector(".notify-msg-icon").innerHTML = getIconObj().success;
                         el.querySelector(".notify-msg-loading").classList.add("notify-msg-success");
                         el.querySelector(".notify-msg-loading").classList.remove("notify-msg-loading");
 
                     }
                 }
 
             }
             return el;
 
         },
         alert: function loading() {
            return initConfig(arguments, "alert");
         },
         confirm: function loading() {
            return initConfig(arguments, "confirm");
         },
         close:function(element){
             if (element && element.nodeType === Node.ELEMENT_NODE) {
                 var parent = element.parentNode;
                 closeMsg(element, '', parent);
             } else {
                 console.warn('传入的参数不是一个有效的DOM元素');
             }
         },
         destroyAll: function destroyAll() {
             _destroyAll();
         },
         config: function config(obj) {
             for (var key in obj) {
                 if (Object.hasOwnProperty.call(obj, key)) {
                     if (obj[key] !== undefined) {
                         initArgs[key] = obj[key];
                     }
                 }
             }
         }
     };
 
     function initConfig(obj, type) {
         var args = {};
         for (var key in initArgs) {
             args[key] = initArgs[key];
         }
        if (typeof obj[0] == "string") {
            args.msg = obj[0];
        }
        if(typeof obj[0] == "object"){
            for (var prop in obj[0]) {
                if (Object.hasOwnProperty.call(obj[0], prop)) {
                    args[prop] = obj[0][prop];
                }
            }
        }
        if(typeof obj[1] == "function"){
            args.onClose = obj[1];
        }
 
         args.type = type;
         return createMsgEl(args);
     }
 
     var msgWrappers = new Array();
 
     function createMsgEl(args) {
         var _msgWrapper;
         var type = args.type,
             elem = args.elem,
             duration = args.duration,
             msg = args.msg,
             position = args.position,
             closable = args.closable,
             shadow = args.shadow,
             onClose = args.onClose;
         var iconObj = getIconObj();
 
         if (document.getElementsByClassName(position)[0]) {
             _msgWrapper = document.getElementsByClassName(position)[0];
         } else {
             _msgWrapper = c({
                 className: "notify-msg-stage " + position
             });
             msgWrappers.push(_msgWrapper);
         }
 
 
         if (type === "loading") {
             msg = msg === '' ? '正在加载，请稍后... <span class="notify-msg-text"></span>' : msg + ' <span class="notify-msg-text"></span>';
             //closable = false; //loading不显示关闭按钮
         }
 
 
         var el,an;
 
         if(positionB.indexOf(position)!==-1){
             if(type==="alert" || type ==="confirm"){
                 an="bounceIn";
             }else{
                 an="notify-bottom notify-msg-fade-in-b";
             }
             el = c({
                 className: "notify-msg-wrapper"
             }, [c({
                 className: "notify-msg " + an + " notify-msg-" + type
             }, [c({
                 className: "notify-msg-icon"
             }, iconObj[type]), c({
                 className: "notify-msg-content"
             }, msg), c({
                 className: "notify-msg-wait " + (closable ? "notify-msg-pointer" : ""),
                 _click: function _click() {
                     if (closable) {
                         closeFlag = true; //点击关闭按钮标志
                         flag = false; //正常关闭标志
                         closeMsg(el, onClose, _msgWrapper,shadow);
                     }
                 }
             }, getMsgRight(closable,type))])]);
         }else{
             if(type==="alert" || type ==="confirm"){
                 an="bounceIn";
             }else{
                 an="notify-msg-fade-in";
             }
             el = c({
                 className: "notify-msg-wrapper"
             }, [c({
                 className: "notify-msg " + an + " notify-msg-" + type
             }, [c({
                 className: "notify-msg-icon"
             }, iconObj[type]), c({
                 className: "notify-msg-content"
             }, msg), c({
                 className: "notify-msg-wait " + (closable ? "notify-msg-pointer" : ""),
                 _click: function _click() {
                     if (closable) {
                         closeFlag = true; //点击关闭按钮标志
                         flag = false; //正常关闭标志
                         closeMsg(el, onClose, _msgWrapper,shadow);
                     }
                 }
             }, getMsgRight(closable,type))])]);
         }
 
         var anm = el.querySelector(".notify-msg-circle");
 
         if (anm) {
             css(anm, {
                 animation: "notify-msg_" + type + " " + duration + "ms linear"
             });
 
             if ("onanimationend" in window) {
                 addAnimationEnd(anm, function () {
                     closeMsg(el, onClose, _msgWrapper,shadow);
                 });
             } else {
                 setTimeout(function () {
                     closeMsg(el, onClose, _msgWrapper,shadow);
                 }, duration);
             }
         }
 
         if (type !== "loading" && type !== "alert" && type !== "confirm" && duration != 0) {
             setTimeout(function () {
                 closeMsg(el, onClose, _msgWrapper,shadow);
             }, duration);
         }
         //遮罩
         if(shadow &&!document.querySelector(".notify-modal")){
             var shadenode=document.createElement("div");
             if(shadow){
                 shadenode.className="notify-modal";
             }else{
                 shadenode.className="notify-modal notify-none";
             }
 
             document.querySelector("body").appendChild(shadenode);
         }
         if (!_msgWrapper.children.length) {
             if(elem!=="body"){
                 var _pos=getComputedStyle(document.querySelector(elem)).position;
                 if(_pos==="static"||_pos===""){
                     document.querySelector(elem).style.position="relative";
                     document.querySelector(elem).style.overflow = "hidden";
                 }
 
                 _msgWrapper.style.position = "absolute";
             }else{
                 _msgWrapper.style.position = "fixed";
             }
             document.querySelector(elem).appendChild(_msgWrapper);
         }
         _msgWrapper.appendChild(el);
         if(type==="confirm"){
             var btnCancel=document.createElement("button");
             var textNode=document.createTextNode("取 消");
             btnCancel.appendChild(textNode);
             btnCancel.className="btnCancel";
             btnCancel.onclick=function(){
                 closeMsg(el,'', _msgWrapper,shadow);
 
             }
             document.querySelector(".notify-msg-confirm").appendChild(btnCancel);
 
         }
         css(el, {
             height: el.offsetHeight + "px"
         });
         setTimeout(function () {
             if(positionB.indexOf(position)!==-1){
                 removeClass(el.children[0], "notify-msg-fade-in-b");
             }else{
                 removeClass(el.children[0], "notify-msg-fade-in");
             }
 
         }, 300);
         /*
         if (type === "loading") {
             return function () {
                 closeMsg(el, onClose, _msgWrapper,shadow);
             };
         }*/
         return el;
         //return {el:el,msgWrapper:_msgWrapper,shadow:shadow};
     }
 
     function getMsgRight(closable,type) {
         if (closable) {
             if(type==="alert" || type==="confirm"){
                 return '<button type="button" class="btnOk">确 定</button>'
             }else{
                 return '\n    <svg class="notify-msg-close" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="551"><path d="M810 274l-238 238 238 238-60 60-238-238-238 238-60-60 238-238-238-238 60-60 238 238 238-238z" p-id="5515"></path></svg>\n    ';
             }
         }
     }
 
     var flag = true; //正常关闭标志
     var closeFlag = false;//点击关闭按钮标志
 
     function closeMsg(el, cb, _msgWrapper,shadow) {
         if (!el) return;
         if(hasClass(el.children[0].className,"notify-bottom")){
             addClass(el.children[0], "notify-msg-fade-out-b");
         }else if(hasClass(el.children[0].className,"bounceIn")){
             addClass(el.children[0], "bounceOut");
         }else{
             addClass(el.children[0], "notify-msg-fade-out");
         }
 
         if(shadow && document.querySelector(".notify-modal")){
             document.querySelector("body").removeChild(document.querySelector(".notify-modal"));
         }
 
 
         if (closeFlag) { //点击关闭按钮
             closeFlag = false;
             cb && cb(); //回调方法
         } else {
             if (flag) {//正常关闭，全局变量
                 cb && cb();
             } else {
                 flag = true
                 // return;
             }
         }
 
         setTimeout(function () {
 
             if (!el) return;
             var has = false;
             if (_msgWrapper) {
                 for (var i = 0; i < _msgWrapper.children.length; i++) {
                     if (_msgWrapper.children[i] && _msgWrapper.children[i] === el) {
                         has = true;
                     }
                 }
                 has && removeChild(el);
                 el = null;
 
                 if (!_msgWrapper.children.length) {
                     has && removeChild(_msgWrapper);
                 }
 
             }
 
         }, 300);
     }
 
     function getIconObj() {
         return {
             info: '\n    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#1677ff" d="M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64m67.2 275.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344M590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.992 12.992 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z"></path></svg>\n    ',
             success: '\n    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#52c41a" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"></path></svg>\n    ',
             warning: '\n    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#faad14" d="M1011.982 842.518 606.673 140.565c-49.575-85.822-130.595-85.822-180.157 0L21.205 842.518c-49.562 85.91-9.015 155.99 90.04 155.99l810.693 0C1020.997 998.507 1061.502 928.423 1011.982 842.518zM460.924 339.737c14.565-15.747 33.082-23.622 55.665-23.622 22.595 0 41.095 7.792 55.675 23.307 14.485 15.55 21.725 34.997 21.725 58.382 0 20.12-30.235 168.07-40.32 275.704l-72.825 0c-8.845-107.635-41.652-255.584-41.652-275.704C439.194 374.774 446.446 355.407 460.924 339.737zM571.244 851.538c-15.32 14.92-33.55 22.355-54.65 22.355-21.095 0-39.33-7.435-54.647-22.355-15.275-14.885-22.867-32.915-22.867-54.09 0-21.065 7.592-39.29 22.867-54.565 15.317-15.28 33.552-22.92 54.647-22.92 21.1 0 39.33 7.64 54.65 22.92 15.265 15.275 22.875 33.5 22.875 54.565C594.119 818.623 586.509 836.653 571.244 851.538z"></path></svg>\n    ',
             error: '\n    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#ff4d4f" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"></path></svg>\n    ',
             loading: '\n    <div class=\"notify-msg-loading\">\n    <svg class="notify-msg-circular" viewBox="25 25 50 50">\n      <circle class="notify-msg-path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/>\n    </svg>\n    </div>\n    '
         };
     }
 
     function removeChild(el) {
         el && el.parentNode.removeChild(el);
     }
 
     function _destroyAll() {
         for (var j = 0; j < msgWrappers.length; j++) {
             for (var i = 0; i < msgWrappers[j].children.length; i++) {
                 var element = msgWrappers[j].children[i];
                 closeMsg(element, '', msgWrappers[j]);
             }
         }
     }
 
     window.addEventListener('DOMContentLoaded', function () {
         insertCssInHead();
     });
 
     function insertCssInHead() {
         var doc = document;
 
         if (doc && doc.head) {
             var head = doc.head;
 
             var _css = doc.createElement('style');
 
             var cssStr = "\n\n[class|=notify],[class|=notify]::after,[class|=notify]::before{box-sizing:border-box;outline:0}.notify-msg-progress{width:13px;height:13px}.notify-msg-circle{stroke-width:2;stroke-linecap:square;fill:none;transform:rotate(-90deg);transform-origin:center}.notify-msg-stage:hover .notify-msg__circle{-webkit-animation-play-state:paused!important;animation-play-state:paused!important}.notify-msg__background{stroke-width:2;fill:none}.notify-msg-stage{position:fixed;width:auto;z-index:99891015}.topLeft{top:20px;left:20px}.topCenter{top:20px;left:50%;transform:translate(-50%,0)}.topRight{top:20px;right:20px}.bottomLeft{bottom:20px;left:20px}.bottomCenter{bottom:20px;left:50%;transform:translate(-50%,0)}.bottomRight{bottom:20px;right:20px}.vcenter{top:50%;left:50%;transform:translate(-50%,-50%)}.notify-msg-wrapper{position:relative;left:50%;transform:translate(-50%,0);transform:translate3d(-50%,0,0);transition:height .3s ease,padding .3s ease;padding:6px 0;will-change:transform,opacity}.notify-msg{padding:15px 21px;border-radius:3px;position:relative;left:50%;transform:translate(-50%,0);transform:translate3d(-50%,0,0);display:flex;align-items:center}.notify-msg-content,.notify-msg-icon,.notify-msg-wait{display:inline-block}.notify-msg-icon{position:relative;width:18px;height:18px;border-radius:100%;display:flex;justify-content:center;align-items:center}.notify-msg-icon svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px}.notify-msg-wait{width:20px;height:20px;position:relative;fill:#4eb127}.notify-msg-wait svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}.notify-msg-close{width:14px;height:14px}.notify-msg-content{margin:0 10px;min-width:240px;text-align:left;font-size:14px;font-weight:500;font-family:-apple-system,Microsoft Yahei,sans-serif;text-shadow:0 0 1px rgba(0,0,0,.01)}.notify-msg.notify-msg-info{color:#0c5460;background-color:#e6f4ff;box-shadow:0 0 2px 0 rgba(0,1,1,.01),0 0 0 1px #91caff}.notify-msg.notify-msg-info .notify-msg-icon{background-color:#ffffff}.notify-msg.notify-msg-success{color:#155724;background-color:#f6ffed;box-shadow:0 0 2px 0 rgba(0,1,0,.01),0 0 0 1px #b7eb8f}.notify-msg.notify-msg-success .notify-msg-icon{background-color:#ffffff}.notify-msg.notify-msg-warning{color:#856404;background-color:#fffbe6;box-shadow:0 0 2px 0 rgba(1,1,0,.01),0 0 0 1px #ffe58f}.notify-msg.notify-msg-warning .notify-msg-icon{background-color:#ffffff}.notify-msg.notify-msg-error{color:#721c24;background-color:#fff2f0;box-shadow:0 0 2px 0 rgba(1,0,0,.01),0 0 0 1px #ffccc7}.notify-msg.notify-msg-error .notify-msg-icon{background-color:#ffffff}.notify-msg.notify-msg-loading{color:#0fafad;background-color:#e7fdfc;box-shadow:0 0 2px 0 rgba(0,1,1,.01),0 0 0 1px #c2faf9}/*.notify-msg-loading{flex-shrink:0;width:20px;height:20px;position:relative}*/.notify-msg-circular{-webkit-animation:notify-msg-rotate 2s linear infinite both;animation:notify-msg-rotate 2s linear infinite both;transform-origin:center center;height:18px!important;width:18px!important}.notify-msg-path{stroke-dasharray:1,200;stroke-dashoffset:0;stroke:#0fafad;-webkit-animation:notify-msg-dash 1.5s ease-in-out infinite;animation:notify-msg-dash 1.5s ease-in-out infinite;stroke-linecap:round}@-webkit-keyframes notify-msg-rotate{100%{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes notify-msg-rotate{100%{transform:translate(-50%,-50%) rotate(360deg)}}@-webkit-keyframes notify-msg-dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35px}100%{stroke-dasharray:89,200;stroke-dashoffset:-124px}}@keyframes notify-msg-dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35px}100%{stroke-dasharray:89,200;stroke-dashoffset:-124px}}.notify-msg.notify-msg-info .notify-msg-wait{fill:#0fafad}.notify-msg.notify-msg-success .notify-msg-wait{fill:#4ebb23}.notify-msg.notify-msg-warning .notify-msg-wait{fill:#f1b306}.notify-msg.notify-msg-error .notify-msg-wait{fill:#f34b51}.notify-msg.notify-msg-loading .notify-msg-wait{fill:#0fafad}.notify-msg.notify-msg-alert .notify-msg-wait{fill:#999}.notify-msg.notify-msg-alert .notify-msg-content,.notify-msg.notify-msg-confirm .notify-msg-content{font-size:18px}.notify-msg.notify-msg-alert .notify-msg-wait{display:block;width:100px;height:auto;margin:auto;margin-top:30px}.notify-msg.notify-msg-confirm .notify-msg-wait{display:inline-block;width:100px;height:auto;margin:auto}.notify-msg.notify-msg-confirm .notify-msg-content{display:block;margin-bottom:30px}.notify-msg.notify-msg-alert .notify-msg-wait .btnOk,.notify-msg.notify-msg-confirm .notify-msg-wait .btnOk{line-height:30px;border-radius:4px;background-color:#0069d9;border:1px solid #0062cc;color:#fff;width:100px;cursor:pointer}.notify-msg.notify-msg-confirm .btnCancel{line-height:30px;border-radius:4px;background-color:#fff;border:1px solid #ddd;color:#666;width:100px;cursor:pointer;margin-left:6px}.notify-msg-pointer{cursor:pointer}@-webkit-keyframes notify-msg_info{0%{stroke:#0fafad}to{stroke:#0fafad;stroke-dasharray:0 100}}@keyframes notify-msg_info{0%{stroke:#0fafad}to{stroke:#0fafad;stroke-dasharray:0 100}}@-webkit-keyframes notify-msg_success{0%{stroke:#4eb127}to{stroke:#4eb127;stroke-dasharray:0 100}}@keyframes notify-msg_success{0%{stroke:#4eb127}to{stroke:#4eb127;stroke-dasharray:0 100}}@-webkit-keyframes notify-msg_warning{0%{stroke:#fcbc0b}to{stroke:#fcbc0b;stroke-dasharray:0 100}}@keyframes notify-msg_warning{0%{stroke:#fcbc0b}to{stroke:#fcbc0b;stroke-dasharray:0 100}}@-webkit-keyframes notify-msg_error{0%{stroke:#eb262d}to{stroke:#eb262d;stroke-dasharray:0 100}}@keyframes notify-msg_error{0%{stroke:#eb262d}to{stroke:#eb262d;stroke-dasharray:0 100}}.notify-msg-fade-in{-webkit-animation:notify-msg-fade .2s ease-out both;animation:notify-msg-fade .2s ease-out both}.notify-msg-fade-out{animation:notify-msg-fade .3s linear reverse both}@-webkit-keyframes notify-msg-fade{0%{opacity:0;transform:translate(-50%,0);transform:translate3d(-50%,-80%,0)}to{opacity:1;transform:translate(-50%,0);transform:translate3d(-50%,0,0)}}@keyframes notify-msg-fade{0%{opacity:0;transform:translate(-50%,0);transform:translate3d(-50%,-80%,0)}to{opacity:1;transform:translate(-50%,0);transform:translate3d(-50%,0,0)}}.notify-msg-fade-in-b{-webkit-animation:notify-msg-fade-b .2s ease-out both;animation:notify-msg-fade-b .2s ease-out both}.notify-msg-fade-out-b{animation:notify-msg-fade-b .3s linear reverse both}@-webkit-keyframes notify-msg-fade-b{0%{opacity:0;transform:translate(-50%,0);transform:translate3d(-50%,80%,0)}to{opacity:1;transform:translate(-50%,0);transform:translate3d(-50%,0,0)}}@keyframes notify-msg-fade-b{0%{opacity:0;transform:translate(-50%,0);transform:translate3d(-50%,80%,0)}to{opacity:1;transform:translate(-50%,0);transform:translate3d(-50%,0%,0)}}.notify-msg.notify-msg-alert,.notify-msg.notify-msg-confirm{display:block;box-shadow:0 0 6px 2px rgba(0,0,0,.1);background-color:#fff;border:1px solid #ccc}.bounceIn,.bounceOut{-webkit-animation-duration:.45s;-moz-animation-duration:.45s;-o-animation-duration:.45s;animation-duration:.45s}@keyframes bounceIn{0%{opacity:0;filter:alpha(opacity=0)}100%{opacity:1;filter:alpha(opacity=100)}}.bounceIn{-webkit-animation-name:bounceIn;-moz-animation-name:bounceIn;-o-animation-name:bounceIn;animation-name:bounceIn}@keyframes bounceOut{0%{opacity:1;filter:alpha(opacity=100)}100%{opacity:0;filter:alpha(opacity=0)}}.bounceOut{-webkit-animation-name:bounceOut;-moz-animation-name:bounceOut;-o-animation-name:bounceOut;animation-name:bounceOut}.notify-none{display:none}.notify-modal{z-index: 99891014;left:0;top:0;width:100%;height:100%;background:#000;opacity:0.6;filter:alpha(opacity=60);position:fixed;transition:height .3s ease,padding .3s ease}\n        ";
             _css.innerHTML = cssStr;
 
             if (head.children.length) {
                 head.insertBefore(_css, head.children[0]);
             } else {
                 head.appendChild(_css);
             }
         }
     }
 
     return notify;
 });
