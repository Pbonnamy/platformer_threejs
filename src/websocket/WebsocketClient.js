export class WebsocketClient {
    constructor() {
        this.socket = null;
        this.token = null;
        this.headset = null;
        this.session = null;
        this.connect("wss://localhost:6868")
    }

    connect(url) {
        this.socket = new WebSocket(url);

        this.socket.onopen = async () => {
            console.log("websocket connected")
        }

        this.socket.onclose = () => {
            console.log("websocket closed")
        }

        this.socket.onerror = (event) => {
            console.log("websocket error :", event)
        }
    }
}