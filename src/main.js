import {main} from "./platformer/platformer";
import {WebsocketClient} from "./websocket/WebsocketClient";

//create THREE.js environment
main();

//Retrieve & handle mental commands using Emotiv Websocket API
new WebsocketClient();