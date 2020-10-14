<<<<<<< HEAD

/**
 * webSocket帮助类自动加入心跳检测
 * @Author: xiaozhilong
 * 
 * 用法: msgData是服务器返回的消息 heartCheckTimeOut是心跳检测 间隔时间 单位 毫秒 reconnectTimeOut断线重连间 隔时间 单位 毫秒
 * <script src="webSocketHelp.js"></script>
 * var url = "ws://127.0.0.1:2020";
 * var wsh = new WebSocketHelp(url, function () {
 *  console.log("这是服务器发送过来的消息:" + wsh.msgData);
 * });
 * wsh.heartCheckTimeOut = 3000;
 * wsh.reconnectTimeOut = 1000 * 5;
 * 
 */
var WebSocketHelp = /** @class */ (function () {
    function WebSocketHelp(url, messageCallback, heartCheckTimeOut, reconnectTimeOut) {
        if (heartCheckTimeOut === void 0) { heartCheckTimeOut = 3000; }
        if (reconnectTimeOut === void 0) { reconnectTimeOut = 4000; }
        this.lockReconnect = false;
        this.path = url;
        this.heartCheckTimeOut = heartCheckTimeOut;
        this.reconnectTimeOut = reconnectTimeOut;
        this._messageCallback = messageCallback;
        try {
            this.ws = new WebSocket(url);
            this.Init(messageCallback);
        }
        catch (error) {
            //打印异常
            console.log(error.message);
            this.Reconnect(url);
        }
    }
    //初始化
    WebSocketHelp.prototype.Init = function (messageCallback) {
        var _this = this;
        //打开链接
        this.ws.onopen = function () {
            console.log("打开链接");
            _this.HeartCheck();
        };
        //接收消息
        this.ws.onmessage = function (msg) {
            //判断是否是二进制数据
            if (msg.data instanceof Blob) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var content = reader.result;
                    _this.msgData = content;
                    if (typeof messageCallback == "function") {
                        messageCallback();
                    }
                };
                var data = reader.readAsText(msg.data);
            }
            else {
                _this.msgData = msg.data;
                if (typeof messageCallback == "function") {
                    messageCallback();
                }
            }
            _this.HeartCheck();
        };
        //关闭链接
        this.ws.onclose = function () {
            console.log('关闭链接');
            _this.Reconnect(_this.path);
        };
        //发生异常
        this.ws.onerror = function () {
            console.log('发生异常了');
            _this.Reconnect(_this.path);
        };
    };
    //重连
    WebSocketHelp.prototype.Reconnect = function (url) {
        var _this = this;
        if (this.lockReconnect) {
            return;
        }
        ;
        this.lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多 4秒
        this.tt && clearTimeout(this.tt);
        this.tt = setTimeout(function () {
            new WebSocketHelp(url, _this._messageCallback);
            _this.lockReconnect = false;
        }, this.reconnectTimeOut);
    };
    //心跳检测
    WebSocketHelp.prototype.HeartCheck = function () {
        var _this = this;
        var self = this;
        this.heartCheckTimeOut && clearTimeout(this.heartCheckTimeOutObj);
        this.heartCheckServerTimeOutObj && clearTimeout(this.heartCheckServerTimeOutObj);
        this.heartCheckTimeOutObj = setTimeout(function () {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            _this.ws.send("ping");
            self.heartCheckServerTimeOutObj = setTimeout(function () {
            }, self.heartCheckTimeOut);
        }, this.heartCheckTimeOut);
    };
    return WebSocketHelp;
}());
=======

/**
 * webSocket帮助类自动加入心跳检测
 * @Author: xiaozhilong
 * 
 * 用法: msgData是服务器返回的消息 heartCheckTimeOut是心跳检测 间隔时间 单位 毫秒 reconnectTimeOut断线重连间 隔时间 单位 毫秒
 * <script src="webSocketHelp.js"></script>
 * var url = "ws://127.0.0.1:2020";
 * var wsh = new WebSocketHelp(url, function () {
 *  console.log("这是服务器发送过来的消息:" + wsh.msgData);
 * });
 * wsh.heartCheckTimeOut = 3000;
 * wsh.reconnectTimeOut = 1000 * 5;
 * 
 */
var WebSocketHelp = /** @class */ (function () {
    function WebSocketHelp(url, messageCallback, heartCheckTimeOut, reconnectTimeOut) {
        if (heartCheckTimeOut === void 0) { heartCheckTimeOut = 3000; }
        if (reconnectTimeOut === void 0) { reconnectTimeOut = 4000; }
        this.lockReconnect = false;
        this.path = url;
        this.heartCheckTimeOut = heartCheckTimeOut;
        this.reconnectTimeOut = reconnectTimeOut;
        this._messageCallback = messageCallback;
        try {
            this.ws = new WebSocket(url);
            this.Init(messageCallback);
        }
        catch (error) {
            //打印异常
            console.log(error.message);
            this.Reconnect(url);
        }
    }
    //初始化
    WebSocketHelp.prototype.Init = function (messageCallback) {
        var _this = this;
        //打开链接
        this.ws.onopen = function () {
            console.log("打开链接");
            _this.HeartCheck();
        };
        //接收消息
        this.ws.onmessage = function (msg) {
            //判断是否是二进制数据
            if (msg.data instanceof Blob) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var content = reader.result;
                    _this.msgData = content;
                    if (typeof messageCallback == "function") {
                        messageCallback();
                    }
                };
                var data = reader.readAsText(msg.data);
            }
            else {
                _this.msgData = msg.data;
                if (typeof messageCallback == "function") {
                    messageCallback();
                }
            }
            _this.HeartCheck();
        };
        //关闭链接
        this.ws.onclose = function () {
            console.log('关闭链接');
            _this.Reconnect(_this.path);
        };
        //发生异常
        this.ws.onerror = function () {
            console.log('发生异常了');
            _this.Reconnect(_this.path);
        };
    };
    //重连
    WebSocketHelp.prototype.Reconnect = function (url) {
        var _this = this;
        if (this.lockReconnect) {
            return;
        }
        ;
        this.lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多 4秒
        this.tt && clearTimeout(this.tt);
        this.tt = setTimeout(function () {
            new WebSocketHelp(url, _this._messageCallback);
            _this.lockReconnect = false;
        }, this.reconnectTimeOut);
    };
    //心跳检测
    WebSocketHelp.prototype.HeartCheck = function () {
        var _this = this;
        var self = this;
        this.heartCheckTimeOut && clearTimeout(this.heartCheckTimeOutObj);
        this.heartCheckServerTimeOutObj && clearTimeout(this.heartCheckServerTimeOutObj);
        this.heartCheckTimeOutObj = setTimeout(function () {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            _this.ws.send("ping");
            self.heartCheckServerTimeOutObj = setTimeout(function () {
            }, self.heartCheckTimeOut);
        }, this.heartCheckTimeOut);
    };
    return WebSocketHelp;
}());
>>>>>>> 6ec7e298e48cdc16edba451b72ea1e2ec97897b6
