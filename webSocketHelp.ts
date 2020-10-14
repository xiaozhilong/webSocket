/**
 * webSocket帮助类自动加入心跳检测
 * @Author: xiaozhilong
 */
class WebSocketHelp {
    private lockReconnect = false;
    private tt: any;//绑定时间
    private ws!: WebSocket;
    private path: string;
    private _messageCallback: Function;
    private heartCheckTimeOut: number;
    private reconnectTimeOut: number;
    heartCheckTimeOutObj: any;
    heartCheckServerTimeOutObj: any;
    public msgData: any;
    constructor(url: string, messageCallback: Function, heartCheckTimeOut: number = 3000, reconnectTimeOut: number = 4000) {
        this.path = url;
        this.heartCheckTimeOut = heartCheckTimeOut;
        this.reconnectTimeOut = reconnectTimeOut;
        this._messageCallback = messageCallback;
        try {
            this.ws = new WebSocket(url);
            this.Init(messageCallback);
        } catch (error) {
            //打印异常
            console.log(error.message);
            this.Reconnect(url);
        }
    }
    //初始化
    Init(messageCallback: Function) {
        //打开链接
        this.ws.onopen = () => {
            console.log("打开链接");
            this.HeartCheck();
        };
        //接收消息
        this.ws.onmessage = (msg) => {
            //判断是否是二进制数据
            if (msg.data instanceof Blob) {
                var reader = new FileReader();
                reader.onload = (event) => {
                    var content = reader.result;
                    this.msgData = content;
                    if (typeof messageCallback == "function") {
                        messageCallback();
                    }
                }
                var data = reader.readAsText(msg.data);
            }
            else {
                this.msgData = msg.data;
                if (typeof messageCallback == "function") {
                    messageCallback();
                }
            }
            this.HeartCheck();

        };
        //关闭链接
        this.ws.onclose = () => {
            console.log('关闭链接');
            this.Reconnect(this.path);
        };
        //发生异常
        this.ws.onerror = () => {
            console.log('发生异常了');
            this.Reconnect(this.path);
        }
    }
    //重连
    Reconnect(url: string) {
        if (this.lockReconnect) {
            return;
        };
        this.lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多 
        this.tt && clearTimeout(this.tt);
        this.tt = setTimeout(() => {
            new WebSocketHelp(url, this._messageCallback);
            this.lockReconnect = false;
        }, this.reconnectTimeOut);
    }
    //心跳检测
    HeartCheck() {
        var self = this;
        this.heartCheckTimeOut && clearTimeout(this.heartCheckTimeOutObj);
        this.heartCheckServerTimeOutObj && clearTimeout(this.heartCheckServerTimeOutObj);
        this.heartCheckTimeOutObj = setTimeout(() => {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            this.ws.send("ping");
            self.heartCheckServerTimeOutObj = setTimeout(() => {
            }, self.heartCheckTimeOut);
        }, this.heartCheckTimeOut)
    }

}

let url = "ws://127.0.0.1:2020";
var wsh = new WebSocketHelp(url, () => {
    console.log("回调函数" + wsh.msgData);
    if (wsh.msgData === "ping") {
        console.log("true");
    } else {
        console.log("false");
    }
});

