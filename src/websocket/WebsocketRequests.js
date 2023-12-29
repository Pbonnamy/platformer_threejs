export const requestAccess = {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "requestAccess",
    "params": {
        "clientId": import.meta.env.VITE_CLIENT_ID,
        "clientSecret": import.meta.env.VITE_CLIENT_SECRET
    }
}


export const authorize = {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "authorize",
    "params": {
        "clientId": import.meta.env.VITE_CLIENT_ID,
        "clientSecret": import.meta.env.VITE_CLIENT_SECRET,
    }
}

export const queryHeadsets = {
    "id": 1,
    "jsonrpc": "2.0",
    "method": "queryHeadsets"
}

export const createSession = (token, headset) => {
    return {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "createSession",
        "params": {
            "cortexToken": token,
            "headset": headset,
            "status": "open"
        }
    }
}

export const subscribe = (token, session, streams) => {
    return {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "subscribe",
        "params": {
            "cortexToken": token,
            "session": session,
            "streams": streams
        }
    }
}