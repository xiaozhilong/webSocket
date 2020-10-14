<<<<<<< HEAD
/**
 * 心跳机制
 */
class Heart {
    //心跳计时器
    heartTimeout = 0;
    //心跳计时器
    serverHeartTimeout = 0;
    //间隔时间
    timeout: number;
    /**
     *
     */
    constructor() {
        //设置间隔时间5s
        this.timeout = 5000;
    }
    //重置
    reset() {
        clearTimeout(this.heartTimeout);
        clearTimeout(this.serverHeartTimeout);
        return this;
    }
    //启动心跳
    start(cb: CallableFunction): void {
        this.heartTimeout = setTimeout(() => {
            cb();
            this.serverHeartTimeout = setTimeout(() => {
                cb();
                //重新开始检测
                this.reset().start(cb());
            }, this.timeout);
        }, this.timeout);
    }
}
//配置参数
interface options {
    url: string;
    hearTime?: number;//心跳时间间隔
    heartMsg?: string;//心跳信息
    isReconnect?: boolean;//是否自动重连
    isRestory?: boolean;//是否销毁
    reconnectTime?: number;//重连时间间隔
    reconnectCount?: number;//重连次数 -1 则不限制
    openCb?: CallableFunction;//连接成功的回调
    closeCb?: CallableFunction;//关闭的回调
    messageCb?: CallableFunction;//消息的回调
    errorCb?: CallableFunction;//错误的回调
}
class Socket extends Heart {
    ws!: WebSocket;
    reConnecTimer!: number;//重连计时器
    // reConnecCount = 10;//变量保存,防止丢失
    options: options = {
        url: "",
        hearTime: 0,
        heartMsg: "ping",//心跳信息
        isReconnect: true,//是否自动重连
        isRestory: false,//是否销毁
        reconnectTime: 5000,//重连时间间隔
        reconnectCount: -1,//重连次数 -1 则不限制
        openCb: (event: Event) => { console.log("连接成功" + event) },
        closeCb: (event: Event) => { console.log("连接关闭" + event) },
        messageCb: (data: string) => { console.log("接收消息为:" + data) },
        errorCb: (event: Event) => { console.log("错误信息" + event) }
    };
    constructor(ops: options) {
        super();
        // Object.assign(this.options, ops)
        this.create();
    }
    //建立连接
    create() {
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
        this.onclose()
        this.onmessage()
    }
    /**
     * 自定义连接成功事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    onopen(callback?: CallableFunction) {
        
        this.ws.onopen = (event) => {
            clearTimeout(this.reConnecTimer);//清除重连定时器
            // this.options.reconnectCount = this.reConnecCount;//计数器重置
            //建立心跳机制
            super.reset().start(() => {
                this.send(this.options.heartMsg as string);
            });
            if (typeof callback === "function") {
                callback(event)
            } else {
                (typeof this.options.openCb === "function") && this.options.openCb(event)
            }

        }
    }
    /**
     * 自定义关闭事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback  回调函数
     */
    onclose(callback?: CallableFunction) {
        
        this.ws.onclose = (event) => {
            super.reset();
            !this.options.isRestory && this.onreconnect()
            if (typeof callback === "function") {
                callback(event);
            } else {
                (typeof this.options.closeCb === "function") && this.options.closeCb(event)
            }
        }
    }
    /**
     * 自定义错误事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    onerror(callback?: CallableFunction) {
        
        this.ws.onerror = (event) => {
            if (typeof callback === "function") {
                callback(event)
            } else {
                (typeof this.options.errorCb === "function") && this.options.errorCb(event)
            }
        }
    }
    /**
     * 自定义消息监听事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    onmessage(callback?: CallableFunction) {
        
        this.ws.onmessage = (event) => {
            //收到任何消息,重新开始倒计时心跳检测
            super.reset().start(() => {
                this.send(this.options.heartMsg as string);
            })
            if (typeof callback === "function") {
                callback(event.data)
            } else {
                (typeof this.options.messageCb === "function") && this.options.messageCb(event.data)
            }
        }
    }
    /**
     * 自定义发送消息
     * @param data 发送的信息 
     */
    send(data: string) {
        
        if (this.ws.readyState !== this.ws.OPEN) {
            new Error("没有连接到服务器,无法推送信息");
            return;
        }
        this.ws.send(data);
    }
    /**
     * 连接事件
     */
    onreconnect() {
        
        if (this.options.reconnectCount as number > 0 || this.options.reconnectCount === -1) {
            this.options.reconnectTime = setTimeout(() => {
                this.create();
                if (this.options.reconnectCount !== -1) {
                    (this.options.reconnectCount as number)--;
                }
            }, this.options.reconnectTime);
        } else {
            clearTimeout(this.options.reconnectTime);
            // this.options.reconnectCount = this.reConnecCount;
        }
    }
    /**
     * 销毁
     */
    destroy() {
        super.reset();
        clearTimeout(this.reConnecTimer);//清除重连定时器
        this.options.isRestory = true;
        this.ws.close();
    }
    
}

//-------------示例
let options: options = {
    url: "ws://192.168.1.9:2020",
    hearTime: 0,
    heartMsg: "ping",//心跳信息
    isReconnect: true,//是否自动重连
    isRestory: false,//是否销毁
    reconnectTime: 1000,//重连时间间隔
    reconnectCount: -1,//重连次数 -1 则不限制
    openCb: (event: Event) => { console.log("连接成功" + event) },
    closeCb: (event: Event) => { console.log("连接关闭" + event) },
    messageCb: (data: string) => { console.log("接收消息为:" + data) },
    errorCb: (event: Event) => { console.log("错误信息" + event) }
};
=======
/**
 * 心跳机制
 */
