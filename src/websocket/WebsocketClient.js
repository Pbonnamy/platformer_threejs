import {authorize, createSession, queryHeadsets, requestAccess, subscribe} from "./WebsocketRequests";
import {onEventReceived} from "../platformer/platformer";

export class WebsocketClient {
    constructor() {
        this.socket = null;
        this.token = null;
        this.headSet = null;
        this.session = null;
        this.connect('wss://localhost:6868');
    }

    //connect to websocket
    connect(url) {
        this.socket = new WebSocket(url);

        //websocket connected
        this.socket.onopen = async () => {
            console.log('websocket connected');

            //request access
            await this.send(requestAccess);

            //request token
            const resToken = await this.send(authorize);
            this.token = resToken.result.cortexToken;

            //retrieve mental commands
            await this.retrieveMentalCommand();
        }

        //websocket disconnected
        this.socket.onclose = () => {
            console.log('websocket disconnected');
        }

        //websocket error
        this.socket.onerror = (event) => {
            console.log('websocket error: ', event);
        }
    }

    //send message to websocket
    async send(message) {
        return new Promise((resolve, reject) => {
            //send message
            this.socket.send(JSON.stringify(message));

            //handle response
            this.socket.onmessage = (event) => {
                console.log('websocket message: ', event.data);
                resolve(JSON.parse(event.data));
            }
        })
    }

    //handle mental commands
    handleSubscribedData() {
        this.socket.onmessage = (event) => {
            const command = JSON.parse(event.data);
            console.log('websocket message: ', command);

            //com = mental command channel
            if (command.com) {
                const commandName = command.com[0];
                const intensity = command.com[1];

                //handle mental command for platformer
                onEventReceived(commandName, intensity);
            }
        }
    }

    //retrieve mental commands
    async retrieveMentalCommand() {
        //retrieve headset
        const resHeadset = await this.send(queryHeadsets);
        this.headSet = resHeadset.result[0].id;

        //create session
        const resSession = await this.send(createSession(this.token, this.headSet));
        this.session = resSession.result.id;

        //subscribe to mental commands and handle them
        await this.send(subscribe(this.token, this.session, ['com']));
        this.handleSubscribedData();
    }
}