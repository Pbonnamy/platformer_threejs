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