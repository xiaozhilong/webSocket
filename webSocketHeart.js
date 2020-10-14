<<<<<<< HEAD
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * 心跳机制
 */
var Heart = /** @class */ (function () {
    /**
     *
     */
    function Heart() {
        //心跳计时器
        this.heartTimeout = 0;
        //心跳计时器
        this.serverHeartTimeout = 0;
        //设置间隔时间5s
        this.timeout = 5000;
    }
    //重置
    Heart.prototype.reset = function () {
        clearTimeout(this.heartTimeout);
        clearTimeout(this.serverHeartTimeout);
        return this;
    };
    //启动心跳
    Heart.prototype.start = function (cb) {
        var _this = this;
        this.heartTimeout = setTimeout(function () {
            cb();
            _this.serverHeartTimeout = setTimeout(function () {
                cb();
                //重新开始检测
                _this.reset().start(cb());
            }, _this.timeout);
        }, this.timeout);
    };
    return Heart;
}());
var Socket = /** @class */ (function (_super) {
    __extends(Socket, _super);
    function Socket(ops) {
        var _this = _super.call(this) || this;
        // reConnecCount = 10;//变量保存,防止丢失
        _this.options = {
            url: "",
            hearTime: 0,
            heartMsg: "ping",
            isReconnect: true,
            isRestory: false,
            reconnectTime: 5000,
            reconnectCount: -1,
            // openCb: function (event) { console.log("连接成功" + event); },
            // closeCb: function (event) { console.log("连接关闭" + event); },
            // messageCb: function (data) { console.log("接收消息为:" + data); },
            // errorCb: function (event) { console.log("错误信息" + event); }
        };
        _this.setOptions(ops);
        _this.create();
        return _this;
    }
    //建立连接
    Socket.prototype.create = function () {
        if (!("WebSocket" in window)) {
            new Error("当前浏览器不支持,无法使用");
            return;
        }
        if (!this.options.url) {
            new Error("地址不存在,无法建立通道");
            return;
        }
        this.ws = new WebSocket(this.options.url);
        this.onopen();
        this.onclose();
        this.onmessage();
    };
    /**
     * 自定义连接成功事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    Socket.prototype.onopen = function (callback) {
        var _this = this;
        this.ws.onopen = function (event) {
            clearTimeout(_this.reConnecTimer); //清除重连定时器
            // this.options.reconnectCount = this.reConnecCount;//计数器重置
            //建立心跳机制
            _super.prototype.reset.call(_this).start(function () {
                _this.send(_this.options.heartMsg);
            });
            if (typeof callback === "function") {
                callback(event);
            }
            else {
                (typeof _this.options.openCb === "function") && _this.options.openCb(event);
            }
        };
    };
    /**
     * 自定义关闭事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback  回调函数
     */
    Socket.prototype.onclose = function (callback) {
        var _this = this;
        this.ws.onclose = function (event) {
            _super.prototype.reset.call(_this);
            !_this.options.isRestory && _this.onreconnect();
            if (typeof callback === "function") {
                callback(event);
            }
            else {
                (typeof _this.options.closeCb === "function") && _this.options.closeCb(event);
            }
        };
    };
    /**
     * 自定义错误事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    Socket.prototype.onerror = function (callback) {
        var _this = this;
        this.ws.onerror = function (event) {
            if (typeof callback === "function") {
                callback(event);
            }
            else {
                (typeof _this.options.errorCb === "function") && _this.options.errorCb(event);
            }
        };
    };
    /**
     * 自定义消息监听事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    Socket.prototype.onmessage = function (callback) {
        var _this = this;
        this.ws.onmessage = function (event) {
            //收到任何消息,重新开始倒计时心跳检测
            _super.prototype.reset.call(_this).start(function () {
                _this.send(_this.options.heartMsg);
            });
            if (typeof callback === "function") {
                callback(event.data);
            }
            else {
                (typeof _this.options.messageCb === "function") && _this.options.messageCb(event.data);
            }
        };
    };
    /**
     * 自定义发送消息
     * @param data 发送的信息
     */
    Socket.prototype.send = function (data) {
        if (this.ws.readyState !== this.ws.OPEN) {
            new Error("没有连接到服务器,无法推送信息");
            return;
        }
        this.ws.send(data);
    };
    /**
     * 连接事件
     */
    Socket.prototype.onreconnect = function () {
        var _this = this;
        if (this.options.reconnectCount > 0 || this.options.reconnectCount === -1) {
            this.options.reconnectTime = setTimeout(function () {
                _this.create();
                if (_this.options.reconnectCount !== -1) {
                    _this.options.reconnectCount--;
                }
            }, this.options.reconnectTime);
        }
        else {
            clearTimeout(this.options.reconnectTime);
            // this.options.reconnectCount = this.reConnecCount;
        }
    };
    /**
     * 销毁
     */
    Socket.prototype.destroy = function () {
        _super.prototype.reset.call(this);
        clearTimeout(this.reConnecTimer); //清除重连定时器
        this.options.isRestory = true;
        this.ws.close();
    };
    Socket.prototype.setOptions=function(opts){
        var _this = this;
        if (!opts) {
            return;
        }
        for (var p in opts) {
            if (opts.hasOwnProperty(p)) {
                _this.options[p] = opts[p];
            }
        }
    }
    return Socket;
}(Heart));
//-------------示例
debugger
var options = {
    url: "ws://192.168.1.9:2020",
    hearTime: 0,
    heartMsg: "ping",
    isReconnect: true,
    isRestory: false,
    reconnectTime: 5000,
    reconnectCount: -1,
    openCb: function (event) { console.log("连接成功" + event); },
    closeCb: function (event) { console.log("连接关闭" + event); },
    messageCb: function (data) { console.log("接收消息为:" + data); },
    errorCb: function (event) { console.log("错误信息" + event); }
};
var ws = new Socket(options);
ws.timeout=1*1000;
/**
 * 浏览器版本兼容问题
 * Chrome
 * Firefox
 * IE >= 10
 * Sarafi >= 6
 * Android >= 4.4
 * iOS >= 8
=======
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * 心跳机制
 */
