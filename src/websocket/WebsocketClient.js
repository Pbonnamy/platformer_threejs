import {authorize, requestAccess} from "./WebsocketRequests";

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

            await this.send(requestAccess);

            const resToken = await this.send(authorize);
            this.token = resToken.result.cortexToken;
        }

        this.socket.onclose = () => {
            console.log("websocket closed")
        }

        this.socket.onerror = (event) => {
            console.log("websocket error :", event)
        }
    }

    async send(message) {
        return new Promise((resolve, reject) => {
            this.socket.send(JSON.stringify(message));
            this.socket.onmessage = (event) => {
                console.log('websocket message: ', event.data);
                resolve(JSON.parse(event.data));
            }
        })
    }
}