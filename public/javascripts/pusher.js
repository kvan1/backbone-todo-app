/*!
 * Pusher JavaScript Library v1.8.3
 * http://pusherapp.com/
 *
 * Copyright 2010, New Bamboo
 * Released under the MIT licence.
 */

if(typeof Function.prototype.scopedTo=="undefined")Function.prototype.scopedTo=function(a,b){var c=this;return function(){return c.apply(a,Array.prototype.slice.call(b||[]).concat(Array.prototype.slice.call(arguments)))}};
var Pusher=function(a,b){this.options=b||{};this.path="/app/"+a+"?client=js&version="+Pusher.VERSION;this.key=a;this.channels=new Pusher.Channels;this.global_channel=new Pusher.Channel("pusher_global_channel");this.global_channel.global=true;this.connected=this.secure=false;this.retry_counter=0;this.encrypted=this.options.encrypted?true:false;Pusher.isReady&&this.connect();Pusher.instances.push(this);this.bind("pusher:connection_established",function(c){this.connected=true;this.retry_counter=0;this.socket_id=
c.socket_id;this.subscribeAll()}.scopedTo(this));this.bind("pusher:connection_disconnected",function(){for(var c in this.channels.channels)this.channels.channels[c].disconnect()}.scopedTo(this));this.bind("pusher:error",function(c){Pusher.log("Pusher : error : "+c.message)})};Pusher.instances=[];
Pusher.prototype={channel:function(a){return this.channels.find(a)},connect:function(){var a=this.encrypted||this.secure?"wss://"+Pusher.host+":"+Pusher.wss_port+this.path:"ws://"+Pusher.host+":"+Pusher.ws_port+this.path;Pusher.allow_reconnect=true;Pusher.log("Pusher : connecting : "+a);var b=this;if(window.WebSocket){var c=new WebSocket(a),d=Pusher.connection_timeout+b.retry_counter*1E3,e=window.setTimeout(function(){Pusher.log("Pusher : connection timeout after "+d+"ms");c.close()},d);c.onmessage=
function(){b.onmessage.apply(b,arguments)};c.onclose=function(){window.clearTimeout(e);b.onclose.apply(b,arguments)};c.onopen=function(){window.clearTimeout(e);b.onopen.apply(b,arguments)};this.connection=c}else{this.connection={};setTimeout(function(){b.send_local_event("pusher:connection_failed",{})},0)}},toggle_secure:function(){if(this.secure==false){this.secure=true;Pusher.log("Pusher : switching to wss:// connection")}else{this.secure=false;Pusher.log("Pusher : switching to ws:// connection")}},
disconnect:function(){Pusher.log("Pusher : disconnecting");Pusher.allow_reconnect=false;this.retry_counter=0;this.connection.close()},bind:function(a,b){this.global_channel.bind(a,b);return this},bind_all:function(a){this.global_channel.bind_all(a);return this},subscribeAll:function(){for(var a in this.channels.channels)this.channels.channels.hasOwnProperty(a)&&this.subscribe(a)},subscribe:function(a){var b=this.channels.add(a,this);this.connected&&b.authorize(this,function(c){this.send_event("pusher:subscribe",
{channel:a,auth:c.auth,channel_data:c.channel_data})}.scopedTo(this));return b},unsubscribe:function(a){this.channels.remove(a);this.connected&&this.send_event("pusher:unsubscribe",{channel:a})},send_event:function(a,b,c){Pusher.log("Pusher : event sent (channel,event,data) : ",c,a,b);a={event:a,data:b};if(c)a.channel=c;this.connection.send(JSON.stringify(a));return this},send_local_event:function(a,b,c){b=Pusher.data_decorator(a,b);if(c)(c=this.channel(c))&&c.dispatch_with_all(a,b);else Pusher.log("Pusher : event recd (event,data) :",
a,b);this.global_channel.dispatch_with_all(a,b)},onmessage:function(a){a=JSON.parse(a.data);if(!(a.socket_id&&a.socket_id==this.socket_id)){if(typeof a.data=="string")a.data=Pusher.parser(a.data);this.send_local_event(a.event,a.data,a.channel)}},reconnect:function(){var a=this;setTimeout(function(){a.connect()},0)},retry_connect:function(){this.encrypted||this.toggle_secure();var a=Math.min(this.retry_counter*1E3,1E4);Pusher.log("Pusher : Retrying connection in "+a+"ms");var b=this;setTimeout(function(){b.connect()},
a);this.retry_counter+=1},onclose:function(){this.global_channel.dispatch("close",null);Pusher.log("Pusher : Socket closed");if(this.connected){this.send_local_event("pusher:connection_disconnected",{});if(Pusher.allow_reconnect){Pusher.log("Pusher : Connection broken, trying to reconnect");this.reconnect()}}else{this.send_local_event("pusher:connection_failed",{});this.retry_connect()}this.connected=false},onopen:function(){this.global_channel.dispatch("open",null)}};
Pusher.Util={extend:function(a,b){for(var c in b)a[c]=b[c];return a}};Pusher.VERSION="1.8.3";Pusher.host="ws.pusherapp.com";Pusher.ws_port=80;Pusher.wss_port=443;Pusher.channel_auth_endpoint="/pusher/auth";Pusher.connection_timeout=5E3;Pusher.cdn_http="http://js.pusherapp.com/";Pusher.cdn_https="https://d3ds63zw57jt09.cloudfront.net/";Pusher.log=function(){};Pusher.data_decorator=function(a,b){return b};Pusher.allow_reconnect=true;Pusher.channel_auth_transport="ajax";
Pusher.parser=function(a){try{return JSON.parse(a)}catch(b){Pusher.log("Pusher : data attribute not valid JSON - you may wish to implement your own Pusher.parser");return a}};Pusher.isReady=false;Pusher.ready=function(){Pusher.isReady=true;for(var a=0;a<Pusher.instances.length;a++)Pusher.instances[a].connected||Pusher.instances[a].connect()};Pusher.Channels=function(){this.channels={}};
Pusher.Channels.prototype={add:function(a,b){var c=this.find(a);if(c)return c;else{c=Pusher.Channel.factory(a,b);return this.channels[a]=c}},find:function(a){return this.channels[a]},remove:function(a){delete this.channels[a]}};Pusher.Channel=function(a,b){this.pusher=b;this.name=a;this.callbacks={};this.global_callbacks=[];this.subscribed=false};
Pusher.Channel.prototype={init:function(){},disconnect:function(){},acknowledge_subscription:function(){this.subscribed=true},bind:function(a,b){this.callbacks[a]=this.callbacks[a]||[];this.callbacks[a].push(b);return this},bind_all:function(a){this.global_callbacks.push(a);return this},trigger:function(a,b){this.pusher.send_event(a,b,this.name);return this},dispatch_with_all:function(a,b){this.name!="pusher_global_channel"&&Pusher.log("Pusher : event recd (channel,event,data)",this.name,a,b);this.dispatch(a,
b);this.dispatch_global_callbacks(a,b)},dispatch:function(a,b){var c=this.callbacks[a];if(c)for(var d=0;d<c.length;d++)c[d](b);else this.global||Pusher.log("Pusher : No callbacks for "+a)},dispatch_global_callbacks:function(a,b){for(var c=0;c<this.global_callbacks.length;c++)this.global_callbacks[c](a,b)},is_private:function(){return false},is_presence:function(){return false},authorize:function(a,b){b({})}};Pusher.auth_callbacks={};
Pusher.authorizers={ajax:function(a,b){var c=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");c.open("POST",Pusher.channel_auth_endpoint,true);c.setRequestHeader("Content-Type","application/x-www-form-urlencoded");c.onreadystatechange=function(){if(c.readyState==4)if(c.status==200){var d=Pusher.parser(c.responseText);b(d)}else Pusher.log("Couldn't get auth info from your webapp"+status)};c.send("socket_id="+encodeURIComponent(a.socket_id)+"&channel_name="+encodeURIComponent(this.name))},
jsonp:function(a,b){var c="socket_id="+encodeURIComponent(a.socket_id)+"&channel_name="+encodeURIComponent(this.name),d=document.createElement("script");Pusher.auth_callbacks[this.name]=b;d.src=Pusher.channel_auth_endpoint+"?callback="+encodeURIComponent("Pusher.auth_callbacks['"+this.name+"']")+"&"+c;c=document.getElementsByTagName("head")[0]||document.documentElement;c.insertBefore(d,c.firstChild)}};
Pusher.Channel.PrivateChannel={is_private:function(){return true},authorize:function(a,b){Pusher.authorizers[Pusher.channel_auth_transport].scopedTo(this)(a,b)}};
Pusher.Channel.PresenceChannel={init:function(){this.bind("pusher_internal:subscription_succeeded",function(a){this.acknowledge_subscription(a);this.dispatch_with_all("pusher:subscription_succeeded",this.members)}.scopedTo(this));this.bind("pusher_internal:member_added",function(a){this.dispatch_with_all("pusher:member_added",this.members.add(a.user_id,a.user_info))}.scopedTo(this));this.bind("pusher_internal:member_removed",function(a){(a=this.members.remove(a.user_id))&&this.dispatch_with_all("pusher:member_removed",
a)}.scopedTo(this))},disconnect:function(){this.members.clear()},acknowledge_subscription:function(a){this.members._members_map=a.presence.hash;this.members.count=a.presence.count;this.subscribed=true},is_presence:function(){return true},members:{_members_map:{},count:0,each:function(a){for(var b in this._members_map)a({id:b,info:this._members_map[b]})},add:function(a,b){this._members_map[a]=b;this.count++;return this.get(a)},remove:function(a){if(member=this.get(a)){delete this._members_map[a];this.count--}return member},
get:function(a){var b=this._members_map[a];return b?{id:a,info:b}:null},clear:function(){this._members_map={};this.count=0}}};Pusher.Channel.factory=function(a,b){var c=new Pusher.Channel(a,b);if(a.indexOf(Pusher.Channel.private_prefix)===0)Pusher.Util.extend(c,Pusher.Channel.PrivateChannel);else if(a.indexOf(Pusher.Channel.presence_prefix)===0){Pusher.Util.extend(c,Pusher.Channel.PrivateChannel);Pusher.Util.extend(c,Pusher.Channel.PresenceChannel)}c.init();return c};
Pusher.Channel.private_prefix="private-";Pusher.Channel.presence_prefix="presence-";
var _require=function(){var a;a=document.addEventListener?function(b,c){b.addEventListener("load",c,false)}:function(b,c){b.attachEvent("onreadystatechange",function(){if(b.readyState=="loaded"||b.readyState=="complete")c()})};return function(b,c){function d(j,i){i=i||function(){};var k=document.getElementsByTagName("head")[0],g=document.createElement("script");g.setAttribute("src",j);g.setAttribute("type","text/javascript");g.setAttribute("async",true);a(g,function(){var l=i;e++;h==e&&setTimeout(l,
0)});k.appendChild(g)}for(var e=0,h=b.length,f=0;f<h;f++)d(b[f],c)}}();
(function(){var a=(document.location.protocol=="http:"?Pusher.cdn_http:Pusher.cdn_https)+Pusher.VERSION,b=[];window.JSON==undefined&&b.push(a+"/json2.min.js");if(window.WebSocket==undefined){window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION=true;b.push(a+"/flashfallback.min.js")}var c=function(){return window.WebSocket==undefined?function(){if(window.WebSocket){window.WEB_SOCKET_SWF_LOCATION=a+"/WebSocketMain.swf";WebSocket.__addTask(function(){Pusher.ready()});WebSocket.__initialize()}else Pusher.log("Pusher : Could not connect : WebSocket is not available natively or via Flash")}:
function(){Pusher.ready()}}(),d=function(h){var f=function(){document.body?h():setTimeout(f,0)};f()},e=function(){d(c)};b.length>0?_require(b,e):e()})();
