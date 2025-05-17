export function getHostEndpoint() {
    const { protocol, hostname } = window.location; // Use `hostname` instead of `host`
    console.log("Protocol:", protocol);
    console.log("Hostname:", hostname);
    return `${protocol}//${hostname}`;
}
