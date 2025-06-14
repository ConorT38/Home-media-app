export function getHostEndpoint() {
    const { protocol, hostname } = window.location; // Use `hostname` instead of `host`
    console.log("Protocol:", protocol);
    console.log("Hostname:", hostname);
    return `${protocol}//${hostname}`;
    //return 'http://192.168.0.23'
}

export function getHostAPIEndpoint() {
    return `${getHostEndpoint()}:8081/api`;
}

export function getCdnHostEndpoint() {
    return 'http://192.168.0.23:8000';
    //return `${getHostEndpoint()}:8000`
}

export   const scrollContainer = (containerId: string, direction: "left" | "right") => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
