const VEMETRIC_ENDPOINT = 'https://favicon.vemetric.com/';

export async function resolveFavicon(hostname) {
    try {
        const response = await fetch(`${VEMETRIC_ENDPOINT}${hostname}?response=json&size=64&format=webp`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.sourceUrl || data.url || null;
    } catch (error) {
        console.log(error);
        return null;
    }
}
