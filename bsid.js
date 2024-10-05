import axios from 'axios';  // Use import instead of require

let bsid = '';

export default async () => {  // Use export default
    if (bsid === '') {
        let request = await axios.get('https://play.blooket.com/');
        bsid = request.headers['set-cookie'][0].split(';')[0];
    }

    return bsid;
};