class Heart {
    //心跳计时器
    heartTimeout = 0;
    //心跳计时器
    serverHeartTimeout = 0;
    //间隔时间
    timeout: number;
    /**
     *
     */
    constructor() {
        //设置间隔时间5s
        this.timeout = 5000;
    }
    //重置
    reset() {
        clearTimeout(this.heartTimeout);
        clearTimeout(this.serverHeartTimeout);
        return this;
    }
    //启动心跳
    start(cb: CallableFunction): void {
        this.heartTimeout = setTimeout(() => {
            cb();
            this.serverHeartTimeout = setTimeout(() => {
                cb();
                //重新开始检测
                this.reset().start(cb());
            }, this.timeout);
        }, this.timeout);
    }
}
//配置参数
interface options {
    url: string;
    hearTime?: number;//心跳时间间隔
    heartMsg?: string;//心跳信息
    isReconnect?: boolean;//是否自动重连
    isRestory?: boolean;//是否销毁
    reconnectTime?: number;//重连时间间隔
    reconnectCount?: number;//重连次数 -1 则不限制
    openCb?: CallableFunction;//连接成功的回调
    closeCb?: CallableFunction;//关闭的回调
    messageCb?: CallableFunction;//消息的回调
    errorCb?: CallableFunction;//错误的回调
}
class Socket extends Heart {
    ws!: WebSocket;
    reConnecTimer!: number;//重连计时器
    // reConnecCount = 10;//变量保存,防止丢失
    options: options = {
        url: "",
        hearTime: 0,
        heartMsg: "ping",//心跳信息
        isReconnect: true,//是否自动重连
        isRestory: false,//是否销毁
        reconnectTime: 5000,//重连时间间隔
        reconnectCount: -1,//重连次数 -1 则不限制
        openCb: (event: Event) => { console.log("连接成功" + event) },
        closeCb: (event: Event) => { console.log("连接关闭" + event) },
        messageCb: (data: string) => { console.log("接收消息为:" + data) },
        errorCb: (event: Event) => { console.log("错误信息" + event) }
    };
    constructor(ops: options) {
        super();
        // Object.assign(this.options, ops)
        this.create();
    }
    //建立连接
    create() {
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
        this.onclose()
        this.onmessage()
    }
    /**
     * 自定义连接成功事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    onopen(callback?: CallableFunction) {
        
        this.ws.onopen = (event) => {
            clearTimeout(this.reConnecTimer);//清除重连定时器
            // this.options.reconnectCount = this.reConnecCount;//计数器重置
            //建立心跳机制
            super.reset().start(() => {
                this.send(this.options.heartMsg as string);
            });
            if (typeof callback === "function") {
                callback(event)
            } else {
                (typeof this.options.openCb === "function") && this.options.openCb(event)
            }

        }
    }
    /**
     * 自定义关闭事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback  回调函数
     */
    onclose(callback?: CallableFunction) {
        
        this.ws.onclose = (event) => {
            super.reset();
            !this.options.isRestory && this.onreconnect()
            if (typeof callback === "function") {
                callback(event);
            } else {
                (typeof this.options.closeCb === "function") && this.options.closeCb(event)
            }
        }
    }
    /**
     * 自定义错误事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    onerror(callback?: CallableFunction) {
        
        this.ws.onerror = (event) => {
            if (typeof callback === "function") {
                callback(event)
            } else {
                (typeof this.options.errorCb === "function") && this.options.errorCb(event)
            }
        }
    }
    /**
     * 自定义消息监听事件
     * 如果callback存在，调用callback，不存在调用options中的回调
     * @param callback 回调函数
     */
    onmessage(callback?: CallableFunction) {
        
        this.ws.onmessage = (event) => {
            //收到任何消息,重新开始倒计时心跳检测
            super.reset().start(() => {
                this.send(this.options.heartMsg as string);
            })
            if (typeof callback === "function") {
                callback(event.data)
            } else {
                (typeof this.options.messageCb === "function") && this.options.messageCb(event.data)
            }
        }
    }
    /**
     * 自定义发送消息
     * @param data 发送的信息 
     */
    send(data: string) {
        
        if (this.ws.readyState !== this.ws.OPEN) {
            new Error("没有连接到服务器,无法推送信息");
            return;
        }
        this.ws.send(data);
    }
    /**
     * 连接事件
     */
    onreconnect() {
        
        if (this.options.reconnectCount as number > 0 || this.options.reconnectCount === -1) {
            this.options.reconnectTime = setTimeout(() => {
                this.create();
                if (this.options.reconnectCount !== -1) {
                    (this.options.reconnectCount as number)--;
                }
            }, this.options.reconnectTime);
        } else {
            clearTimeout(this.options.reconnectTime);
            // this.options.reconnectCount = this.reConnecCount;
        }
    }
    /**
     * 销毁
     */
    destroy() {
        super.reset();
        clearTimeout(this.reConnecTimer);//清除重连定时器
        this.options.isRestory = true;
        this.ws.close();
    }
    
}

//-------------示例
let options: options = {
    url: "ws://192.168.1.9:2020",
    hearTime: 0,
    heartMsg: "ping",//心跳信息
    isReconnect: true,//是否自动重连
    isRestory: false,//是否销毁
    reconnectTime: 1000,//重连时间间隔
    reconnectCount: -1,//重连次数 -1 则不限制
    openCb: (event: Event) => { console.log("连接成功" + event) },
    closeCb: (event: Event) => { console.log("连接关闭" + event) },
    messageCb: (data: string) => { console.log("接收消息为:" + data) },
    errorCb: (event: Event) => { console.log("错误信息" + event) }
};
>>>>>>> 6ec7e298e48cdc16edba451b72ea1e2ec97897b6
let ws = new Socket(options)