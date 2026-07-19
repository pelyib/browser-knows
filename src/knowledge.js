export function create(body, tags, favicon = null) {
    return {
        body: body,
        tags: tags,
        favicon: favicon,
    };
}