var Heart = /** @class */ (function () {
    /**
     *
     */
    function Heart() {
        //心跳计时器
        this.heartTimeout = 0;
        //心跳计时器
        this.serverHeartTimeout = 0;
        //设置间隔时间5s
        this.timeout = 5000;
    }
    //重置
    Heart.prototype.reset = function () {
        clearTimeout(this.heartTimeout);
        clearTimeout(this.serverHeartTimeout);
        return this;
    };
    //启动心跳
    Heart.prototype.start = function (cb) {
        var _this = this;
        this.heartTimeout = setTimeout(function () {
            cb();
            _this.serverHeartTimeout = setTimeout(function () {
                cb();
                //重新开始检测
                _this.reset().start(cb());
            }, _this.timeout);
        }, this.timeout);
    };
    return Heart;
}());
var Socket = /** @class */ (function (_super) {
    __extends(Socket, _super);
    function Socket(ops) {
        var _this = _super.call(this) || this;
        // reConnecCount = 10;//变量保存,防止丢失
        _this.options = {
            url: "",
            hearTime: 0,
            heartMsg: "ping",
            isReconnect: true,
            isRestory: false,
            reconnectTime: 5000,
            reconnectCount: -1,
            // openCb: function (event) { console.log("连接成功" + event); },
            // closeCb: function (event) { console.log("连接关闭" + event); },
            // messageCb: function (data) { console.log("接收消息为:" + data); },
            // errorCb: function (event) { console.log("错误信息" + event); }
        };
        _this.setOptions(ops);
        _this.create();
        return _this;
    }
    //建立连接
    Socket.prototype.create = function () {
        if (!("WebSocket" in window)) {
            new Error("当前浏览器不支持,无法使用");
            return;
        }
        if (!this.options.url) {
            new Error("地址不存在,无法建立通道");
            return;
        }
        this.ws = new WebSocket(this.options.url);
        this.onopen();
        this.onclose();
        this.onmessage();
    };
    /**
     * 自定义连接成功事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    Socket.prototype.onopen = function (callback) {
        var _this = this;
        this.ws.onopen = function (event) {
            clearTimeout(_this.reConnecTimer); //清除重连定时器
            // this.options.reconnectCount = this.reConnecCount;//计数器重置
            //建立心跳机制
            _super.prototype.reset.call(_this).start(function () {
                _this.send(_this.options.heartMsg);
            });
            if (typeof callback === "function") {
                callback(event);
            }
            else {
                (typeof _this.options.openCb === "function") && _this.options.openCb(event);
            }
        };
    };
    /**
     * 自定义关闭事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback  回调函数
     */
    Socket.prototype.onclose = function (callback) {
        var _this = this;
        this.ws.onclose = function (event) {
            _super.prototype.reset.call(_this);
            !_this.options.isRestory && _this.onreconnect();
            if (typeof callback === "function") {
                callback(event);
            }
            else {
                (typeof _this.options.closeCb === "function") && _this.options.closeCb(event);
            }
        };
    };
    /**
     * 自定义错误事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    Socket.prototype.onerror = function (callback) {
        var _this = this;
        this.ws.onerror = function (event) {
            if (typeof callback === "function") {
                callback(event);
            }
            else {
                (typeof _this.options.errorCb === "function") && _this.options.errorCb(event);
            }
        };
    };
    /**
     * 自定义消息监听事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    Socket.prototype.onmessage = function (callback) {
        var _this = this;
        this.ws.onmessage = function (event) {
            //收到任何消息,重新开始倒计时心跳检测
            _super.prototype.reset.call(_this).start(function () {
                _this.send(_this.options.heartMsg);
            });
            if (typeof callback === "function") {
                callback(event.data);
            }
            else {
                (typeof _this.options.messageCb === "function") && _this.options.messageCb(event.data);
            }
        };
    };
    /**
     * 自定义发送消息
     * @param data 发送的信息
     */
    Socket.prototype.send = function (data) {
        if (this.ws.readyState !== this.ws.OPEN) {
            new Error("没有连接到服务器,无法推送信息");
            return;
        }
        this.ws.send(data);
    };
    /**
     * 连接事件
     */
    Socket.prototype.onreconnect = function () {
        var _this = this;
        if (this.options.reconnectCount > 0 || this.options.reconnectCount === -1) {
            this.options.reconnectTime = setTimeout(function () {
                _this.create();
                if (_this.options.reconnectCount !== -1) {
                    _this.options.reconnectCount--;
                }
            }, this.options.reconnectTime);
        }
        else {
            clearTimeout(this.options.reconnectTime);
            // this.options.reconnectCount = this.reConnecCount;
        }
    };
    /**
     * 销毁
     */
    Socket.prototype.destroy = function () {
        _super.prototype.reset.call(this);
        clearTimeout(this.reConnecTimer); //清除重连定时器
        this.options.isRestory = true;
        this.ws.close();
    };
    Socket.prototype.setOptions=function(opts){
        var _this = this;
        if (!opts) {
            return;
        }
        for (var p in opts) {
            if (opts.hasOwnProperty(p)) {
                _this.options[p] = opts[p];
            }
        }
    }
    return Socket;
}(Heart));
//-------------示例
debugger
var options = {
    url: "ws://192.168.1.9:2020",
    hearTime: 0,
    heartMsg: "ping",
    isReconnect: true,
    isRestory: false,
    reconnectTime: 5000,
    reconnectCount: -1,
    openCb: function (event) { console.log("连接成功" + event); },
    closeCb: function (event) { console.log("连接关闭" + event); },
    messageCb: function (data) { console.log("接收消息为:" + data); },
    errorCb: function (event) { console.log("错误信息" + event); }
};
var ws = new Socket(options);
ws.timeout=1*1000;
/**
 * 浏览器版本兼容问题
 * Chrome
 * Firefox
 * IE >= 10
 * Sarafi >= 6
 * Android >= 4.4
 * iOS >= 8
>>>>>>> 6ec7e298e48cdc16edba451b72ea1e2ec97897b6
 */