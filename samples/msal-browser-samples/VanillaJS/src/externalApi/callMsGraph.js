// Helper function to call MS Graph API endpoint 
// using authorization bearer token scheme
export async function callMSGraph(endpoint, accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    console.log('request made to Graph API at: ' + new Date().toString());

    return fetch(endpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
}