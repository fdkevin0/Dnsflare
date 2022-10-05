async function handleRequest(request) {
    const { origin, pathname, searchParams } = new URL(request.url);
    const param = searchParams.toString() ? "?" + searchParams.toString() : "";
    const requestHeaders = request.headers.get("Access-Control-Request-Headers");
    const requestMethod = request.headers.get("Access-Control-Request-Method");
    const requestOrigin = request.headers.get("Origin") ? request.headers.get("Origin") : origin;

    // 响应预检请求
    if (request.method == "OPTIONS") {
        return new Response('{"Access": "OPTIONS"}', {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "https://cf.fdke.vin",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": requestHeaders ? requestHeaders : "*",
                "Access-Control-Allow-Methods": requestMethod ? requestMethod : "*",
                "Content-Type": "application/json"
            }
        });
    }

    // 处理正式请求
    const newRequest = new Request("https://api.cloudflare.com" + pathname.replace('/api', '') + param, request);
    // 请求头删除来源
    newRequest.headers.set("referrer-policy", "no-referrer");
    newRequest.headers.delete("Referer");
    newRequest.headers.delete("Origin");
    // 发起请求
    const response = await fetch(newRequest);
    const newResponse = new Response(response.body, response);

    // 处理响应
    newResponse.headers.set("Access-Control-Allow-Origin", requestOrigin ? requestOrigin : "*");
    newResponse.headers.set("Access-Control-Allow-Credentials", "true");
    newResponse.headers.set("Access-Control-Allow-Headers", requestHeaders ? requestHeaders : "*");
    newResponse.headers.set("Access-Control-Allow-Methods", requestMethod ? requestMethod : "*");
    newResponse.headers.set('Access-Control-Expose-Headers', '*');
    newResponse.headers.set("Content-Type", "application/json");
    return newResponse;
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
})