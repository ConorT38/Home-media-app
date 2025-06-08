export function getHostEndpoint() {
    const { protocol, hostname } = window.location; // Use `hostname` instead of `host`
    console.log("Protocol:", protocol);
    console.log("Hostname:", hostname);
    // return `${protocol}//${hostname}`;
    return 'http://192.168.0.23'
}

export function getHostAPIEndpoint() {
    return `${getHostEndpoint()}:8081/api`;
}
